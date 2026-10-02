function validate(schema, source, label) {
  return (request, response, next) => {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return response.status(400).json({
        error: details[0]?.message || `${label} is invalid.`,
        details,
      });
    }
    request[source] = result.data;
    next();
  };
}

export const validateBody = (schema) => validate(schema, "body", "Request body");
export const validateParams = (schema) => validate(schema, "params", "Route parameters");
