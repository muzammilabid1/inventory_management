export class RevokeUnverifiedSessions1700000000010 {
  name = "RevokeUnverifiedSessions1700000000010";

  async up(queryRunner) {
    await queryRunner.query(`
      UPDATE refresh_token_families
      SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP)
      WHERE user_id IN (
        SELECT id FROM users WHERE email_verified_at IS NULL
      )
    `);
  }

  async down() {
    // Revoked sessions cannot be safely restored; users can sign in again after verification.
  }
}
