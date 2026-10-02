export function errorHandler(error, _request, response, _next) {
  console.error("API request failed:", error.message);
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
    ? "The email code could not be sent. Check the Resend API key and sender address."
    : "The server could not complete the request.";
  response.status(statusCode).json({ error: message });
}
