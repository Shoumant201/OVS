import pool from "../config/db.config.js"
import bcrypt from "bcrypt"
import crypto from "crypto"

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
  return result.rows[0]
}

export const findUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
  return result.rows[0]
}

export const createUser = async (email, password) => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const verificationToken = crypto.randomBytes(32).toString("hex")

  const result = await pool.query(
    "INSERT INTO users (email, password, verification_token) VALUES ($1, $2, $3) RETURNING *",
    [email, hashedPassword, verificationToken],
  )

  return { user: result.rows[0], verificationToken }
}

export const verifyUser = async (token) => {
  const result = await pool.query(
    "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING *",
    [token],
  )

  return result.rows[0]
}

export const createPasswordResetToken = async (email) => {
  const user = await findUserByEmail(email)

  if (!user) {
    return null
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1) // Token expires in 1 hour

  await pool.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3", [
    resetToken,
    expiry,
    user.id,
  ])

  return { user, resetToken }
}

export const resetPassword = async (token, newPassword) => {
  const result = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()", [token])

  if (result.rows.length === 0) {
    return null
  }

  const user = result.rows[0]
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPassword, salt)

  await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2", [
    hashedPassword,
    user.id,
  ])

  return user
}

export const setup2FA = async (userId, secret) => {
  await pool.query("UPDATE users SET two_factor_secret = $1 WHERE id = $2", [secret, userId])
}

export const enable2FA = async (userId) => {
  await pool.query("UPDATE users SET two_factor_enabled = TRUE WHERE id = $1", [userId])
}

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

