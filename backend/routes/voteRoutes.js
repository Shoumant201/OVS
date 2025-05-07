import express from "express";
import { checkVoteStatus, submitVote, getResults, getDetailedResults} from "../controllers/voteController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Check if user has already voted in an election
router.get("/status/:electionId", authenticate, checkVoteStatus);

// Submit votes for an election
router.post("/", authenticate, submitVote);

// Get election results
router.get("/elections/:electionId/results", authenticate, getResults);

// Get detailed election results 
router.get("/elections/:electionId/detailed-results", authenticate, getDetailedResults); 

export default router;