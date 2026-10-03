import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/002_app_permissions.sql", import.meta.url);

export class AppPermissions1700000000002 {
  name = "AppPermissions1700000000002";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down() {
    // Permissions are intentionally left in place; table ownership and grants are
    // managed by the administrator account running the migrations.
  }
}
