import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createCommissioner, findAdminByEmail, updateAdminById, deleteCommissioner, findCommissionerByEmail } from '../models/adminModel.js';

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
