# Inventory Management

## Local setup

1. Create a PostgreSQL database named `inventory_management_db` and an application role named `inventory_app`.
2. In pgAdmin (or `psql`), run these files in order against that database:
   - `inventory-api/db/migrations/001_initial_schema.sql`
   - `inventory-api/db/migrations/002_app_permissions.sql` (connect as the PostgreSQL administrator)
   - `inventory-api/db/migrations/003_auth_challenges.sql`
   - `inventory-api/db/migrations/004_auth_challenge_permissions.sql` (connect as the PostgreSQL administrator)
3. Copy `inventory-api/.env.example` to `inventory-api/.env` and fill in the database credentials, a long random `SESSION_SECRET`, your Resend API key, and a sender address verified with Resend.
4. Copy `inventory-dashboard/.env.example` to `inventory-dashboard/.env.local`. Set `SESSION_SECRET` to the same value as the API. The default API URL is already correct for local development.
5. Start the API in one terminal:

   ```powershell
   cd inventory-api
   npm install
   npm run dev
   ```

6. Start the dashboard in another terminal:

   ```powershell
   cd inventory-dashboard
   npm install
   npm run dev
   ```

Open `http://localhost:3000`. Registration and each password sign in require a six digit email code. Sign in codes expire after 10 minutes. Password recovery codes expire after 15 minutes; after verifying a code, set a new password and confirm it on the recovery page.

The database stores only hashes of one time codes and reset tokens. The password recovery request response does not reveal whether an email is registered. In production, configure the same strong session secret in both applications and use a sender domain verified with Resend.
