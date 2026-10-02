import { Router } from "express";
import { pool } from "../config/database.js";
import { requireAuth } from "../security/auth.js";
import { validateBody } from "../middleware/validate.js";
import { organizationSettingsBody } from "../validation/schemas.js";

const router = Router();

router.get("/api/settings", requireAuth, async (request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT organization_name AS "organizationName", phone, address
       FROM organization_settings
       WHERE user_id = $1`,
      [request.userId],
    );
    response.json({
      settings: result.rows[0] || { organizationName: "", phone: "", address: "" },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/api/settings", requireAuth, validateBody(organizationSettingsBody), async (request, response, next) => {
  const { organizationName, phone, address } = request.body;
  try {
    const result = await pool.query(
      `INSERT INTO organization_settings (user_id, organization_name, phone, address)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET organization_name = EXCLUDED.organization_name,
           phone = EXCLUDED.phone,
           address = EXCLUDED.address,
           updated_at = CURRENT_TIMESTAMP
       RETURNING organization_name AS "organizationName", phone, address`,
      [request.userId, organizationName, phone, address],
    );
    response.json({ settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
