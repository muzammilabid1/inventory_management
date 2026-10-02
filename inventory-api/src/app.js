import express from "express";
import { cors } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/categories.routes.js";

const app = express();
app.use(cors);
app.use(express.json());
app.use(authRoutes);
app.use(healthRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(errorHandler);

export default app;
