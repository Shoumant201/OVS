import express from "express";
import {
    createElectionController,
    getElectionByIdController,
    getAllElectionsController,
    updateElectionController,
    deleteElectionController,
    getUsersInElectionController,
    registerUserForElectionController,
    unregisterUserForElectionController,
} from "../controllers/election.controller.js";
import { authenticate, verifyEmail, verify2FA } from "../middleware/authMiddleware.js"; // Fixed import
import { isAdmin, hasRole } from "../middleware/admin.middleware.js";

const router = express.Router();

// CRUD Operations - Only Admins/Commissioners should have access
router.post(
    "/",
    authenticate, // Changed from protect to authenticate
    verifyEmail,
    verify2FA,
    isAdmin,
    hasRole(["super_admin", "commissioner"]), // Adjust Permissions Here
    createElectionController
);

router.get("/:id", authenticate, getElectionByIdController); // Can get all elections by user with authentication, modify later as needed
router.get("/", authenticate, getAllElectionsController);   // Can get elections

router.put(
    "/:id",
    authenticate,
    verifyEmail,
    verify2FA,
    isAdmin,
    hasRole(["super_admin", "commissioner"]), // Only commissioner and admin allow update
    updateElectionController
);

router.delete(
    "/:id",
    authenticate,
    verifyEmail,
    verify2FA,
    isAdmin,
    hasRole(["super_admin", "commissioner"]),  // Only Commissioner allow Delete.
    deleteElectionController
);

// Operations Regarding user for elections like registering in election,
router.get("/:id/users", authenticate, isAdmin, hasRole(["super_admin", "commissioner"]), getUsersInElectionController);

router.post("/:electionId/register", authenticate, verifyEmail, verify2FA, registerUserForElectionController); // Register
router.delete("/:electionId/unregister", authenticate, verifyEmail, verify2FA, unregisterUserForElectionController);  // Unregister user

export default router;
