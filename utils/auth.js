import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// Authentication middleware that properly passes control
export const getUserFromToken = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    let token = req.cookies?.token

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No authentication token provided" })
    }

    // Verify token with timeout
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database with timeout
    const userPromise = pool.query("SELECT * FROM users WHERE id = $1", [decoded.id])
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database query timed out")), 5000),
    )

    const userResult = await Promise.race([userPromise, timeoutPromise])

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" })
    }

    // Attach user to request object
    req.user = userResult.rows[0]

    // Continue to the next middleware
    next()
  } catch (err) {
    console.error("Authentication error:", err)
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" })
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }
    return res.status(500).json({ message: "Authentication error", error: err.message })
  }
}
