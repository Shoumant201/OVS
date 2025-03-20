import { findAdminByUserId } from "../models/admin.model.js"

export const isAdmin = async (req, res, next) => {
  try {
    const admin = await findAdminByUserId(req.user.id)

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required",
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

export const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      const admin = await findAdminByUserId(req.user.id)

      if (!admin || !roles.includes(admin.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(" or ")}`,
        })
      }

      req.admin = admin
      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  }
}

