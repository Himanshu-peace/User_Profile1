import Joi from "joi";

export const fullUpdateUserSchema = Joi.object({
  fullName: Joi.string()
  .min(3)
  .max(50)
  .required(),
  dateOfBirth: Joi.date()
  .required(),
  address: Joi.string()
  .min(3)
  .required(),
  maritalStatus: Joi.string()
  .valid("single", "married", "divorced")
  .required(),
  currentLocation: Joi.string()               
  .required(),
  phone: Joi.string()
  .pattern(/^[0-9]{10}$/)  
  .required(),
  photo: Joi.any() // multer handles this, safe to allow
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string()
  .min(3)
  .max(50),
  dateOfBprth: Joi.date(),
  address: Joi.string()
  .min(3),
  maritaStatus: Joi.string()
  .valid("single", "married", "divorced"),
  currentLlocation: Joi.string(),
  phone: Joi.string()
  .pattern(/^[0-9]{10}$/),
  photo: Joi.any()
}).min(1); // ensures PATCH cannot be empty

export const newPasswordSchema = Joi.object({                     //schema validation for new reset-password 
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  otp: Joi.string()
    .length(6)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 characters',
      'string.empty': 'OTP is required',
      'any.required': 'OTP is required'
    }),
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'any.invalid': 'New password must be different from the current password',
      'string.empty': 'New password is required'
    })
});