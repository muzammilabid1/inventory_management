import { Router } from "express";
import { pool } from "../config/database.js";
import { requireAuth } from "../security/auth.js";

const router = Router();

router.get("/api/categories", requireAuth, async (request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, COUNT(p.id)::int AS "productCount"
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.user_id = c.user_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.name`,
      [request.userId],
    );
    response.json({ categories: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
