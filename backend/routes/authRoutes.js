import express from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, oauthLogin, verifyOTP, resendOTP } from '../controllers/authController.js';
import passport from 'passport';
import { createUserProfileController, getUserProfileController, update2FAByIdController, updateOnboardingByIdController, updateUserProfileController } from '../controllers/userController.js';
import { getCandidatesByQuestionIdController, getElectionByIdController, getQuestionByElectionIdController, getUserElectionsController } from '../controllers/election.controller.js';
import { getUserFromToken } from '../utils/auth.js';
import { verifyPassword } from '../middleware/authMiddleware.js';
import { updateUserProfile } from '../models/userModel.js';

const router = express.Router();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Registration error
 */

router.post('/register', register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', login);
/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired token
 */

router.get('/verify/:token', verifyEmail);
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 *       400:
 *         description: Error sending reset link
 */

router.post('/forgot-password', forgotPassword);
/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

router.post('/reset-password/:token', resetPassword);
/**
 * @swagger
 * /api/auth/enable2FA:
 *   post:
 *     summary: Enable or update 2FA for a user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 2FA updated
 */

router.post('/enable2FA', update2FAByIdController);
/**
 * @swagger
 * /api/auth/onboarding:
 *   post:
 *     summary: Complete onboarding steps
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Onboarding updated
 */

router.post('/onboarding', updateOnboardingByIdController);
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for 2FA or registration
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid OTP
 */

router.post("/verify-otp", verifyOTP)
/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP resent
 */

router.post("/resend-otp", resendOTP)
/**
 * @swagger
 * /api/auth/oauth:
 *   post:
 *     summary: OAuth login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OAuth login successful
 */

router.post('/oauth', oauthLogin);
/**
 * @swagger
 * /api/auth/getUserElections:
 *   get:
 *     summary: Get elections associated with the logged-in user
 *     tags: [Election]
 *     responses:
 *       200:
 *         description: User elections retrieved
 */

router.get("/getUserElections", getUserElectionsController);
/**
 * @swagger
 * /api/auth/{id}:
 *   get:
 *     summary: Get election by ID
 *     tags: [Election]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Election data
 *       404:
 *         description: Election not found
 */
router.get("/:id",  getElectionByIdController);
/**
 * @swagger
 * /api/auth/getAllQuestions/{id}:
 *   get:
 *     summary: Get all questions by election ID
 *     tags: [Election]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions retrieved
 */

router.get("/getAllQuestions/:id", getQuestionByElectionIdController);
/**
 * @swagger
 * /api/auth/getAllCandidates/{id}:
 *   get:
 *     summary: Get all candidates by question ID
 *     tags: [Election]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidates retrieved
 */

router.get("/getAllCandidates/:id", getCandidatesByQuestionIdController);
/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 */

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 */

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`); // Redirect user after login
  }
);
/**
 * @swagger
 * /api/auth/createUserProfile:
 *   post:
 *     summary: Create user profile
 *     tags: [User]
 *     responses:
 *       201:
 *         description: Profile created
 */

router.post('/createUserProfile', createUserProfileController)

/**
 * @swagger
 * /api/auth/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved
 */

router.get("/profile/:id", getUserProfileController)
/**
 * @swagger
 * /api/auth/profile/{id}:
 *   put:
 *     summary: Update user profile by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

router.put("/profile/:id", updateUserProfileController)

/**
 * @swagger
 * /api/auth/verify-password:
 *   post:
 *     summary: Verify user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password verified
 *       401:
 *         description: Unauthorized
 */
router.post("/verify-password", getUserFromToken, verifyPassword)


export default router;
