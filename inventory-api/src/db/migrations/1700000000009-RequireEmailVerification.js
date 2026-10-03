export class RequireEmailVerification1700000000009 {
  name = "RequireEmailVerification1700000000009";

  async up(queryRunner) {
    await queryRunner.query("ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ");
    // Preserve existing completed accounts while keeping registrations with an
    // outstanding registration challenge unverified.
    await queryRunner.query(`
      UPDATE users
      SET email_verified_at = COALESCE(created_at, CURRENT_TIMESTAMP)
      WHERE NOT EXISTS (
        SELECT 1 FROM auth_challenges
        WHERE auth_challenges.user_id = users.id
          AND auth_challenges.purpose = 'register'
      )
    `);
    // Login no longer uses email challenges; discard any challenges left over
    // from the previous sign-in flow.
    await queryRunner.query("DELETE FROM auth_challenges WHERE purpose = 'login'");
  }

  async down(queryRunner) {
    await queryRunner.query("ALTER TABLE users DROP COLUMN email_verified_at");
  }
}
