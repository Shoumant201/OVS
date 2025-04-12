import nodemailer from "nodemailer"

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
export const sendOTPByEmail = async (email, otp) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code for Online Voting System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #26C6B0; text-align: center;">Online Voting System</h2>
          <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.5;">Your verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block;">${otp}</div>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes.</p>
          <p style="font-size: 16px; line-height: 1.5;">If you didn't request this code, please ignore this email.</p>
          <div style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Online Voting System. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    console.log(`OTP sent to ${email}`)
    return true
  } catch (error) {
    console.error("Error sending OTP email:", error)
    throw error
  }
}
