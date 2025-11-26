import express from "express";
import { register,resendOtp, verifyEmailOtp, login } from "../controllers/authController.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { registerSchema,resendOtpSchema, verifySchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);          //genrate otp and registered unverified user
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);      //user sends email to resend otp
router.post("/verify-email",validate(verifySchema), verifyEmailOtp);   //user sends otp along with email to verify
router.post("/login", validate(loginSchema), login);                   //user can login only after verifying email

export default router;
