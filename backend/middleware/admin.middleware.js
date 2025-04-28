import { findAdminByUserId } from "../models/adminModel.js";

// Middleware to check if user is an admin
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Authentication required: User ID missing." });
        }

        const admin = await findAdminByUserId(req.user.id);
        
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin role required",
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Role-Based Authorization Middleware
export const hasRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required: User ID missing.",
                });
            }

            const admin = await findAdminByUserId(req.user.id);

            if (!admin || !roles.includes(admin.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${roles.join(" or ")}`,
                });
            }

            req.admin = admin; // Attach admin details for further use
            next();
        } catch (error) {
            console.error("Error in hasRole middleware:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    };
};
