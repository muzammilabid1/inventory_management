import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/003_auth_challenges.sql", import.meta.url);

export class AuthChallenges1700000000003 {
  name = "AuthChallenges1700000000003";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down(queryRunner) {
    await queryRunner.query("DROP TABLE IF EXISTS password_resets, auth_challenges CASCADE");
  }
}
