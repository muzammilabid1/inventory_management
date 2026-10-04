const configuredApiUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL;

// Local development calls the API directly. In production, use /api on this
// same site; next.config.ts forwards those requests to the API deployment.
export const apiUrl = (
  configuredApiUrl ?? (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "")
).replace(/\/$/, "");
