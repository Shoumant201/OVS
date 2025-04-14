import express from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, oauthLogin, verifyOTP, resendOTP } from '../controllers/authController.js';
import passport from 'passport';
import { createUserProfileController, update2FAByIdController, updateOnboardingByIdController } from '../controllers/userController.js';
import { getCandidatesByQuestionIdController, getElectionByIdController, getQuestionByElectionIdController, getUserElectionsController } from '../controllers/election.controller.js';
import { getUserFromToken } from '../utils/auth.js';
import { verifyPassword } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/enable2FA', update2FAByIdController);
router.post('/onboarding', updateOnboardingByIdController);
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)
router.post('/oauth', oauthLogin);

router.get("/getUserElections", getUserElectionsController);
router.get("/:id",  getElectionByIdController);


router.get("/getAllQuestions/:id", getQuestionByElectionIdController);

router.get("/getAllCandidates/:id", getCandidatesByQuestionIdController);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`); // Redirect user after login
  }
);

router.post('/createUserProfile', createUserProfileController)

router.post("/verify-password", getUserFromToken, verifyPassword)

export default router;
