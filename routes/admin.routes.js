import express from "express"
import {
  createAdminController,
  getAllAdminsController,
  updateAdminRoleController,
  deleteAdminController,
} from "../controllers/admin.controller.js"
import { protect, verifyEmail, verify2FA } from "../middleware/auth.middleware.js"
import { isAdmin, hasRole } from "../middleware/admin.middleware.js"

const router = express.Router()

// Create admin (super admin only)
router.post("/", protect, verifyEmail, verify2FA, isAdmin, hasRole(["super_admin"]), createAdminController)

// Get all admins
router.get("/", protect, verifyEmail, verify2FA, isAdmin, getAllAdminsController)

// Update admin role (super admin only)
router.put("/:id", protect, verifyEmail, verify2FA, isAdmin, hasRole(["super_admin"]), updateAdminRoleController)

// Delete admin (super admin only)
router.delete("/:id", protect, verifyEmail, verify2FA, isAdmin, hasRole(["super_admin"]), deleteAdminController)

export default router

