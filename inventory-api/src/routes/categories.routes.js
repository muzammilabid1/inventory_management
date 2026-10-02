import { Router } from "express";
import { pool } from "../config/database.js";
import { requireAuth } from "../security/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { categoryBody, categoryIdParams } from "../validation/schemas.js";

const router = Router();

router.post("/api/categories", requireAuth, validateBody(categoryBody), async (request, response, next) => {
  const { name, description } = request.body;
  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, 0 AS "productCount"`,
      [request.userId, name, description],
    );
    response.status(201).json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({ error: "A category with this name already exists." });
    }
    next(error);
  }
});

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

router.get("/api/categories/:id", requireAuth, validateParams(categoryIdParams), async (request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.created_at AS "createdAt",
              COUNT(p.id)::int AS "productCount"
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.user_id = c.user_id
       WHERE c.user_id = $1 AND c.id = $2
       GROUP BY c.id`,
      [request.userId, request.params.id],
    );
    if (!result.rowCount) return response.status(404).json({ error: "Category not found." });
    response.json({ category: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put("/api/categories/:id", requireAuth, validateParams(categoryIdParams), validateBody(categoryBody), async (request, response, next) => {
  const { name, description } = request.body;
  try {
    const result = await pool.query(
      `UPDATE categories
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND id = $4
       RETURNING id, name, description, created_at AS "createdAt"`,
      [name, description, request.userId, request.params.id],
    );
    if (!result.rowCount) return response.status(404).json({ error: "Category not found." });
    response.json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({ error: "A category with this name already exists." });
    }
    next(error);
  }
});

router.delete("/api/categories/:id", requireAuth, validateParams(categoryIdParams), async (request, response, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE user_id = $1 AND id = $2 RETURNING id",
      [request.userId, request.params.id],
    );
    if (!result.rowCount) return response.status(404).json({ error: "Category not found." });
    response.sendStatus(204);
  } catch (error) {
    if (error.code === "23503") {
      return response.status(409).json({ error: "This category contains products. Move or delete those products before deleting the category." });
    }
    next(error);
  }
});

export default router;
