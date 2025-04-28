import express from "express";
import {getUserFromToken} from "../utils/auth.js";
import { setElectionReminder,  } from "../controllers/reminderController.js";

const router = express.Router();

// Set a reminder for an election
router.post("/elections/:electionId/reminder", getUserFromToken, setElectionReminder);

// // Cancel a reminder
// router.delete("/:reminderId", getUserFromToken, cancelReminder);

// // Get all reminders for a user
// router.get("/", getUserFromToken, getUserReminders);

export default router;