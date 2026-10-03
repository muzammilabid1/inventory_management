import { Router } from "express";
import { AppDataSource } from "../config/database.js";
import { Category, Product } from "../db/entities.js";
import { requireAuth } from "../security/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { productBody, productIdParams } from "../validation/schemas.js";

const router = Router();
const driverCode = (error) => error.code || error.driverError?.code;

function productListQuery(userId, productId) {
  const query = AppDataSource.getRepository(Product)
    .createQueryBuilder("product")
    .innerJoin("categories", "category", "category.id = product.category_id AND category.user_id = product.user_id")
    .select("product.id", "id")
    .addSelect("product.name", "name")
    .addSelect("product.sku", "sku")
    .addSelect("product.description", "description")
    .addSelect("category.name", "category")
    .addSelect("product.price", "price")
    .addSelect("product.quantity", "stock")
    .addSelect("product.lowStockThreshold", "lowStockThreshold")
    .addSelect("product.createdAt", "createdAt")
    .addSelect("CASE WHEN product.quantity = 0 THEN 'Out of Stock' WHEN product.quantity <= product.lowStockThreshold THEN 'Low Stock' ELSE 'In Stock' END", "status")
    .where("product.user_id = :userId", { userId });
  if (productId !== undefined) query.andWhere("product.id = :productId", { productId });
  return query;
}

router.get("/api/products", requireAuth, async (request, response, next) => {
  try {
    const products = await productListQuery(request.userId)
      .orderBy("product.createdAt", "DESC")
      .addOrderBy("product.id", "DESC")
      .getRawMany();
    response.json({ products });
  } catch (error) { next(error); }
});

router.post("/api/products", requireAuth, validateBody(productBody), async (request, response, next) => {
  const { name, sku, description, category, price, quantity, lowStockThreshold } = request.body;
  try {
    const categoryRecord = await AppDataSource.getRepository(Category)
      .createQueryBuilder("category")
      .where("category.user_id = :userId AND LOWER(category.name) = LOWER(:name)", { userId: request.userId, name: category })
      .getOne();
    if (!categoryRecord) return response.status(400).json({ error: "That category was not found in your account. Please choose one of your categories." });

    const repository = AppDataSource.getRepository(Product);
    const product = repository.create({
      userId: request.userId,
      categoryId: categoryRecord.id,
      name,
      sku,
      description,
      price,
      quantity,
      lowStockThreshold,
    });
    await repository.save(product);
    response.status(201).json({
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        stock: product.quantity,
        lowStockThreshold: product.lowStockThreshold,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A product with this SKU already exists in your account." });
    next(error);
  }
});

router.get("/api/products/:id", requireAuth, validateParams(productIdParams), async (request, response, next) => {
  try {
    const product = await productListQuery(request.userId, request.params.id).getRawOne();
    if (!product) return response.status(404).json({ error: "Product not found." });
    response.json({ product });
  } catch (error) { next(error); }
});

router.put("/api/products/:id", requireAuth, validateParams(productIdParams), validateBody(productBody), async (request, response, next) => {
  const { name, sku, description, category, price, quantity, lowStockThreshold } = request.body;
  try {
    const categoryRecord = await AppDataSource.getRepository(Category)
      .createQueryBuilder("category")
      .where("category.user_id = :userId AND LOWER(category.name) = LOWER(:name)", { userId: request.userId, name: category })
      .getOne();
    if (!categoryRecord) return response.status(400).json({ error: "That category was not found in your account. Please choose one of your categories." });

    const repository = AppDataSource.getRepository(Product);
    const product = await repository.findOneBy({ userId: request.userId, id: request.params.id });
    if (!product) return response.status(404).json({ error: "Product not found." });
    Object.assign(product, { categoryId: categoryRecord.id, name, sku, description, price, quantity, lowStockThreshold });
    await repository.save(product);
    response.json({ message: "Product updated." });
  } catch (error) {
    if (driverCode(error) === "23505") return response.status(409).json({ error: "A product with this SKU already exists in your account." });
    next(error);
  }
});

router.delete("/api/products/:id", requireAuth, validateParams(productIdParams), async (request, response, next) => {
  try {
    const result = await AppDataSource.getRepository(Product).delete({ userId: request.userId, id: request.params.id });
    if (!result.affected) return response.status(404).json({ error: "Product not found." });
    response.sendStatus(204);
  } catch (error) { next(error); }
});

export default router;
