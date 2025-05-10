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
    createQuestionController,
    getAllQuestionsController,
    getQuestionByElectionIdController,
    getAllCandidatesController,
    getCandidatesByQuestionIdController,
    deleteQuestionController,
    deleteCandidateController,
    updateQuestionController,
    updateCandidateController,
    createCandidateController,
    getUserElectionsController,
    updateResultsVisibility,
    publishElectionResults,
    launchElection,
    getElectionResultsController,
    getCandidateDemographicsController,
    getVoterTurnoutController,
    getUserVotesController,
    recordVoteController,
    exportElectionResultsController,
    exportDemographicDataController,
    getVotersByElection,
    deleteVoteById,
} from "../controllers/election.controller.js";
import { authenticate } from "../middleware/authMiddleware.js"; // Fixed import
import { isAdmin, hasRole } from "../middleware/admin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/elections/createElection:
 *   post:
 *     summary: Create a new election
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Election created
 *       401:
 *         description: Unauthorized
 */
// CRUD Operations - Only Admins/Commissioners should have access
router.post(
    "/createElection",
    authenticate,
    //hasRole(["super_admin", "commissioner", "admin"]), // Adjust Permissions Here
    createElectionController
);

/**
 * @swagger
 * /api/elections/{id}:
 *   get:
 *     summary: Get election by ID
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Election retrieved
 *       404:
 *         description: Election not found
 */
router.get("/:id", authenticate, getElectionByIdController); // Can get all elections by user with authentication, modify later as needed

/**
 * @swagger
 * /api/elections/:
 *   get:
 *     summary: Get all elections
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of elections
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getAllElectionsController);   // Can get elections

/**
 * @swagger
 * /api/elections/{id}:
 *   put:
 *     summary: Update election
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Election updated
 *       401:
 *         description: Unauthorized
 */
router.put(
    "/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner", "admin"]), // Only commissioner and admin allow update
    updateElectionController
);

/**
 * @swagger
 * /api/elections/{id}:
 *   delete:
 *     summary: Delete election
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Election deleted
 *       401:
 *         description: Unauthorized
 */
router.delete(
    "/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner", "admin"]),  // Only Commissioner allow Delete.
    deleteElectionController
);

/**
 * @swagger
 * /api/elections/{id}/users:
 *   get:
 *     summary: Get users registered in an election
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users in election
 */
// Operations Regarding user for elections like registering in election,
router.get("/:id/users", authenticate, isAdmin, hasRole(["super_admin", "commissioner"]), getUsersInElectionController);

/**
 * @swagger
 * /api/elections/createQuestion:
 *   post:
 *     summary: Create a question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Question created
 */
router.post("/createQuestion", authenticate, isAdmin, hasRole(["super_admin", "commissioner", "admin"]), createQuestionController )

/**
 * @swagger
 * /api/elections/createCandidate:
 *   post:
 *     summary: Create a candidate
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Candidate created
 */
router.post("/createCandidate", authenticate, isAdmin, hasRole(["super_admin", "commissioner", "admin"]), createCandidateController )

/**
 * @swagger
 * /api/elections/getAllQuestions:
 *   get:
 *     summary: Get all questions
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of questions
 */
router.get("/getAllQuestions", authenticate, getAllQuestionsController);

/**
 * @swagger
 * /api/elections/getAllQuestions/{id}:
 *   get:
 *     summary: Get questions by election ID
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of questions for the election
 */
router.get("/getAllQuestions/:id", authenticate, getQuestionByElectionIdController);

/**
 * @swagger
 * /api/elections/getAllCandidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates
 */
router.get("/getAllCandidates", authenticate, getAllCandidatesController);

/**
 * @swagger
 * /api/elections/getAllCandidates/{id}:
 *   get:
 *     summary: Get candidates by question ID
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of candidates for the question
 */
router.get("/getAllCandidates/:id", authenticate, getCandidatesByQuestionIdController);

/**
 * @swagger
 * /api/elections/deleteQuestion/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted
 */
