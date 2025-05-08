import express from "express";
import {getUserFromToken} from "../utils/auth.js";
import { setElectionReminder,  } from "../controllers/reminderController.js";

const router = express.Router();

/**
 * @swagger
 * /api/reminders/elections/{electionId}/reminder:
 *   post:
 *     summary: Set a reminder for an election
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election to set a reminder for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reminderTime:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time to send the reminder
 *     responses:
 *       201:
 *         description: Reminder set successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// Set a reminder for an election
router.post("/elections/:electionId/reminder", getUserFromToken, setElectionReminder);

/**
 * @swagger
 * /api/reminders/{reminderId}:
 *   delete:
 *     summary: Cancel a reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reminderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the reminder to cancel
 *     responses:
 *       200:
 *         description: Reminder cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reminder not found
 */
// // Cancel a reminder
// router.delete("/:reminderId", getUserFromToken, cancelReminder);

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Get all reminders for the authenticated user
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reminders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
// // Get all reminders for a user
// router.get("/", getUserFromToken, getUserReminders);

export default router;