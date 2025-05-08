import express from 'express';
import { authenticate, isAdminOrSuperAdmin } from '../middleware/authMiddleware.js';
import { 
  addCommissioner, 
  removeCommissioner, 
  getUserProfileController, 
  updateUserProfileController, 
  updateUserPasswordController,
  adminForgotPassword, adminLogin, adminRegister, adminResetPassword, 
  getUsers,
  removeUser
} from '../controllers/adminController.js';
import { getCommissioners, getCommissionerById } from '../controllers/commissionerController.js';
import { banUserController, unbanUserController } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/commissioner:
 *   post:
 *     summary: Add a new commissioner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Commissioner added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/commissioner", authenticate, isAdminOrSuperAdmin, addCommissioner);

/**
 * @swagger
 * /api/admin/commissioner/{id}:
 *   delete:
 *     summary: Remove a commissioner
 *     tags: [Admin]
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
 *         description: Commissioner removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/commissioner/:id", authenticate, isAdminOrSuperAdmin, removeCommissioner);

/**
 * @swagger
 * /api/admin/getCommissioners:
 *   get:
 *     summary: Get list of all commissioners
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of commissioners
 *       401:
 *         description: Unauthorized
 */
router.get("/getCommissioners", authenticate, isAdminOrSuperAdmin, getCommissioners);

/**
 * @swagger
 * /api/admin/getCommissioner/{id}:
 *   get:
 *     summary: Get commissioner details by ID
 *     tags: [Admin]
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
 *         description: Commissioner details
 *       401:
 *         description: Unauthorized
 */
router.get("/getCommissioner/:id", authenticate, isAdminOrSuperAdmin, getCommissionerById);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *       401:
 *         description: Unauthorized
 */
// Get user profile
router.get("/profile", authenticate, getUserProfileController);

/**
 * @swagger
 * /api/admin/profile:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
// Update user profile
router.put("/profile", authenticate, updateUserProfileController);

/**
 * @swagger
 * /api/admin/password:
 *   put:
 *     summary: Update admin password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       401:
 *         description: Unauthorized
 */
// Update user password
router.put("/password", authenticate, updateUserPasswordController);

/**
 * @swagger
 * /api/admin/adminRegister:
 *   post:
 *     summary: Admin registration
 *     tags: [Admin]
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
 *       201:
 *         description: Admin registered
 *       400:
 *         description: Registration error
 */
router.post('/adminRegister', adminRegister);

/**
 * @swagger
 * /api/admin/adminLogin:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
router.post('/adminLogin', adminLogin);

/**
 * @swagger
 * /api/admin/adminForgot-password:
 *   post:
 *     summary: Send admin password reset email
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 *       400:
 *         description: Email not found
 */
router.post('/adminForgot-password', adminForgotPassword);

/**
 * @swagger
 * /api/admin/adminReset-password:
 *   post:
 *     summary: Reset admin password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
 */
router.post('/adminReset-password', adminResetPassword);

/**
 * @swagger
 * /api/admin/getUsers:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
// Ban/Unban User Routes (Admin only)
router.get("/getUsers", authenticate, getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   put:
 *     summary: Ban a user by ID
 *     tags: [Admin]
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
 *         description: User banned
 *       401:
 *         description: Unauthorized
 */
router.put('/users/:id/ban', authenticate, banUserController);

/**
 * @swagger
 * /api/admin/users/{id}/unban:
 *   put:
 *     summary: Unban a user by ID
 *     tags: [Admin]
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
 *         description: User unbanned
 *       401:
 *         description: Unauthorized
 */
router.put('/users/:id/unban', authenticate, unbanUserController);

/**
 * @swagger
 * /api/admin/delUser/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
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
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/delUser/:id', authenticate, removeUser);

export default router;
