import pool from "../config/db.js"

export const createOTP = async (userId, otp) => {
    try {
      // First, delete any existing OTPs for this user
      await deleteOTP(userId)
  
      // Then create a new OTP
      const result = await pool.query(
        "INSERT INTO otps (user_id, otp) VALUES ($1, $2) RETURNING id, otp, created_at, expires_at",
        [userId, otp],
      )
  
      return result.rows[0]
    } catch (error) {
      console.error("Error creating OTP:", error)
      throw error
    }
  }
  
  // Get OTP by user ID
  export const getOTPByUserId = async (userId) => {
    try {
      const result = await pool.query("SELECT * FROM otps WHERE user_id = $1 AND expires_at > NOW()", [userId])
  
      return result.rows[0] // Return the first (and should be only) valid OTP
    } catch (error) {
      console.error("Error getting OTP:", error)
      throw error
    }
  }
  
  // Delete OTP by user ID
  export const deleteOTP = async (userId) => {
    try {
      const result = await pool.query("DELETE FROM otps WHERE user_id = $1", [userId])
  
      return result.rowCount > 0 // Returns true if at least one row was deleted
    } catch (error) {
      console.error("Error deleting OTP:", error)
      throw error
    }
  }
  
  // Verify OTP
  export const verifyOTP = async (userId, otp) => {
    try {
      const result = await pool.query("SELECT * FROM otps WHERE user_id = $1 AND otp = $2 AND expires_at > NOW()", [
        userId,
        otp,
      ])
  
      const isValid = result.rows.length > 0
  
      if (isValid) {
        // Delete the OTP after successful verification
        await deleteOTP(userId)
      }
  
      return isValid
    } catch (error) {
      console.error("Error verifying OTP:", error)
      throw error
    }
  }
  