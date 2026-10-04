import { Router } from "express";
import { and, asc, count, eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { categories, products } from "../db/schema.js";
import { requireAuth } from "../security/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { categoryBody, categoryIdParams } from "../validation/schemas.js";

const router = Router();
const driverCode = (error) => error.code || error.cause?.code || error.driverError?.code;

router.post("/api/categories", requireAuth, validateBody(categoryBody), async (request, response, next) => {
  try {
    const [category] = await db
      .insert(categories)
      .values({ userId: BigInt(request.userId), ...request.body })
      .returning({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      });

    response.status(201).json({
      category: { ...category, id: String(category.id), productCount: 0 },
    });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A category with this name already exists." });
    next(error);
  }
});

router.get("/api/categories", requireAuth, async (request, response, next) => {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, and(
        eq(products.categoryId, categories.id),
        eq(products.userId, categories.userId),
      ))
      .where(eq(categories.userId, BigInt(request.userId)))
      .groupBy(categories.id, categories.name, categories.description)
      .orderBy(asc(categories.name));

    response.json({ categories: rows.map((category) => ({ ...category, id: String(category.id) })) });
  } catch (error) { next(error); }
});

router.get("/api/categories/:id", requireAuth, validateParams(categoryIdParams), async (request, response, next) => {
  try {
    const [category] = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, and(
        eq(products.categoryId, categories.id),
        eq(products.userId, categories.userId),
      ))
      .where(and(
        eq(categories.userId, BigInt(request.userId)),
        eq(categories.id, BigInt(request.params.id)),
      ))
      .groupBy(categories.id, categories.name, categories.description, categories.createdAt)
      .limit(1);

    if (!category) return response.status(404).json({ error: "Category not found." });
    response.json({ category: { ...category, id: String(category.id) } });
  } catch (error) { next(error); }
});

router.put("/api/categories/:id", requireAuth, validateParams(categoryIdParams), validateBody(categoryBody), async (request, response, next) => {
  try {
    const [category] = await db
      .update(categories)
      .set({ ...request.body, updatedAt: new Date() })
      .where(and(
        eq(categories.userId, BigInt(request.userId)),
        eq(categories.id, BigInt(request.params.id)),
      ))
      .returning({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
      });

    if (!category) return response.status(404).json({ error: "Category not found." });
    response.json({ category: { ...category, id: String(category.id) } });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A category with this name already exists." });
    next(error);
  }
});

router.delete("/api/categories/:id", requireAuth, validateParams(categoryIdParams), async (request, response, next) => {
  try {
    const deleted = await db
      .delete(categories)
      .where(and(
        eq(categories.userId, BigInt(request.userId)),
        eq(categories.id, BigInt(request.params.id)),
      ))
      .returning({ id: categories.id });

    if (deleted.length === 0) return response.status(404).json({ error: "Category not found." });
    response.sendStatus(204);
  } catch (error) {
    if (driverCode(error) === "23503") return response.status(409).json({ error: "This category contains products. Move or delete those products before deleting the category." });
    next(error);
  }
});

export default router;
