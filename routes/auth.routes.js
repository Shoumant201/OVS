import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken" // Import jwt
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPasswordController,
  setup2FAController,
  verify2FAController,
  logout,
} from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Register user
router.post("/register", register)

// Verify email
router.get("/verify-email", verifyEmail)

// Login user
router.post("/login", login)

// Forgot password
router.post("/forgot-password", forgotPassword)

// Reset password
router.post("/reset-password", resetPasswordController)

// Setup 2FA
router.get("/setup-2fa", protect, setup2FAController)

// Verify 2FA
router.post("/verify-2fa", verify2FAController)

// Logout
router.get("/logout", logout)

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

// Google OAuth callback
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })

  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
})

export default router

