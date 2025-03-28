import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Decode the token and set req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Make sure decoded contains the expected properties
    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({ message: "Invalid token format" })
    }

    req.user = decoded

    // Log for debugging
    console.log("Authenticated user:", req.user)

    next()
  } catch (error) {
    console.error("Authentication error:", error.message)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

export const isAdminOrSuperAdmin = (req, res, next) => {
  // Check if req.user exists before accessing properties
  if (!req.user) {
    console.error("User object is undefined in isAdminOrSuperAdmin middleware")
    return res.status(401).json({ message: "Authentication required1" })
  }

  // Check if role property exists
  if (!req.user.role) {
    console.error("Role property missing in user object:", req.user)
    return res.status(403).json({ message: "Access denied. Role information missing." })
  }

  // Now check the role
  if (req.user.role === "admin" || req.user.role === "super_admin") {
    return next()
  }

  return res.status(403).json({ message: "Access denied. Admin privileges required." })
}

