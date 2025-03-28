import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserById } from "../models/userModel.js";

dotenv.config();

// Authentication middleware to check the presence and validity of the JWT token
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
  if (
    (req.user && (req.user.role === "admin" || req.user.role === "super_admin")) ||
    (req.admin && (req.admin.role === "admin" || req.admin.role === "super_admin"))
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied. Admin or Super Admin role required",
  });
};

// Ensure email verification before allowing access
export const verifyEmail = async (req, res, next) => {
  if (!req.user || !req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
    });
  }
  next();
};

// Middleware to ensure 2FA is verified if enabled
export const verify2FA = async (req, res, next) => {
  if (req.user.two_factor_enabled && !req.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      message: "2FA verification required",
    });
  }
  next();
};
