# Inventory API

The API is an Express server backed by PostgreSQL. Run it from this folder with `npm run dev`; it listens on port `4000` by default.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/server.js` | Loads environment settings, starts the HTTP server, and closes the database pool on shutdown. |
| `src/app.js` | Builds the Express app and connects middleware and route modules. |
| `src/routes/auth.routes.js` | Registration, sign in, email verification, password recovery, session lookup, and sign out. |
| `src/routes/products.routes.js` | Authenticated product list, details, create, update, and delete endpoints. |
| `src/routes/settings.routes.js` | Read and update the signed-in user's organization profile. |
| `src/routes/health.routes.js` | API and database health endpoints. |
| `src/middleware/cors.js` | Allows the configured dashboard origin to call the API with cookies. |
| `src/middleware/error-handler.js` | Converts unhandled route errors into the API's standard error response. |
| `src/middleware/validate.js` | Parses request bodies and route parameters with Zod before handlers run. |
| `src/config/database.js` | Creates the TypeORM PostgreSQL data source used by the running API. |
| `src/data-source.js` | Configures TypeORM entities and migrations for database setup commands. |
| `src/db/entities.js` | Maps users, products, categories, authentication records, tokens, and organization settings to PostgreSQL tables. |
| `src/db/migrations/` | TypeORM migration classes that apply the SQL schema changes and record them in `typeorm_migrations`. |
| `src/security/auth.js` | Password hashing, one time value hashing, session cookies, and the authentication guard. |
| `src/services/email.js` | Renders responsive MJML messages and sends them through Gmail SMTP with Nodemailer. |
| `src/validation/schemas.js` | Named Zod schemas for authentication payloads, product payloads, and product IDs. |
| `db/migrations/` | Database schema and application permission changes, applied in numeric order. |

## Routes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account and send a verification code. |
| `POST` | `/api/auth/login` | Public | Sign in a verified account with email and password. |
| `POST` | `/api/auth/verify-code` | Public | Verify the signup email code, mark the account verified, and issue its first session. |
| `POST` | `/api/auth/refresh` | Refresh cookie | Rotate the refresh token and issue a new short-lived access token. |
| `POST` | `/api/auth/resend-registration-code` | Public | Send another pending registration code. |
| `POST` | `/api/auth/forgot-password` | Public | Start password recovery without revealing whether an email is registered. |
| `POST` | `/api/auth/verify-reset-code` | Public | Verify recovery code and issue a one use reset token. |
| `POST` | `/api/auth/reset-password` | Reset token | Save a new password. |
| `GET` | `/api/auth/me` | Signed in | Return the current account. |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie. |
| `GET` | `/api/categories` | Signed in | List the current user's categories and product counts. |
| `POST` | `/api/categories` | Signed in | Create a category for the current user. |
| `GET` | `/api/categories/:id` | Signed in | Read one category and its product count. |
| `PUT` | `/api/categories/:id` | Signed in | Update a category name and description. |
| `DELETE` | `/api/categories/:id` | Signed in | Delete an unused category. |
| `GET`, `PUT` | `/api/settings` | Signed in | Read or update the user's organization name, phone, and address. |
| `GET` | `/api/health` | Public | Check that the API process is responding. |
| `GET` | `/api/health/database` | Public | Check PostgreSQL connectivity. |
| `GET`, `POST` | `/api/products` | Signed in | List or create products owned by the current account. |
| `GET`, `PUT`, `DELETE` | `/api/products/:id` | Signed in | Read, update, or delete one of the current account’s products. |

## Request validation

Request rules live in `src/validation/schemas.js`. Route handlers attach them with `validateBody(...)` or `validateParams(...)`, so invalid input is rejected before database work begins. A validation error returns a `400` response with an `error` message and a `details` array containing the field and rule that failed.

New accounts start with no categories. A signed-in user must create a category before adding products; product categories are scoped to that user's account.

Registration requires a six digit email verification code. The API stores `email_verified_at` only after the code is accepted, blocks unverified accounts from signing in, and starts a session after successful verification. Later sign-ins use the verified email and password without a second email code.

## Environment and database

Copy `.env.example` to `.env`. Set the `DATABASE_*` values to the `inventory_app` role, and set `TYPEORM_DATABASE_USER=postgres` plus `TYPEORM_DATABASE_PASSWORD` to the PostgreSQL administrator account used for migrations. Run `npm.cmd run db:migrate` to apply all pending schema changes through TypeORM; the `typeorm_migrations` table records which ones ran. Do not execute the SQL migration files manually. `synchronize` is disabled so schema changes stay in versioned migrations.

Also set `SESSION_SECRET`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD`. Use a dedicated Google account for the app. In its [Google Account security settings](https://myaccount.google.com/apppasswords), turn on 2-Step Verification, create an App Password for the API, and use that generated password here—not the account's regular password. `EMAIL_FROM` is optional and should use the same address as `GMAIL_USER` unless you configured an authorized Gmail send-as alias. Keep the same `SESSION_SECRET` in the dashboard’s `.env.local` so both apps can validate the session cookie. Keep these email credentials on the API server only. Google may not offer App Passwords to accounts under some security programs or organization policies.

For the complete local startup steps, see the repository [setup guide](../README.md). GitHub migrations reproduce the database structure, but do not contain records from another computer; transfer those separately with a database backup or seed export.