router.delete(
    "/deleteQuestion/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner", "admin"]),  // Only Commissioner allow Delete.
    deleteQuestionController
);

/**
 * @swagger
 * /api/elections/deleteCandidate/{id}:
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate deleted
 */
router.delete(
    "/deleteCandidate/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner", "admin"]),  // Only Commissioner allow Delete.
    deleteCandidateController
);

/**
 * @swagger
 * /api/elections/updateQuestion/{id}:
 *   put:
 *     summary: Update a question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question updated
 */
router.put(
    "/updateQuestion/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner", "admin"]), // Only commissioner and admin allow update
    updateQuestionController
);

/**
 * @swagger
 * /api/elections/updateCandidate/{id}:
 *   put:
 *     summary: Update a candidate
 *     tags: [Candidate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate updated
 */
router.put(
    "/updateCandidate/:id",
    authenticate,
    isAdmin,
    hasRole(["super_admin", "commissioner", "admin"]), // Only commissioner and admin allow update
    updateCandidateController
);

/**
 * @swagger
 * /api/elections/{id}/results-visibility:
 *   put:
 *     summary: Update results visibility
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visibility updated
 */
router.put(
    "/:id/results-visibility",
    authenticate,
    updateResultsVisibility,
    hasRole(["super_admin", "commissioner", "admin"])
  )
  
/**
 * @swagger
 * /api/elections/{id}/publish:
 *   post:
 *     summary: Publish election results
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Election results published
 */
  // Publish election results
  router.post("/:id/publish",authenticate, publishElectionResults)

/**
 * @swagger
 * /api/elections/{id}/launch:
 *   post:
 *     summary: Launch an election
 *     tags: [Election]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Election launched
 */
  router.post("/:id/launch",authenticate, launchElection)

  /**
 * @swagger
 * /api/elections/{id}/results:
 *   get:
 *     summary: Get election results with vote counts
 *     tags: [Election Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Election results retrieved successfully
 *       404:
 *         description: Election not found
 */
router.get("/:id/results", authenticate, getElectionResultsController)

/**
 * @swagger
 * /api/elections/{id}/turnout:
 *   get:
 *     summary: Get voter turnout data
 *     tags: [Election Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voter turnout data retrieved successfully
 *       404:
 *         description: Election not found
 */
router.get("/:id/turnout", authenticate, getVoterTurnoutController)

/**
 * @swagger
 * /api/elections/{electionId}/questions/{questionId}/candidates/{candidateId}/demographics:
 *   get:
 *     summary: Get demographic data for a specific candidate
 *     tags: [Election Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: questionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: candidateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demographic data retrieved successfully
 *       404:
 *         description: Resource not found
 */
router.get(
  "/:electionId/questions/:questionId/candidates/:candidateId/demographics",
  authenticate,
  getCandidateDemographicsController,
)

/**
 * @swagger
 * /api/elections/{id}/export:
 *   get:
 *     summary: Export election results
 *     tags: [Election Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: format
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *     responses:
 *       200:
 *         description: Election results exported successfully
 *       404:
 *         description: Election not found
 */
router.get("/:id/export", authenticate, exportElectionResultsController)

/**
 * @swagger
 * /api/elections/{electionId}/demographics/export:
 *   get:
 *     summary: Export demographic data
 *     tags: [Election Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: format
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *     responses:
 *       200:
 *         description: Demographic data exported successfully
 *       404:
 *         description: Election not found
 */
router.get("/:electionId/demographics/export", authenticate, exportDemographicDataController)

/**
 * @swagger
 * /api/elections/{electionId}/votes:
 *   get:
 *     summary: Get votes by a specific user
 *     tags: [Voting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: electionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User votes retrieved successfully
 *       404:
 *         description: Election not found
 */
router.get("/:electionId/votes", authenticate, getUserVotesController)

router.get(
    "/getVotersByElectionId/:election_id",
    authenticate,
    //hasRole(["super_admin", "commissioner", "admin"]), // Adjust Permissions Here
    getVotersByElection
);

router.delete("/deleteVote/:id", authenticate, deleteVoteById);


export default router;
