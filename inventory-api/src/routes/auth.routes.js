import { randomUUID } from "node:crypto";
import { Router } from "express";
import { pool } from "../config/database.js";
import { accessTokenDurationSeconds, clearAuthCookies, createOneTimeCode, createRefreshToken, createResetToken, getRefreshToken, hashOneTimeValue, hashPassword, requireAuth, setAuthCookies, verifyPassword } from "../security/auth.js";
import { requireEmailDelivery, sendAuthCodeEmail } from "../services/email.js";
import { validateBody } from "../middleware/validate.js";
import { emailBody, loginBody, registerBody, resetCodeBody, resetPasswordBody, verifyCodeBody } from "../validation/schemas.js";

const router = Router();

// Registration and sign in
router.post("/api/auth/register", validateBody(registerBody), requireEmailDelivery, async (request, response, next) => {
  const { fullName, email, password } = request.body;
  const client = await pool.connect();
  let transactionCommitted = false;

  try {
    await client.query("BEGIN");
    const passwordHash = await hashPassword(password);
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name AS "fullName", email`,
      [fullName, email, passwordHash],
    );
    const user = userResult.rows[0];

    const code = createOneTimeCode();
    await client.query("DELETE FROM auth_challenges WHERE user_id = $1 AND purpose = 'register'", [user.id]);
    await client.query(
      "INSERT INTO auth_challenges (user_id, purpose, code_hash, expires_at) VALUES ($1, 'register', $2, NOW() + INTERVAL '10 minutes')",
      [user.id, hashOneTimeValue(code)],
    );
    await client.query("COMMIT");
    transactionCommitted = true;
    try {
      await sendAuthCodeEmail({ to: user.email, purpose: "register", code, expiryMinutes: 10 });
    } catch (deliveryError) {
      console.error("Registration email could not be delivered:", deliveryError.message);
      return response.status(503).json({
        error: "Your account was created, but we could not send the verification code. Check the Gmail email configuration and submit the same details to request another code.",
        ...(process.env.NODE_ENV === "production" ? {} : { debug: deliveryError.message }),
      });
    }
    response.status(202).json({ challengeRequired: true, email: user.email, message: "Enter the verification code sent to your email." });
  } catch (error) {
    if (!transactionCommitted) await client.query("ROLLBACK");
    if (error.code === "23505") {
      try {
        const existingResult = await pool.query(
          `SELECT u.id, u.email, u.password_hash
           FROM users u
           WHERE u.email = $1
             AND u.email_verified_at IS NULL`,
          [email],
        );
        const pendingUser = existingResult.rows[0];
        if (pendingUser && await verifyPassword(password, pendingUser.password_hash)) {
          const retryCode = createOneTimeCode();
          await pool.query("DELETE FROM auth_challenges WHERE user_id = $1 AND purpose = 'register'", [pendingUser.id]);
          await pool.query(
            "INSERT INTO auth_challenges (user_id, purpose, code_hash, expires_at) VALUES ($1, 'register', $2, NOW() + INTERVAL '10 minutes')",
            [pendingUser.id, hashOneTimeValue(retryCode)],
          );
          await sendAuthCodeEmail({ to: pendingUser.email, purpose: "register", code: retryCode, expiryMinutes: 10 });
          return response.status(202).json({ challengeRequired: true, email: pendingUser.email, message: "Enter the verification code sent to your email." });
        }
      } catch (deliveryError) {
        console.error("Registration retry email could not be delivered:", deliveryError.message);
        return response.status(503).json({
          error: "The verification code could not be sent. Check the Gmail email configuration and try again.",
          ...(process.env.NODE_ENV === "production" ? {} : { debug: deliveryError.message }),
        });
      }
      return response.status(409).json({ error: "An account with this email already exists." });
    }
    next(error);
  } finally {
    client.release();
  }
});

router.post("/api/auth/login", validateBody(loginBody), async (request, response, next) => {
  const { email, password } = request.body;
  try {
    const result = await pool.query(
      `SELECT id, full_name AS "fullName", email, password_hash, email_verified_at
       FROM users WHERE email = $1`,
      [email],
    );
    const user = result.rows[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    if (!user.email_verified_at) {
      return response.status(403).json({ error: "Verify your email to finish creating your account. Return to registration and submit the same details to request a new code." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const familyId = randomUUID();
      const refreshToken = createRefreshToken();
      const family = await client.query(
        "INSERT INTO refresh_token_families (id, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days') RETURNING expires_at",
        [familyId, user.id],
      );
      await client.query(
        "INSERT INTO refresh_tokens (family_id, token_hash) VALUES ($1, $2)",
        [familyId, hashOneTimeValue(refreshToken)],
      );
      await client.query("COMMIT");

      const refreshExpiresAt = new Date(family.rows[0].expires_at).getTime();
      const refreshMaxAge = Math.max(0, Math.floor((refreshExpiresAt - Date.now()) / 1000));
      setAuthCookies(response, user.id, refreshToken, refreshMaxAge);
      response.json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Email code verification completes registration and starts the first session.
router.post("/api/auth/verify-code", validateBody(verifyCodeBody), async (request, response, next) => {
  const { email, code, purpose } = request.body;
  if (purpose !== "register") {
    return response.status(400).json({ error: "Sign in with your email and password. Login codes are no longer used." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT c.id AS challenge_id, c.code_hash, c.attempts, u.id, u.full_name AS "fullName", u.email
       FROM auth_challenges c JOIN users u ON u.id = c.user_id
       WHERE u.email = $1 AND c.purpose = $2 AND c.expires_at > NOW()
       ORDER BY c.created_at DESC LIMIT 1 FOR UPDATE OF c`, [email, purpose],
    );
    const challenge = result.rows[0];
    if (!challenge || challenge.attempts >= 5 || hashOneTimeValue(code) !== challenge.code_hash) {
      if (challenge) await client.query("UPDATE auth_challenges SET attempts = attempts + 1 WHERE id = $1", [challenge.challenge_id]);
      await client.query("COMMIT");
      return response.status(400).json({ error: "That code is invalid or expired. Request a new code and try again." });
    }
    await client.query(
      "UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() WHERE id = $1",
      [challenge.id],
    );
    await client.query("DELETE FROM auth_challenges WHERE id = $1", [challenge.challenge_id]);
    const familyId = randomUUID();
    const refreshToken = createRefreshToken();
    const family = await client.query(
      "INSERT INTO refresh_token_families (id, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days') RETURNING expires_at",
      [familyId, challenge.id],
    );
    await client.query(
      "INSERT INTO refresh_tokens (family_id, token_hash) VALUES ($1, $2)",
      [familyId, hashOneTimeValue(refreshToken)],
    );
    await client.query("COMMIT");
    const refreshExpiresAt = new Date(family.rows[0].expires_at).getTime();
    const refreshMaxAge = Math.max(0, Math.floor((refreshExpiresAt - Date.now()) / 1000));
    setAuthCookies(response, challenge.id, refreshToken, refreshMaxAge);
    response.json({ user: { id: challenge.id, fullName: challenge.fullName, email: challenge.email } });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

router.post("/api/auth/refresh", async (request, response, next) => {
  const refreshToken = getRefreshToken(request);
  if (!refreshToken) {
    clearAuthCookies(response);
    return response.status(401).json({ error: "Please sign in again." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT t.id, t.family_id, t.revoked_at AS token_revoked_at, t.replaced_by_id,
              f.user_id, f.expires_at, f.revoked_at AS family_revoked_at
       FROM refresh_tokens t
       JOIN refresh_token_families f ON f.id = t.family_id
       JOIN users u ON u.id = f.user_id AND u.email_verified_at IS NOT NULL
       WHERE t.token_hash = $1
       FOR UPDATE OF t, f`,
      [hashOneTimeValue(refreshToken)],
    );
    const current = result.rows[0];

    if (!current) {
      await client.query("ROLLBACK");
      clearAuthCookies(response);
      return response.status(401).json({ error: "Please sign in again." });
    }

    if (current.token_revoked_at) {
      const recentlyRotated = current.replaced_by_id && Date.now() - new Date(current.token_revoked_at).getTime() < 15_000;
      if (recentlyRotated) {
        await client.query("COMMIT");
        return response.status(409).json({ error: "A newer session token was already issued." });
      }
      await client.query("UPDATE refresh_token_families SET revoked_at = COALESCE(revoked_at, NOW()) WHERE id = $1", [current.family_id]);
      await client.query("COMMIT");
      clearAuthCookies(response);
      return response.status(401).json({ error: "This session is no longer valid. Please sign in again." });
    }

    if (current.family_revoked_at || new Date(current.expires_at).getTime() <= Date.now()) {
      await client.query("UPDATE refresh_token_families SET revoked_at = COALESCE(revoked_at, NOW()) WHERE id = $1", [current.family_id]);
      await client.query("COMMIT");
      clearAuthCookies(response);
      return response.status(401).json({ error: "This session has expired. Please sign in again." });
    }

    const replacementToken = createRefreshToken();
    const replacement = await client.query(
      "INSERT INTO refresh_tokens (family_id, token_hash) VALUES ($1, $2) RETURNING id",
      [current.family_id, hashOneTimeValue(replacementToken)],
    );
    await client.query(
      "UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_id = $1 WHERE id = $2",
      [replacement.rows[0].id, current.id],
    );
    await client.query("COMMIT");

    const refreshMaxAge = Math.max(0, Math.floor((new Date(current.expires_at).getTime() - Date.now()) / 1000));
    setAuthCookies(response, current.user_id, replacementToken, refreshMaxAge);
    response.json({ expiresIn: accessTokenDurationSeconds });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

router.post("/api/auth/resend-registration-code", validateBody(emailBody), requireEmailDelivery, async (request, response, next) => {
  const { email } = request.body;
  try {
    const result = await pool.query(
      `SELECT u.id AS user_id, u.email, c.created_at FROM users u
       LEFT JOIN LATERAL (
         SELECT created_at FROM auth_challenges
         WHERE user_id = u.id AND purpose = 'register'
         ORDER BY created_at DESC LIMIT 1
       ) c ON TRUE
       WHERE u.email = $1 AND u.email_verified_at IS NULL`, [email],
    );
    const challenge = result.rows[0];
    if (!challenge) return response.json({ message: "If registration is pending, a new code will be sent shortly." });
    if (challenge.created_at && Date.now() - new Date(challenge.created_at).getTime() < 60_000) {
      return response.status(429).json({ error: "Please wait one minute before requesting another code." });
    }
    const code = createOneTimeCode();
    await pool.query("DELETE FROM auth_challenges WHERE user_id = $1 AND purpose = 'register'", [challenge.user_id]);
    await pool.query(
      "INSERT INTO auth_challenges (user_id, purpose, code_hash, expires_at) VALUES ($1, 'register', $2, NOW() + INTERVAL '10 minutes')",
      [challenge.user_id, hashOneTimeValue(code)],
    );
    await sendAuthCodeEmail({ to: challenge.email, purpose: "register", code, expiryMinutes: 10 });
    response.json({ message: "If registration is pending, a new code will be sent shortly." });
  } catch (error) { next(error); }
});

// Password recovery
router.post("/api/auth/forgot-password", validateBody(emailBody), requireEmailDelivery, async (request, response, next) => {
  const { email } = request.body;
  const generic = { message: "If an account exists for that email, we’ve sent a recovery code." };
  try {
    const result = await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);
    if (result.rowCount) {
      const user = result.rows[0];
      const code = createOneTimeCode();
      await pool.query("DELETE FROM password_resets WHERE user_id = $1", [user.id]);
      await pool.query(
        "INSERT INTO password_resets (user_id, code_hash, code_expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')",
        [user.id, hashOneTimeValue(code)],
      );
      try {
        await sendAuthCodeEmail({ to: user.email, purpose: "recovery", code, expiryMinutes: 15 });
      } catch (deliveryError) {
        // Keep the response indistinguishable from an unknown email address.
        console.error("Password recovery email could not be delivered:", deliveryError.message);
      }
    }
    response.json(generic);
  } catch (error) { next(error); }
});

router.post("/api/auth/verify-reset-code", validateBody(resetCodeBody), async (request, response, next) => {
  const { email, code } = request.body;
  try {
    const result = await pool.query(
      `SELECT r.id, r.code_hash, r.code_attempts FROM password_resets r JOIN users u ON u.id = r.user_id
       WHERE u.email = $1 AND r.code_expires_at > NOW() AND r.token_used_at IS NULL
       ORDER BY r.created_at DESC LIMIT 1`, [email],
    );
    const reset = result.rows[0];
    if (!reset || reset.code_attempts >= 5 || hashOneTimeValue(code) !== reset.code_hash) {
      if (reset) await pool.query("UPDATE password_resets SET code_attempts = code_attempts + 1 WHERE id = $1", [reset.id]);
      return response.status(400).json({ error: "That code is invalid or expired. Request a new code and try again." });
    }
    const token = createResetToken();
    await pool.query(
      "UPDATE password_resets SET reset_token_hash = $1, token_expires_at = NOW() + INTERVAL '15 minutes' WHERE id = $2",
      [hashOneTimeValue(token), reset.id],
    );
    response.json({ resetToken: token });
  } catch (error) { next(error); }
});

router.post("/api/auth/reset-password", validateBody(resetPasswordBody), async (request, response, next) => {
  const { token, password } = request.body;
  try {
    const tokenHash = hashOneTimeValue(token);
    const result = await pool.query(
      "SELECT id, user_id FROM password_resets WHERE reset_token_hash = $1 AND token_expires_at > NOW() AND token_used_at IS NULL LIMIT 1", [tokenHash],
    );
    const reset = result.rows[0];
    if (!reset) return response.status(400).json({ error: "That reset link is invalid or expired. Start again." });
    const passwordHash = await hashPassword(password);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, reset.user_id]);
    await pool.query("UPDATE password_resets SET token_used_at = NOW() WHERE id = $1", [reset.id]);
    await pool.query("UPDATE refresh_token_families SET revoked_at = COALESCE(revoked_at, NOW()) WHERE user_id = $1", [reset.user_id]);
    clearAuthCookies(response);
    response.json({ message: "Password updated. Please sign in with your new password." });
  } catch (error) { next(error); }
});

// Current session and sign out
router.get("/api/auth/me", requireAuth, async (request, response, next) => {
  try {
    const result = await pool.query('SELECT id, full_name AS "fullName", email FROM users WHERE id = $1', [request.userId]);
    if (!result.rowCount) return response.status(401).json({ error: "Please sign in to continue." });
    response.json({ user: result.rows[0] });
  } catch (error) { next(error); }
});

router.post("/api/auth/logout", async (request, response, next) => {
  const refreshToken = getRefreshToken(request);
  try {
    if (refreshToken) {
      await pool.query(
        `UPDATE refresh_token_families f
         SET revoked_at = COALESCE(f.revoked_at, NOW())
         FROM refresh_tokens t
         WHERE t.family_id = f.id AND t.token_hash = $1`,
        [hashOneTimeValue(refreshToken)],
      );
    }
    clearAuthCookies(response);
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});



export default router;
