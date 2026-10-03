import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/007_organization_settings.sql", import.meta.url);

export class OrganizationSettings1700000000007 {
  name = "OrganizationSettings1700000000007";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down(queryRunner) {
    await queryRunner.query("DROP TABLE IF EXISTS organization_settings CASCADE");
  }
}
