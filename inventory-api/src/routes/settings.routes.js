import { Router } from "express";
import { AppDataSource } from "../config/database.js";
import { OrganizationSettings } from "../db/entities.js";
import { requireAuth } from "../security/auth.js";
import { validateBody } from "../middleware/validate.js";
import { organizationSettingsBody } from "../validation/schemas.js";

const router = Router();

router.get("/api/settings", requireAuth, async (request, response, next) => {
  try {
    const settings = await AppDataSource.getRepository(OrganizationSettings).findOneBy({ userId: request.userId });
    response.json({
      settings: settings
        ? { organizationName: settings.organizationName, phone: settings.phone, address: settings.address }
        : { organizationName: "", phone: "", address: "" },
    });
  } catch (error) { next(error); }
});

router.put("/api/settings", requireAuth, validateBody(organizationSettingsBody), async (request, response, next) => {
  try {
    const repository = AppDataSource.getRepository(OrganizationSettings);
    await repository.save(repository.create({ userId: request.userId, ...request.body }));
    response.json({ settings: request.body });
  } catch (error) { next(error); }
});

export default router;
