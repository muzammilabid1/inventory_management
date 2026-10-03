import { readFile } from "node:fs/promises";

const sqlFile = new URL("../../../db/migrations/008_organization_settings_permissions.sql", import.meta.url);

export class OrganizationSettingsPermissions1700000000008 {
  name = "OrganizationSettingsPermissions1700000000008";
  async up(queryRunner) {
    const sql = (await readFile(sqlFile, "utf8")).replace(/^\s*BEGIN;|COMMIT;\s*$/gim, "");
    await queryRunner.query(sql);
  }
  async down() {}
}
