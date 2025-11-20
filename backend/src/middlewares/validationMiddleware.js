export const validate = (schema) => (req, res, next) => {
  try {
    // Zod will strip unknown fields by default if you .parse. But we'll use safeParse
    const body = req.body;
    const result = schema.safeParse(body);
    if (!result.success) {
      const error = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
      return res.status(400).json({ message: "Validation error", details: error });
    }
    // replace body with parsed data
    req.body = result.data;
    next();
  } catch (err) {
    next(err);
  }
};
