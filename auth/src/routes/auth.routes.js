import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import validator from "../validation/validator.middleware.js";
const router = express.Router();

router.post("/register", validator.registerUserValidation, register);
router.post("/login", validator.loginUserValidation, login);

export default router;
