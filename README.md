# Inventory Management

## Local setup

1. Create a PostgreSQL database named `inventory_management_db` and an application role named `inventory_app`.
2. In pgAdmin (or `psql`), run these files in order against that database:
   - `inventory-api/db/migrations/001_initial_schema.sql`
   - `inventory-api/db/migrations/002_app_permissions.sql` (connect as the PostgreSQL administrator)
   - `inventory-api/db/migrations/003_auth_challenges.sql`
   - `inventory-api/db/migrations/004_auth_challenge_permissions.sql` (connect as the PostgreSQL administrator)
   - `inventory-api/db/migrations/005_refresh_tokens.sql` (connect as the PostgreSQL administrator)
   - `inventory-api/db/migrations/006_refresh_token_permissions.sql` (connect as the PostgreSQL administrator)
3. Copy `inventory-api/.env.example` to `inventory-api/.env` and fill in the database credentials, a long random `SESSION_SECRET`, and `GMAIL_USER`. Use a dedicated Google account, turn on 2-Step Verification, then create an App Password in [Google Account security settings](https://myaccount.google.com/apppasswords). Put that generated password in `GMAIL_APP_PASSWORD`; never use the account's regular password or expose either credential in the dashboard.
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

Open `http://localhost:3000`. Registration and each password sign in require a six digit email code. The app uses a 15 minute access token and a rotating refresh token that expires after 30 days. Password recovery codes expire after 15 minutes; after verifying a code, set a new password and confirm it on the recovery page. Password reset revokes all active refresh sessions for that account.

The database stores only hashes of one time codes and reset tokens. The password recovery request response does not reveal whether an email is registered. Gmail SMTP lets this development setup send from the configured Google account without a custom domain, but it has account sending limits and is not a dependable bulk or high volume production mail service. For production, use a transactional email provider and a sender domain you control; configure mail credentials only on the API host.
