# Inventory API

The API is an Express server backed by PostgreSQL. Run it from this folder with `npm run dev`; it listens on port `4000` by default.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/server.js` | Loads environment settings, starts the HTTP server, and closes the database pool on shutdown. |
| `src/app.js` | Builds the Express app and connects middleware and route modules. |
| `src/routes/auth.routes.js` | Registration, sign in, email verification, password recovery, session lookup, and sign out. |
| `src/routes/products.routes.js` | Authenticated product list, details, create, update, and delete endpoints. |
| `src/routes/health.routes.js` | API and database health endpoints. |
| `src/middleware/cors.js` | Allows the configured dashboard origin to call the API with cookies. |
| `src/middleware/error-handler.js` | Converts unhandled route errors into the API's standard error response. |
| `src/middleware/validate.js` | Parses request bodies and route parameters with Zod before handlers run. |
| `src/config/database.js` | Validates database settings and creates the PostgreSQL connection pool. |
| `src/security/auth.js` | Password hashing, one time value hashing, session cookies, and the authentication guard. |
| `src/services/email.js` | Renders responsive MJML messages and sends them through Resend. |
| `src/validation/schemas.js` | Named Zod schemas for authentication payloads, product payloads, and product IDs. |
| `db/migrations/` | Database schema and application permission changes, applied in numeric order. |

## Routes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account and send a verification code. |
| `POST` | `/api/auth/login` | Public | Check the password and send a sign in code. |
| `POST` | `/api/auth/verify-code` | Public | Verify registration or sign in code and issue a session. |
| `POST` | `/api/auth/resend-registration-code` | Public | Send another pending registration code. |
| `POST` | `/api/auth/forgot-password` | Public | Start password recovery without revealing whether an email is registered. |
| `POST` | `/api/auth/verify-reset-code` | Public | Verify recovery code and issue a one use reset token. |
| `POST` | `/api/auth/reset-password` | Reset token | Save a new password. |
| `GET` | `/api/auth/me` | Signed in | Return the current account. |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie. |
| `GET` | `/api/health` | Public | Check that the API process is responding. |
| `GET` | `/api/health/database` | Public | Check PostgreSQL connectivity. |
| `GET`, `POST` | `/api/products` | Signed in | List or create products owned by the current account. |
| `GET`, `PUT`, `DELETE` | `/api/products/:id` | Signed in | Read, update, or delete one of the current account’s products. |

## Request validation

Request rules live in `src/validation/schemas.js`. Route handlers attach them with `validateBody(...)` or `validateParams(...)`, so invalid input is rejected before database work begins. A validation error returns a `400` response with an `error` message and a `details` array containing the field and rule that failed.

## Environment and database

Copy `.env.example` to `.env` and fill in the database settings, `SESSION_SECRET`, `RESEND_API_KEY`, and an `EMAIL_FROM` address verified with Resend. Keep the same `SESSION_SECRET` in the dashboard’s `.env.local` so both apps can validate the session cookie.

Create the database and apply `db/migrations/001_initial_schema.sql`, `002_app_permissions.sql`, `003_auth_challenges.sql`, and `004_auth_challenge_permissions.sql` in that order. Run the permissions migrations as `postgres`. See the repository [setup guide](../README.md) for the full local startup steps.
