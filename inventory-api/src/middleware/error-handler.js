export function errorHandler(error, _request, response, _next) {
  console.error("API request failed:", error.message);
  if (error.code === "28P01") {
    return response.status(503).json({
      error: "The API could not authenticate with PostgreSQL. Check DATABASE_USER and DATABASE_PASSWORD in inventory-api/.env.",
    });
  }

  if (error.code === "3D000") {
    return response.status(503).json({
      error: "The configured PostgreSQL database does not exist. Check DATABASE_NAME in inventory-api/.env.",
    });
  }

  if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"].includes(error.code)) {
    return response.status(503).json({
      error: "The API could not reach PostgreSQL. Check DATABASE_HOST and DATABASE_PORT in inventory-api/.env and make sure PostgreSQL is running.",
    });
  }

  if (error.code === "42P01") {
    if (/refresh_token_families|refresh_tokens/.test(error.message)) {
      return response.status(503).json({
        error: "The database is missing the refresh-token tables. Run db/migrations/005_refresh_tokens.sql and then 006_refresh_token_permissions.sql in pgAdmin as postgres.",
      });
    }
    return response.status(503).json({
      error: "The database schema is missing an auth table. Run db/migrations/003_auth_challenges.sql in pgAdmin as the database administrator.",
    });
  }

  if (error.code === "42501") {
    if (/refresh_token_families|refresh_tokens/.test(error.message)) {
      return response.status(503).json({
        error: "The API role lacks refresh-token table permissions. Run db/migrations/006_refresh_token_permissions.sql in pgAdmin as postgres.",
      });
    }
    return response.status(503).json({
      error: "The API role is missing database table or sequence permissions. Run db/migrations/002_app_permissions.sql in pgAdmin as postgres.",
    });
  }

  const statusCode = error.statusCode === 503 ? 503 : 500;
  const message = statusCode === 503
    ? "The email code could not be sent. Check the Gmail SMTP account and app password configuration."
    : "The server could not complete the request.";
  response.status(statusCode).json({ error: message });
}
