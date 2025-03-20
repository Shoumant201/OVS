import express from "express"
import { getCurrentUser } from "../controllers/user.controller.js"
import { protect, verifyEmail, verify2FA } from "../middleware/auth.middleware.js"

const router = express.Router()

// Get current user
router.get("/me", protect, verifyEmail, verify2FA, getCurrentUser)

export default router

