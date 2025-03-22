import express from 'express';
import { authenticate, isAdminOrSuperAdmin } from '../middleware/authMiddleware.js';
import { addCommissioner, removeCommissioner } from '../controllers/adminController.js';

const router = express.Router();

router.post('/commissioner', authenticate, isAdminOrSuperAdmin, addCommissioner);
router.delete('/commissioner/:id', authenticate, isAdminOrSuperAdmin, removeCommissioner);

export default router;
