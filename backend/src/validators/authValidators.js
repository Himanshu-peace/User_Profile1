// import { z } from "zod";
import Joi from "joi";

// const passwordRegex = /^[A-Z]/; // Password must start with an uppercase letter

export const registerSchema = Joi.object({
  fullName: Joi.string()
    .min(3)
    .max(50)
    .required(),
  email: Joi.string()
    .email()    
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be empty'
    })  
    .required(),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'password is required',
      'any.required': 'password is required'
    }),
});

export const resendOtpSchema = Joi.object({
  email: Joi.string()
    .trim() 
    .email()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be empty'
    }),
});

export const verifySchema = Joi.object({
  email: Joi.string()
    .trim() 
    .email()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be empty'
    }),
  otp: Joi.string()
    .length(6)
    .messages({
      'string.length': 'OTP must be 6 characters long',
      'string.empty': 'OTP is required'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()    
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be empty'
    })  
    .required(),
  password: Joi.string()
    .required()
});









