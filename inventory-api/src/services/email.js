import nodemailer from "nodemailer";
import mjml2html from "mjml";

export class EmailDeliveryError extends Error {
  statusCode = 503;
}

const gmailUser = process.env.GMAIL_USER?.trim();
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
const mailer = gmailUser && gmailAppPassword
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
    })
  : null;
const from = process.env.EMAIL_FROM?.trim() || (gmailUser ? `Inventory Management <${gmailUser}>` : "");

export function requireEmailDelivery(_request, response, next) {
  if (!mailer || !from) {
    return response.status(503).json({
      error: "Email delivery is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to inventory-api/.env, then restart the API.",
    });
  }
  next();
}

async function renderCodeEmail({ title, intro, code, expiryMinutes }) {
  const markup = `<mjml><mj-head><mj-attributes><mj-all font-family="Arial, sans-serif" /><mj-text color="#334155" font-size="16px" line-height="1.6" /></mj-attributes></mj-head><mj-body background-color="#f1f5f9"><mj-section background-color="#0f172a" padding="28px"><mj-column><mj-text color="#6ee7b7" font-size="13px" font-weight="bold" letter-spacing="2px">INVENTORY</mj-text><mj-text color="#ffffff" font-size="25px" font-weight="bold">${title}</mj-text></mj-column></mj-section><mj-section background-color="#ffffff" padding="24px"><mj-column><mj-text>${intro}</mj-text><mj-text align="center" background-color="#f0fdf4" color="#047857" font-size="34px" font-weight="bold" letter-spacing="9px" padding="22px">${code}</mj-text><mj-text>This code expires in ${expiryMinutes} minutes. If you didn’t request it, you can ignore this email.</mj-text></mj-column></mj-section><mj-section padding="16px"><mj-column><mj-text align="center" color="#64748b" font-size="12px">Inventory Management</mj-text></mj-column></mj-section></mj-body></mjml>`;
  const { html, errors } = await mjml2html(markup, { validationLevel: "soft" });
  if (errors.length) console.error("MJML email template warning:", errors[0].message);
  return html;
}

export async function sendAuthCodeEmail({ to, purpose, code, expiryMinutes = 10 }) {
  if (!mailer || !from) throw new EmailDeliveryError("Email delivery is not configured.");
  const recovery = purpose === "recovery";
  const title = recovery ? "Reset your password" : purpose === "register" ? "Verify your email" : "Your sign in code";
  const intro = recovery
    ? "We received a request to reset your Inventory account password. Enter this code to continue."
    : purpose === "register"
      ? "Enter this code in the app to verify your email address and finish creating your account."
      : "Enter this code in the app to complete your sign in.";
  try {
    const result = await mailer.sendMail({
      from,
      to,
      subject: title,
      html: await renderCodeEmail({ title, intro, code, expiryMinutes }),
    });
    return { messageId: result.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SMTP error.";
    throw new EmailDeliveryError(`Email delivery failed: ${message}`);
  }
}
