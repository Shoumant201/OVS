import jwt from "jsonwebtoken"
import { findUserById } from "../models/user.model.js"

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await findUserById(decoded.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}

export const verifyEmail = async (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
    })
  }

  next()
}

export const verify2FA = async (req, res, next) => {
  if (req.user.two_factor_enabled && !req.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      message: "2FA verification required",
    })
  }

  next()
}

