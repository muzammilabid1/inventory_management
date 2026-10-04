import "dotenv/config";
import app from "./app.js";
import { initializeDatabase, pool } from "./config/database.js";

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
await initializeDatabase();
const server = app.listen(port, "0.0.0.0", () => console.log(`Inventory API listening on port ${port}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close();
    await pool.end();
    process.exit(0);
  });
}
