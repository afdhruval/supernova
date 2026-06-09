import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import validator from "../validation/validator.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", validator.registerUserValidation, register);
router.post("/login", validator.loginUserValidation, login);
router.get("/me", protect, getMe);

export default router;
