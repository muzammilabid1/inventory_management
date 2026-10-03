import dataSource from "../data-source.js";

try {
  await dataSource.initialize();
  const applied = await dataSource.runMigrations();
  if (applied.length === 0) {
    console.log("Database schema is already up to date.");
  } else {
    console.log(`Applied ${applied.length} TypeORM migration(s):`);
    for (const migration of applied) console.log(`- ${migration.name}`);
  }
} catch (error) {
  console.error("TypeORM migrations failed:", error.message);
  process.exitCode = 1;
} finally {
  if (dataSource.isInitialized) await dataSource.destroy();
}
