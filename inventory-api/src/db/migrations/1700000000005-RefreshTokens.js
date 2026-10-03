import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/005_refresh_tokens.sql", import.meta.url);

export class RefreshTokens1700000000005 {
  name = "RefreshTokens1700000000005";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down(queryRunner) {
    await queryRunner.query("DROP TABLE IF EXISTS refresh_tokens, refresh_token_families CASCADE");
  }
}
