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
import { authenticate } from "../middleware/authMiddleware.js"; // Fixed import
import { isAdmin, hasRole } from "../middleware/admin.middleware.js";

const router = express.Router();

// CRUD Operations - Only Admins/Commissioners should have access
router.post(
    "/createElection",
    authenticate,
    //hasRole(["super_admin", "commissioner", "admin"]), // Adjust Permissions Here
    createElectionController
);

router.get("/:id", authenticate, getElectionByIdController); // Can get all elections by user with authentication, modify later as needed
router.get("/", authenticate, getAllElectionsController);   // Can get elections

router.put(
    "/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner"]), // Only commissioner and admin allow update
    updateElectionController
);

router.delete(
    "/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner"]),  // Only Commissioner allow Delete.
    deleteElectionController
);

// Operations Regarding user for elections like registering in election,
router.get("/:id/users", authenticate, isAdmin, hasRole(["super_admin", "commissioner"]), getUsersInElectionController);

router.post("/:electionId/register", authenticate, registerUserForElectionController); // Register
router.delete("/:electionId/unregister", authenticate, unregisterUserForElectionController);  // Unregister user

export default router;
