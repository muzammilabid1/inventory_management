import { Router } from "express";
import { AppDataSource } from "../config/database.js";
import { Category } from "../db/entities.js";
import { requireAuth } from "../security/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { categoryBody, categoryIdParams } from "../validation/schemas.js";

const router = Router();
const driverCode = (error) => error.code || error.driverError?.code;

router.post("/api/categories", requireAuth, validateBody(categoryBody), async (request, response, next) => {
  try {
    const repository = AppDataSource.getRepository(Category);
    const category = repository.create({ userId: request.userId, ...request.body });
    await repository.save(category);
    response.status(201).json({ category: { id: category.id, name: category.name, description: category.description, productCount: 0 } });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A category with this name already exists." });
    next(error);
  }
});

router.get("/api/categories", requireAuth, async (request, response, next) => {
  try {
    const categories = await AppDataSource.getRepository(Category)
      .createQueryBuilder("category")
      .leftJoin("products", "product", "product.category_id = category.id AND product.user_id = category.user_id")
      .select("category.id", "id")
      .addSelect("category.name", "name")
      .addSelect("category.description", "description")
      .addSelect("COUNT(product.id)::int", "productCount")
      .where("category.user_id = :userId", { userId: request.userId })
      .groupBy("category.id")
      .orderBy("category.name", "ASC")
      .getRawMany();
    response.json({ categories });
  } catch (error) { next(error); }
});

router.get("/api/categories/:id", requireAuth, validateParams(categoryIdParams), async (request, response, next) => {
  try {
    const category = await AppDataSource.getRepository(Category)
      .createQueryBuilder("category")
      .leftJoin("products", "product", "product.category_id = category.id AND product.user_id = category.user_id")
      .select("category.id", "id")
      .addSelect("category.name", "name")
      .addSelect("category.description", "description")
      .addSelect("category.created_at", "createdAt")
      .addSelect("COUNT(product.id)::int", "productCount")
      .where("category.user_id = :userId AND category.id = :id", { userId: request.userId, id: request.params.id })
      .groupBy("category.id")
      .getRawOne();
    if (!category) return response.status(404).json({ error: "Category not found." });
    response.json({ category });
  } catch (error) { next(error); }
});

router.put("/api/categories/:id", requireAuth, validateParams(categoryIdParams), validateBody(categoryBody), async (request, response, next) => {
  try {
    const repository = AppDataSource.getRepository(Category);
    const category = await repository.findOneBy({ userId: request.userId, id: request.params.id });
    if (!category) return response.status(404).json({ error: "Category not found." });
    category.name = request.body.name;
    category.description = request.body.description;
    await repository.save(category);
    response.json({ category: { id: category.id, name: category.name, description: category.description, createdAt: category.createdAt } });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A category with this name already exists." });
    next(error);
  }
});

router.delete("/api/categories/:id", requireAuth, validateParams(categoryIdParams), async (request, response, next) => {
  try {
    const result = await AppDataSource.getRepository(Category).delete({ userId: request.userId, id: request.params.id });
    if (!result.affected) return response.status(404).json({ error: "Category not found." });
    response.sendStatus(204);
  } catch (error) {
    if (driverCode(error) === "23503") return response.status(409).json({ error: "This category contains products. Move or delete those products before deleting the category." });
    next(error);
  }
});

export default router;
