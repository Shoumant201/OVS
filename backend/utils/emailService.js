import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM_EMAIL = `"Online Voting System" <${process.env.EMAIL_USER}>`;

// Generic function to send email
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// 1. Verification Email
export const sendVerificationEmail = async (email, token, lang = 'en') => {
  const link = `http://localhost:3000/${lang}/verify/${token}`;
  const html = `
    <h2>Email Verification</h2>
    <p>Hello,</p>
    <p>Thank you for registering. Please click the link below to verify your email address:</p>
    <p><a href="${link}" style="color: #26C6B0;">Verify Email</a></p>
    <p>This link will expire shortly for your security.</p>
  `;

  await sendEmail(email, 'Verify Your Email', html);
};

// 2. Forgot Password Email
export const sendForgotPasswordEmail = async (email, token, lang = 'en') => {
  const link = `http://localhost:3000/${lang}/reset-password/${token}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You recently requested to reset your password. Click the link below to set a new password:</p>
    <p><a href="${link}" style="color: #26C6B0;">Reset Password</a></p>
    <p>If you didn’t request this, you can ignore this email.</p>
  `;

  await sendEmail(email, 'Reset Your Password', html);
};

// 3. Password Reset Confirmation Email (optional)
export const sendResetConfirmationEmail = async (email) => {
  const html = `
    <h2>Password Successfully Reset</h2>
    <p>Hello,</p>
    <p>Your password has been successfully reset. If this wasn’t you, please contact support immediately.</p>
  `;

  await sendEmail(email, 'Your Password Has Been Reset', html);
};
