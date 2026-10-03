import dataSource from "../data-source.js";

try {
  await dataSource.initialize();
  await dataSource.undoLastMigration();
  console.log("Reverted the most recently applied TypeORM migration.");
} catch (error) {
  console.error("Could not revert the TypeORM migration:", error.message);
  process.exitCode = 1;
} finally {
  if (dataSource.isInitialized) await dataSource.destroy();
}
