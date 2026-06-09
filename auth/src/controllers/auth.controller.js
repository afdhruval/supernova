import bcryptjs from "bcryptjs";
import userModel from "../models/user.model.js";
import config from "../db/config.js";
import jwt from "jsonwebtoken"
import cookie from "cookie-parser"

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Validation
    if (!username || !email || !password || !fullName?.firstname || !fullName?.lastname) {
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
        firstname: fullName.firstname,
        lastname: fullName.lastname,
      },
      role: role || "user",
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    const token = jwt.sign({
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
      username: newUser.username
    }, config.JWT_SECRET, {
      expiresIn: "1d"
    })

    res.cookie("token", token)

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user by email, selecting password
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Sign JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
      },
      config.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Set cookie
    res.cookie("token", token);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default { register, login };
