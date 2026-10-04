import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { organizationSettings } from "../db/schema.js";
import { requireAuth } from "../security/auth.js";
import { validateBody } from "../middleware/validate.js";
import { organizationSettingsBody } from "../validation/schemas.js";

const router = Router();

router.get("/api/settings", requireAuth, async (request, response, next) => {
  try {
    const [settings] = await db
      .select({
        organizationName: organizationSettings.organizationName,
        phone: organizationSettings.phone,
        address: organizationSettings.address,
      })
      .from(organizationSettings)
      .where(eq(organizationSettings.userId, BigInt(request.userId)))
      .limit(1);

    response.json({
      settings: settings || { organizationName: "", phone: "", address: "" },
    });
  } catch (error) { next(error); }
});

router.put("/api/settings", requireAuth, validateBody(organizationSettingsBody), async (request, response, next) => {
  try {
    await db
      .insert(organizationSettings)
      .values({ userId: BigInt(request.userId), ...request.body })
      .onConflictDoUpdate({
        target: organizationSettings.userId,
        set: { ...request.body, updatedAt: new Date() },
      });

    response.json({ settings: request.body });
  } catch (error) { next(error); }
});

export default router;
