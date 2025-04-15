import bcrypt from 'bcryptjs';
import jwt, { decode } from 'jsonwebtoken';
import { createUser, findUserByEmail, updateUserPassword, updateUserById, findUserById } from '../models/userModel.js';
import { sendForgotPasswordEmail, sendVerificationEmail } from '../utils/emailService.js';
import { generateOTP, sendOTPByEmail } from '../utils/opt.utils.js';
import * as otpModel from "../models/otpModel.js"

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

      if (user.is_banned) {
        return res.status(403).json({ message: 'This account has been banned.' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      // Check if 2FA is enabled
    if (user.is_2faenabled) {
      // Generate OTP
      const otp = generateOTP();

      try {
        // Save OTP to database using the model function
        await otpModel.createOTP(user.id, otp)

        // Send OTP to user's email
        await sendOTPByEmail(user.email, otp)

        // Create a temporary token with short expiry
        const tempToken = jwt.sign({ userId: user.id, require2FA: true }, process.env.JWT_SECRET, { expiresIn: "10m" })

        return res.status(200).json({
          message: "2FA required",
          tempToken,
          require2FA: true,
        })
      } catch (error) {
        console.error("Error in 2FA process:", error)
        return res.status(500).json({ message: "Error processing 2FA" })
      }
    }
  
      const token = jwt.sign({ id: user.id, email:user.email, onboarding: user.onboarding,}, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.status(200).json({ token });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body
    const tempToken = req.headers.authorization?.split(" ")[1]

    if (!tempToken) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Verify temp token
    let decoded
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET)
      if (!decoded.require2FA) {
        return res.status(400).json({ message: "Invalid token" })
      }
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" })
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" })
      }
      throw error
    }

    // Verify OTP
    const isValid = await otpModel.verifyOTP(decoded.userId, otp)

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    // Get user data
    const user = await findUserById(decoded.userId)

    // Generate full access token
    const token = jwt.sign(
      {
        id: user.id,
        onboarding: user.onboarding,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    )

    res.status(200).json({ token })
  } catch (error) {
    console.error("OTP verification error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

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

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const tempToken = req.headers.authorization?.split(" ")[1]

    if (!tempToken) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Verify temp token
    let decoded
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET)
      if (!decoded.require2FA) {
        return res.status(400).json({ message: "Invalid token" })
      }
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" })
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" })
      }
      throw error
    }

    // Get user
    const user = await findUserById(decoded.userId)

    // Generate new OTP
    const otp = generateOTP()

    // Save OTP to database
    await otpModel.createOTP(user.id, otp)

    // Send OTP to user's email
    await sendOTPByEmail(user.email, otp)

    res.status(200).json({ message: "OTP resent successfully" })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await sendForgotPasswordEmail(email, token);

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
