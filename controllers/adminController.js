import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAdmin, findAdminByEmail, updateAdminById, deleteCommissioner } from '../models/adminModel.js';

export const addCommissioner = async (req, res) => {
  const { email, password, addedBy } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const commissioner = await createAdmin(email, hashedPassword, 'commissioner', addedBy);
    res.status(201).json({ message: 'Commissioner added', commissioner });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeCommissioner = async (req, res) => {
  try {
    await deleteCommissioner(req.params.id);
    res.json({ message: 'Commissioner removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    const { email, password} = req.body;
    try {
      const admin = await findAdminByEmail(email);
      if (!admin) return res.status(404).json({ message: 'admin not found' });
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
      const adminToken = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      res.status(200).json({ adminToken });
    } catch (err) {
      if (!res.headersSent) {  // ✅ Only send response if no other response has been sent
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    }
  };
  

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
