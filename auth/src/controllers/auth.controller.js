import bcryptjs from "bcryptjs";
import userModel from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, firstname, lastname, role } = req.body;

    // Validation
    if (!username || !email || !password || !firstname || !lastname) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      fullName: {
        firstname,
        lastname,
      },
      role: role || "user",
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default { register };
