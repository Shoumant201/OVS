import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createCommissioner, findAdminByEmail, updateAdminById, deleteCommissioner, findCommissionerByEmail, getUserProfile, isEmailInUse, updateUserProfile, getUserPassword, updateUserPassword, hashPassword, comparePassword } from '../models/adminModel.js';

export const addCommissioner = async (req, res) => {
  const { email, password, role, name, addedBy } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const commissioner = await createCommissioner(email, hashedPassword, role, name, addedBy);
    res.status(201).json({ message: 'Commissioner added', commissioner });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const removeCommissioner = async (req, res) => {
  try {
    await deleteCommissioner(req.params.id);
    res.json({ message: 'Commissioner removed' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });

  }
};

export const adminRegister = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }
    
    try {
      const existingUser = await findAdminByEmail(email);
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createAdmin(name, email, hashedPassword, role);
  
      // const token = jwt.sign(
      //   { id: admin.id, email: admin.email, role: admin.role  },
      //   process.env.JWT_SECRET,
      //   { expiresIn: '1d' }  // Token expires in 1 day
      // );
      // await sendVerificationEmail(email, token);
  
      res.status(201).json({ message: 'admin registered.' });
    } catch (err) {
      console.error('Registration Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  

// Login
export const adminLogin = async (req, res) => {
  const { email, password, selectedRole } = req.body
  try {
    // Check admins table
    const admin = await findAdminByEmail(email)

    // Check commissioners table
    const commissioner = await findCommissionerByEmail(email)

    // If email exists in both tables and no role is selected yet
    if (admin && commissioner && !selectedRole) {
      // First verify password against admin account (assuming same password for both)
      const isMatch = await bcrypt.compare(password, admin.password)
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

      // Return available roles for selection
      return res.status(200).json({
        message: "Multiple roles found",
        multipleRoles: true,
        availableRoles: [
          { type: "admin", role: admin.role },
          { type: "commissioner", role: "commissioner" },
        ],
      })
    }

    // If user has selected a role after conflict detection
    if (selectedRole) {
      if (selectedRole === "admin" && admin) {
        // Verify password for admin
        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

        // Create token with admin info - ensure all required fields are included
        const adminToken = jwt.sign(
          {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role || "admin", // Ensure role is always set
          },
          process.env.JWT_SECRET,
          { expiresIn: "30d" },
        )

        // Log token payload for debugging
        console.log("Admin token payload:", { id: admin.id, email: admin.email, role: admin.role || "admin" })

        return res.status(200).json({ adminToken, userType: "admin" })
      } else if (selectedRole === "commissioner" && commissioner) {
        // Verify password for commissioner
        const isMatch = await bcrypt.compare(password, commissioner.password)
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

        // Create token with commissioner info - ensure role is explicitly set
        const adminToken = jwt.sign(
          {
            id: commissioner.id,
            name: admin.name,
            email: commissioner.email,
            role: "commissioner", // Explicitly set role
          },
          process.env.JWT_SECRET,
          { expiresIn: "30d" },
        )

        // Log token payload for debugging
        console.log("Commissioner token payload:", {
          id: commissioner.id,
          email: commissioner.email,
          role: "commissioner",
        })

        return res.status(200).json({ adminToken, userType: "commissioner" })
      }
    }

    // Normal login flow for single role accounts
    if (admin && !commissioner) {
      const isMatch = await bcrypt.compare(password, admin.password)
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

      const adminToken = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role || "admin", // Ensure role is always set
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      )

      return res.status(200).json({ adminToken, userType: "admin" })
    }

    if (commissioner && !admin) {
      const isMatch = await bcrypt.compare(password, commissioner.password)
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

      const adminToken = jwt.sign(
        {
          id: commissioner.id,
          email: commissioner.email,
          role: "commissioner", // Explicitly set role
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      )

      return res.status(200).json({ adminToken, userType: "commissioner" })
    }

    // If user not found in either table
    return res.status(404).json({ message: "User not found" })
  } catch (err) {
    if (!res.headersSent) {
      console.error("Login Error:", err)
      res.status(500).json({ message: "Server error", error: err.message })
    }
  }
}



// Forgot Password
export const adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await findadminByEmail(email);
    if (!admin) return res.status(404).json({ message: 'admin not found' });

    const token = jwt.sign({ id: admin.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await sendVerificationEmail(email, token);

    res.status(200).json({ message: 'Password reset link sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
export const adminResetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateadminPassword(decoded.id, hashedPassword);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Validate user role
 * @param {string} role - User role
 * @returns {boolean} True if role is valid
 */
const validateRole = (role) => {
  return role === "admin" || role === "commissioner"
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
const validateEmail = (email) => {
  return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
}

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role || req.headers["x-user-role"]

    if (!validateRole(userRole)) {
      return res.status(400).json({ message: "Invalid user role" })
    }

    const user = await getUserProfile(userId, userRole)

    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)

    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserProfileController = async (req, res) => {
  try {
    const { name, email } = req.body
    const userId = req.user.id
    const userRole = req.user.role || req.headers["x-user-role"]

    if (!validateRole(userRole)) {
      return res.status(400).json({ message: "Invalid user role" })
    }

    // Input validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    // Check if email is already in use
    const emailInUse = await isEmailInUse(email, userId, userRole)

    if (emailInUse) {
      return res.status(400).json({ message: "Email is already in use" })
    }

    // Update user profile
    await updateUserProfile(userId, name, email, userRole)

    res.status(200).json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Update user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserPasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id
    const userRole = req.user.role || req.headers["x-user-role"]

    if (!validateRole(userRole)) {
      return res.status(400).json({ message: "Invalid user role" })
    }

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" })
    }

    // Get current password hash
    const passwordHash = await getUserPassword(userId, userRole)

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await updateUserPassword(userId, hashedPassword, userRole)

    res.status(200).json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error updating password:", error)

    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(500).json({ message: "Server error" })
  }
}



