import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, updateUserPassword, updateUserById } from '../models/userModel.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// Register
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(name, email, hashedPassword);
  
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }  // Token expires in 1 day
      );
      await sendVerificationEmail(email, token);
  
      res.status(201).json({ message: 'User registered. Verify your email.' });
    } catch (err) {
      console.error('Registration Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await findUserByEmail(email);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (!user.is_verified) {
        return res.status(403).json({ message: 'Please verify your email before logging in' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.status(200).json({ token });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// Verify Email
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Update the user in the database (assuming you have a function like updateUserById)
        const updatedUser = await updateUserById(decoded.id, { is_verified: true });

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
    
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await sendVerificationEmail(email, token);

    res.status(200).json({ message: 'Password reset link sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(decoded.id, hashedPassword);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// OAuth Login
export const oauthLogin = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
