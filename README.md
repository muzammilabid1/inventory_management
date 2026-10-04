# Inventory Management

## Local setup

1. Create a PostgreSQL database named `inventory_management_db` and an application role named `inventory_app`.
2. Copy `inventory-api/.env.example` to `inventory-api/.env`. Set `DATABASE_USER` and `DATABASE_PASSWORD` to the `inventory_app` credentials. Set `DRIZZLE_DATABASE_USER=postgres` and `DRIZZLE_DATABASE_PASSWORD` to the PostgreSQL administrator credentials used for migrations and Drizzle Studio. Also set a long random `SESSION_SECRET` and `GMAIL_USER`. Use a dedicated Google account, turn on 2-Step Verification, then create an App Password in [Google Account security settings](https://myaccount.google.com/apppasswords). Put that generated password in `GMAIL_APP_PASSWORD`; never use the account's regular password or expose either credential in the dashboard.
3. Copy `inventory-dashboard/.env.example` to `inventory-dashboard/.env.local`. Set `SESSION_SECRET` to the same value as the API. The default API URL is already correct for local development.
4. Apply the Drizzle migrations once from the API folder:

   ```powershell
   cd inventory-api
   npm.cmd install
   npm.cmd run db:migrate
   ```

   Drizzle tracks applied migrations in `drizzle.__drizzle_migrations`; do not run the SQL files manually. Existing databases with the completed TypeORM migration history are adopted without recreating tables or changing their records.

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

## Deploy on Vercel

Deploy the database first, apply the migrations, then deploy the API and dashboard:

1. Create a PostgreSQL database from a provider in the Vercel Marketplace. Vercel connects to external PostgreSQL providers rather than hosting a new built-in Vercel Postgres database. Keep the provider's connection URL private.
2. Apply the Drizzle migrations to that hosted database before deploying the API. From `inventory-api`, set `DRIZZLE_DATABASE_URL` in your local `.env` to the database connection URL and run `npm.cmd run db:migrate`. This creates the schema; it does not copy local users, products, or other records. When possible, use a dedicated `inventory_app` database role for the API and a separate owner/migration connection for Drizzle.
3. Create a Vercel project for the API and set its Root Directory to `inventory-api`. Vercel can host the default-exported Express app in `src/app.js` as a Function. Add `DATABASE_URL` (the runtime connection URL), a long random `SESSION_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and optionally `EMAIL_FROM`. Set `WEB_ORIGIN` to the dashboard's public URL. If the connection URL has `sslmode=require`, leave `DATABASE_SSL` unset.
4. Create another Vercel project for the dashboard and set its Root Directory to `inventory-dashboard`. Set `SESSION_SECRET` to exactly the same value as the API, and set `INVENTORY_API_ORIGIN` to the API deployment origin, such as `https://inventory-api.vercel.app`. Leave `NEXT_PUBLIC_INVENTORY_API_URL` unset. The dashboard calls `/api/...` on its own origin and Next.js forwards those requests to the API, keeping authentication cookies same-site.
5. Check `https://<api-domain>/api/health` and `https://<api-domain>/api/health/database`, then test signup, email verification, sign-in, refresh, and sign-out on the dashboard deployment.

Commit and push the deployment code to GitHub before connecting the projects to automatic Git deployments. Keep `.env` files and real secrets out of Git. The API keeps Gmail SMTP from the local setup; successful SMTP login does not guarantee a message will avoid spam, so a transactional email provider and a verified sender domain are preferable for a public production app.

New accounts start without preset categories. Add a category from the Categories section before creating the first product.

The database stores only hashes of one time codes and reset tokens. The password recovery request response does not reveal whether an email is registered. Gmail SMTP lets this development setup send from the configured Google account without a custom domain, but it has account sending limits and is not a dependable bulk or high volume production mail service. For production, use a transactional email provider and a sender domain you control; configure mail credentials only on the API host.

GitHub contains the application code and schema migrations, not the live database from another computer. Drizzle migrations create the tables and indexes locally; office-system records require a separate database backup or seed data export. For later schema changes, update `inventory-api/src/db/schema.js`, then run `npm.cmd run db:generate` followed by `npm.cmd run db:migrate`. Run `npm.cmd run db:studio` to open the database browser.
