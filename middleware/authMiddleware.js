import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserById } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

dotenv.config();

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing or invalid format",
    });
  }

  // Extract token from the authorization header
  const token = authHeader.split(" ")[1];

  // Verify the token with the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

        // Check if token has require2FA flag
    if (token.require2FA) {
      return res.status(401).json({ message: "2FA verification required" })
    }

    // Attach the user object from the token to the request
    req.user = user;
    next();
  });
};

// Middleware to prevent banned users from accessing certain routes
export const preventBannedUser = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const user = await findUserById(req.user.id);
      if (user && user.is_banned) {
        return res.status(403).json({
          success: false,
          message: "This account has been banned.",
        });
      }
    }
    next();
  } catch (error) {
    console.error("Error in preventBannedUser middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking ban status.",
    });
  }
};

// Role-based middleware to check if the user is an admin or super admin
export const isAdminOrSuperAdmin = (req, res, next) => {
  // Check if req.user exists before accessing properties
  if (!req.user) {
    console.error("User object is undefined in isAdminOrSuperAdmin middleware")
    return res.status(401).json({ message: "Authentication required1" })
  }

  // Check if role property exists
  if (!req.user.role) {
    console.error("Role property missing in user object:", req.user)
    return res.status(403).json({ message: "Access denied. Role information missing." })
  }

  // Now check the role
  if (req.user.role === "admin" || req.user.role === "super_admin") {
    return next()
  }

  return res.status(403).json({ message: "Access denied. Admin privileges required." })
}

// // Ensure email verification before allowing access
// export const verifyEmail = async (req, res, next) => {
//   if (!req.user || !req.user.is_verified) {
//     return res.status(403).json({
//       success: false,
//       message: "Please verify your email first",
//     });
//   }
//   next();
// };

// // Middleware to ensure 2FA is verified if enabled
// export const verify2FA = async (req, res, next) => {
//   if (req.user.two_factor_enabled && !req.twoFactorVerified) {
//     return res.status(403).json({
//       success: false,
//       message: "2FA verification required",
//     });
//   }
//   next();
// };
export const verifyPassword = async (req, res) => {
  try {
    // User should be attached to req by the auth middleware
    const user = req.user

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: "Password is required" })
    }

    // Get the user's hashed password from the database
    const userResult = await pool.query("SELECT password FROM users WHERE id = $1", [user.id])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const hashedPassword = userResult.rows[0].password

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, hashedPassword)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" })
    }

    // Password is valid
    return res.json({
      success: true,
      message: "Password verified successfully",
    })
  } catch (err) {
    console.error("Error verifying password:", err)
    return res.status(500).json({ message: "Server error", error: err.message })
  }
}
