import { findAdminByUserId, createAdmin, getAllAdmins, updateAdminRole, deleteAdmin } from "../models/admin.model.js"
import { findUserByEmail } from "../models/user.model.js"

// Create admin
export const createAdminController = async (req, res) => {
  try {
    const { email, role } = req.body

    // Find user by email
    const user = await findUserByEmail(email)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if user is already an admin
    const existingAdmin = await findAdminByUserId(user.id)

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
      })
    }

    // Create admin
    const admin = await createAdmin(user.id, role)

    res.status(201).json({
      success: true,
      data: admin,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get all admins
export const getAllAdminsController = async (req, res) => {
  try {
    const admins = await getAllAdmins()

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update admin role
export const updateAdminRoleController = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const admin = await updateAdminRole(id, role)

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      })
    }

    res.status(200).json({
      success: true,
      data: admin,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Delete admin
export const deleteAdminController = async (req, res) => {
  try {
    const { id } = req.params

    await deleteAdmin(id)

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

