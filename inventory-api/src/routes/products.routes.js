import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../config/database.js";
import { categories, products } from "../db/schema.js";
import { requireAuth } from "../security/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { productBody, productIdParams } from "../validation/schemas.js";

const router = Router();
const driverCode = (error) => error.code || error.cause?.code || error.driverError?.code;

const productFields = {
  id: products.id,
  name: products.name,
  sku: products.sku,
  description: products.description,
  category: categories.name,
  price: products.price,
  stock: products.quantity,
  lowStockThreshold: products.lowStockThreshold,
  createdAt: products.createdAt,
  status: sql`CASE
    WHEN ${products.quantity} = 0 THEN 'Out of Stock'
    WHEN ${products.quantity} <= ${products.lowStockThreshold} THEN 'Low Stock'
    ELSE 'In Stock'
  END`.as("status"),
};

async function findProducts(userId, productId) {
  const filters = [eq(products.userId, BigInt(userId))];
  if (productId !== undefined) filters.push(eq(products.id, BigInt(productId)));

  const rows = await db
    .select(productFields)
    .from(products)
    .innerJoin(
      categories,
      and(
        eq(categories.id, products.categoryId),
        eq(categories.userId, products.userId),
      ),
    )
    .where(and(...filters))
    .orderBy(desc(products.createdAt), desc(products.id));

  return rows.map((product) => ({ ...product, id: String(product.id) }));
}

router.get("/api/products", requireAuth, async (request, response, next) => {
  try {
    const products = await findProducts(request.userId);
    response.json({ products });
  } catch (error) { next(error); }
});

router.post("/api/products", requireAuth, validateBody(productBody), async (request, response, next) => {
  const { name, sku, description, category, price, quantity, lowStockThreshold } = request.body;
  try {
    const [categoryRecord] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(
        eq(categories.userId, BigInt(request.userId)),
        sql`lower(${categories.name}) = lower(${category})`,
      ))
      .limit(1);

    if (!categoryRecord) return response.status(400).json({ error: "That category was not found in your account. Please choose one of your categories." });

    const [product] = await db
      .insert(products)
      .values({
        userId: BigInt(request.userId),
        categoryId: categoryRecord.id,
        name,
        sku,
        description,
        price,
        quantity,
        lowStockThreshold,
      })
      .returning({
        id: products.id,
        name: products.name,
        sku: products.sku,
        description: products.description,
        price: products.price,
        stock: products.quantity,
        lowStockThreshold: products.lowStockThreshold,
        createdAt: products.createdAt,
      });

    response.status(201).json({ product: { ...product, id: String(product.id) } });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A product with this SKU already exists in your account." });
    next(error);
  }
});

router.get("/api/products/:id", requireAuth, validateParams(productIdParams), async (request, response, next) => {
  try {
    const [product] = await findProducts(request.userId, request.params.id);
    if (!product) return response.status(404).json({ error: "Product not found." });
    response.json({ product });
  } catch (error) { next(error); }
});

router.put("/api/products/:id", requireAuth, validateParams(productIdParams), validateBody(productBody), async (request, response, next) => {
  const { name, sku, description, category, price, quantity, lowStockThreshold } = request.body;
  try {
    const [categoryRecord] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(
        eq(categories.userId, BigInt(request.userId)),
        sql`lower(${categories.name}) = lower(${category})`,
      ))
      .limit(1);

    if (!categoryRecord) return response.status(400).json({ error: "That category was not found in your account. Please choose one of your categories." });

    const [product] = await db
      .update(products)
      .set({
        categoryId: categoryRecord.id,
        name,
        sku,
        description,
        price,
        quantity,
        lowStockThreshold,
        updatedAt: new Date(),
      })
      .where(and(
        eq(products.userId, BigInt(request.userId)),
        eq(products.id, BigInt(request.params.id)),
      ))
      .returning({ id: products.id });

    if (!product) return response.status(404).json({ error: "Product not found." });
    response.json({ message: "Product updated." });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A product with this SKU already exists in your account." });
    next(error);
  }
});

router.delete("/api/products/:id", requireAuth, validateParams(productIdParams), async (request, response, next) => {
  try {
    const deleted = await db
      .delete(products)
      .where(and(
        eq(products.userId, BigInt(request.userId)),
        eq(products.id, BigInt(request.params.id)),
      ))
      .returning({ id: products.id });

    if (deleted.length === 0) return response.status(404).json({ error: "Product not found." });
    response.sendStatus(204);
  } catch (error) { next(error); }
});

export default router;
