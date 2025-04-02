import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin, hasRole } from '../middleware/admin.middleware.js';
import { getCommissioners } from '../controllers/commissionerCOntroller.js';
import { banUserController, unbanUserController } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticate, getCommissioners);

// Ban/Unban User Routes (Commissioner + Admin + Super Admin)
router.put('/users/:id/ban', authenticate, isAdmin, hasRole(['commissioner', 'super_admin']), banUserController);
router.put('/users/:id/unban', authenticate, isAdmin, hasRole(['commissioner', 'super_admin']), unbanUserController);

export default router;
