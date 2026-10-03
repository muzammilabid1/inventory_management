import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/006_refresh_token_permissions.sql", import.meta.url);

export class RefreshTokenPermissions1700000000006 {
  name = "RefreshTokenPermissions1700000000006";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down() {}
}
