import dataSource from "../data-source.js";

try {
  await dataSource.initialize();
  const rows = await dataSource.showMigrations();
  console.log(rows ? "Pending TypeORM migrations are available." : "All TypeORM migrations have been applied.");
} catch (error) {
  console.error("Could not read TypeORM migration status:", error.message);
  process.exitCode = 1;
} finally {
  if (dataSource.isInitialized) await dataSource.destroy();
}
