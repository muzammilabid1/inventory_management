import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/004_auth_challenge_permissions.sql", import.meta.url);

export class AuthChallengePermissions1700000000004 {
  name = "AuthChallengePermissions1700000000004";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down() {}
}
