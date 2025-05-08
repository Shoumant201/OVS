import express from "express";
import { checkVoteStatus, submitVote, getResults, getDetailedResults} from "../controllers/voteController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/vote/status/{electionId}:
 *   get:
 *     summary: Check if the authenticated user has voted in the election
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     responses:
 *       200:
 *         description: Vote status retrieved
 *       401:
 *         description: Unauthorized
 */
// Check if user has already voted in an election
router.get("/status/:electionId", authenticate, checkVoteStatus);


/**
 * @swagger
 * /api/vote:
 *   post:
 *     summary: Submit a vote for an election
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               electionId:
 *                 type: string
 *               votes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedCandidateIds:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Vote submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// Submit votes for an election
router.post("/", authenticate, submitVote);

/**
 * @swagger
 * /api/vote/elections/{electionId}/results:
 *   get:
 *     summary: Get results for an election
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     responses:
 *       200:
 *         description: Election results retrieved
 *       401:
 *         description: Unauthorized
 */
// Get election results
router.get("/elections/:electionId/results", authenticate, getResults);

/**
 * @swagger
 * /api/vote/elections/{electionId}/detailed-results:
 *   get:
 *     summary: Get detailed results for an election
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the election
 *     responses:
 *       200:
 *         description: Detailed election results retrieved
 *       401:
 *         description: Unauthorized
 */
// Get detailed election results 
router.get("/elections/:electionId/detailed-results", authenticate, getDetailedResults); 

export default router;