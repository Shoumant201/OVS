import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin, hasRole } from '../middleware/admin.middleware.js';
import { getCommissioners } from '../controllers/commissionerController.js';
import { banUserController, unbanUserController } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/commissioner/:
 *   get:
 *     summary: Get list of commissioners
 *     tags: [Commissioner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of commissioners
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getCommissioners);

/**
 * @swagger
 * /api/commissioner/users/{id}/ban:
 *   put:
 *     summary: Ban a user (Commissioner or Super Admin only)
 *     tags: [Commissioner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to ban
 *     responses:
 *       200:
 *         description: User banned successfully
 *       401:
 *         description: Unauthorized
 */
// Ban/Unban User Routes (Commissioner + Admin + Super Admin)
router.put('/users/:id/ban', authenticate, isAdmin, hasRole(['commissioner', 'super_admin']), banUserController);

/**
 * @swagger
 * /api/commissioner/users/{id}/unban:
 *   put:
 *     summary: Unban a user (Commissioner or Super Admin only)
 *     tags: [Commissioner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to unban
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/users/:id/unban', authenticate, isAdmin, hasRole(['commissioner', 'super_admin']), unbanUserController);

export default router;
