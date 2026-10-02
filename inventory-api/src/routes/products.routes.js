import { Router } from "express";
import { pool } from "../config/database.js";
import { requireAuth } from "../security/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { productBody, productIdParams } from "../validation/schemas.js";

const router = Router();

router.get("/api/products", requireAuth, async (request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT
         products.id,
         products.name,
         products.sku,
         products.description,
         categories.name AS category,
         products.price,
         products.quantity AS stock,
         products.low_stock_threshold AS "lowStockThreshold",
         products.created_at AS "createdAt",
         CASE
           WHEN products.quantity = 0 THEN 'Out of Stock'
           WHEN products.quantity <= products.low_stock_threshold THEN 'Low Stock'
           ELSE 'In Stock'
         END AS status
       FROM products
       JOIN categories
         ON categories.id = products.category_id
        AND categories.user_id = products.user_id
       WHERE products.user_id = $1
       ORDER BY products.created_at DESC, products.id DESC`,
      [request.userId],
    );

    response.json({ products: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post("/api/products", requireAuth, validateBody(productBody), async (request, response, next) => {
  const { name, sku, description, category, price, quantity, lowStockThreshold } = request.body;
  try {
    const categoryResult = await pool.query(
      `SELECT id FROM categories
       WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
      [request.userId, category],
    );

    if (categoryResult.rowCount === 0) {
      return response.status(400).json({ error: "That category was not found in your account. Please choose one of your categories." });
    }

    const result = await pool.query(
      `INSERT INTO products
         (user_id, category_id, name, sku, description, price, quantity, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, sku, description, price, quantity AS stock,
                 low_stock_threshold AS "lowStockThreshold", created_at AS "createdAt"`,
      [
        request.userId,
        categoryResult.rows[0].id,
        name,
        sku,
        description,
        price,
        quantity,
        lowStockThreshold,
      ],
    );

    response.status(201).json({ product: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({ error: "A product with this SKU already exists in your account." });
    }
    next(error);
  }
});

router.get("/api/products/:id", requireAuth, validateParams(productIdParams), async (request, response, next) => {
  const productId = request.params.id;

  try {
    const result = await pool.query(
      `SELECT
         products.id,
         products.name,
         products.sku,
         products.description,
         categories.name AS category,
         products.price,
         products.quantity AS stock,
         products.low_stock_threshold AS "lowStockThreshold",
         products.created_at AS "createdAt",
         CASE
           WHEN products.quantity = 0 THEN 'Out of Stock'
           WHEN products.quantity <= products.low_stock_threshold THEN 'Low Stock'
           ELSE 'In Stock'
         END AS status
       FROM products
       JOIN categories
         ON categories.id = products.category_id
        AND categories.user_id = products.user_id
       WHERE products.user_id = $1 AND products.id = $2`,
      [request.userId, productId],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Product not found." });
    }

    response.json({ product: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put("/api/products/:id", requireAuth, validateParams(productIdParams), validateBody(productBody), async (request, response, next) => {
  const productId = request.params.id;
  const { name, sku, description, category, price, quantity, lowStockThreshold } = request.body;

  try {
    const categoryResult = await pool.query(
      `SELECT id FROM categories
       WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
      [request.userId, category],
    );

    if (categoryResult.rowCount === 0) {
      return response.status(400).json({ error: "That category was not found in your account. Please choose one of your categories." });
    }

    const result = await pool.query(
      `UPDATE products
       SET category_id = $1,
           name = $2,
           sku = $3,
           description = $4,
           price = $5,
           quantity = $6,
           low_stock_threshold = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8 AND id = $9
       RETURNING id`,
      [
        categoryResult.rows[0].id,
        name,
        sku,
        description,
        price,
        quantity,
        lowStockThreshold,
        request.userId,
        productId,
      ],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Product not found." });
    }

    response.json({ message: "Product updated." });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({ error: "A product with this SKU already exists in your account." });
    }
    next(error);
  }
});

router.delete("/api/products/:id", requireAuth, validateParams(productIdParams), async (request, response, next) => {
  const productId = request.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE user_id = $1 AND id = $2 RETURNING id",
      [request.userId, productId],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Product not found." });
    }

    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});



export default router;
