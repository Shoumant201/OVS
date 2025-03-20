import jwt from "jsonwebtoken"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import {
  findUserByEmail,
  createUser,
  verifyUser,
  comparePassword,
  createPasswordResetToken,
  resetPassword,
  setup2FA,
  enable2FA,
  findUserById, // Added import for findUserById
} from "../models/user.model.js"
import { sendVerificationEmail, sendPasswordResetEmail } from "../config/email.config.js"

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Register user
export const register = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      })
    }

    // Create user
    const { user, verificationToken } = await createUser(email, password)

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query

    const user = await verifyUser(token)

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      })
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if password matches
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      })
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      return res.status(200).json({
        success: true,
        message: "2FA verification required",
        userId: user.id,
        requires2FA: true,
      })
    }

    // Generate token
    const token = generateToken(user.id)

    // Set cookie
    const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    res.status(200).cookie("token", token, options).json({
      success: true,
      token,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const result = await createPasswordResetToken(email)

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Send password reset email
    await sendPasswordResetEmail(email, result.resetToken)

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Reset password
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.query
    const { password } = req.body

    const user = await resetPassword(token, password)

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      })
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Setup 2FA
export const setup2FAController = async (req, res) => {
  try {
    const { id } = req.user

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `YourApp:${req.user.email}`,
    })

    // Save secret to user
    await setup2FA(id, secret.base32)

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url)

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCodeUrl,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Verify 2FA
export const verify2FAController = async (req, res) => {
  try {
    const { userId, token } = req.body

    // Find user
    const user = await findUserById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token,
    })

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: "Invalid 2FA token",
      })
    }

    // If this is the first verification, enable 2FA
    if (!user.two_factor_enabled) {
      await enable2FA(user.id)
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id)

    // Set cookie
    const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    res.status(200).cookie("token", jwtToken, options).json({
      success: true,
      token: jwtToken,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Logout
export const logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
}

