import { body, validationResult } from "express-validator";

const respondWithValidationErros = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: "All fields are required",
            errors: errors.array() 
        });
    }
    next();
}

const registerUserValidation = [
    body("username")
        .isString()
        .withMessage("username must be a string")
        .isLength({ max: 20 })
        .withMessage("username must be less then 20 char")
        .trim(),
    body("email")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),
    body("password")
        .isString()
        .withMessage("password must be a string")
        .isLength({ max: 10 })
        .withMessage("password must be less then 10 char"),
    body("fullName.firstname")
        .isString()
        .withMessage("firstname is required")
        .trim(),
    body("fullName.lastname")
        .isString()
        .withMessage("lastname is required")
        .trim(),
    body("role")
        .optional()
        .isString()
        .withMessage("role must be a string")
        .trim(),
    respondWithValidationErros
]

const loginUserValidation = [
    body("email")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),
    body("password")
        .isString()
        .withMessage("password must be a string"),
    respondWithValidationErros
]

export default {
    registerUserValidation,
    loginUserValidation,
}