import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/001_initial_schema.sql", import.meta.url);

export class InitialSchema1700000000001 {
  name = "InitialSchema1700000000001";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down(queryRunner) {
    await queryRunner.query("DROP TABLE IF EXISTS products, categories, users CASCADE");
  }
}
