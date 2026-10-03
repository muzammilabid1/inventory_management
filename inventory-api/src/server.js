import "dotenv/config";
import app from "./app.js";
import { initializeDatabase, pool } from "./config/database.js";

const port = Number(process.env.API_PORT || 4000);
await initializeDatabase();
const server = app.listen(port, () => console.log(`Inventory API listening at http://localhost:${port}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close();
    await pool.end();
    process.exit(0);
  });
}
