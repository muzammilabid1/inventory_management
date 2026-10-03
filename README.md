# Inventory Management

## Local setup

1. Create a PostgreSQL database named `inventory_management_db` and an application role named `inventory_app`.
2. Copy `inventory-api/.env.example` to `inventory-api/.env`. Set `DATABASE_USER` and `DATABASE_PASSWORD` to the `inventory_app` credentials. Set `TYPEORM_DATABASE_USER=postgres` and `TYPEORM_DATABASE_PASSWORD` to the PostgreSQL administrator credentials; TypeORM uses these only when applying schema migrations. Also set a long random `SESSION_SECRET` and `GMAIL_USER`. Use a dedicated Google account, turn on 2-Step Verification, then create an App Password in [Google Account security settings](https://myaccount.google.com/apppasswords). Put that generated password in `GMAIL_APP_PASSWORD`; never use the account's regular password or expose either credential in the dashboard.
3. Copy `inventory-dashboard/.env.example` to `inventory-dashboard/.env.local`. Set `SESSION_SECRET` to the same value as the API. The default API URL is already correct for local development.
4. Apply the TypeORM migrations once from the API folder:

   ```powershell
   cd inventory-api
   npm.cmd install
   npm.cmd run db:migrate
   ```

   TypeORM tracks applied migrations in `typeorm_migrations`; do not run the SQL files manually.

5. Start the API in one terminal:

   ```powershell
   cd inventory-api
   npm.cmd run dev
   ```

6. Start the dashboard in another terminal:

   ```powershell
   cd inventory-dashboard
   npm.cmd install
   npm.cmd run dev
   ```

Open `http://localhost:3000`. Registration requires a six digit email verification code; successful verification completes signup and signs the user in. Later sign-ins use the verified email and password without an extra code. The app uses a 15 minute access token and a rotating refresh token that expires after 30 days. Password recovery codes expire after 15 minutes; after verifying a code, set a new password and confirm it on the recovery page. Password reset revokes all active refresh sessions for that account.

New accounts start without preset categories. Add a category from the Categories section before creating the first product.

The database stores only hashes of one time codes and reset tokens. The password recovery request response does not reveal whether an email is registered. Gmail SMTP lets this development setup send from the configured Google account without a custom domain, but it has account sending limits and is not a dependable bulk or high volume production mail service. For production, use a transactional email provider and a sender domain you control; configure mail credentials only on the API host.

GitHub contains the application code and schema migrations, not the live database from another computer. TypeORM migrations create the tables and indexes locally; office-system records require a separate database backup or seed data export.
