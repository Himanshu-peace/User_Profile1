import express from "express";
import { register, login } from "../controllers/authController.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
