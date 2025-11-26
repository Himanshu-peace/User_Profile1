export const validate = (schema) => (req, res, next) => {
    // Validate the request body against the provided schema
    // We use { abortEarly: false } to collect all validation errors, not just the first one.
    const { error } = schema.validate(req.body, { abortEarly: false });

    // Check if validation failed
    if (error) {
        // Extract the specific error messages from Joi's 'details' array
        // Each detail object has a 'message' property with the error text.
        const errorMessages = error.details.map((detail) => detail.message);

        // Send a 400 Bad Request response with all validation errors
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages, // Sending the clean array of error strings
        });
    }    //don't send error message 
            //

    // Validation passed, continue to the next middleware or route handler
    next();
};
