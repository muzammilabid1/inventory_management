import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

router.get("/api/health", (_request, response) => {
  response.json({ status: "ok", message: "Inventory API is running." });
});

router.get("/api/health/database", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", message: "Connected to PostgreSQL." });
  } catch (error) {
    next(error);
  }
});



export default router;
