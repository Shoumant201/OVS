import { findUserById } from "../models/user.model.js"
import { findAdminByUserId } from "../models/admin.model.js"

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id)

    // Check if user is admin
    const admin = await findAdminByUserId(user.id)

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        isVerified: user.is_verified,
        twoFactorEnabled: user.two_factor_enabled,
        isAdmin: !!admin,
        adminRole: admin ? admin.role : null,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

