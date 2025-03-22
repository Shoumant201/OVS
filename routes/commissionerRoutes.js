import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getCommissioners } from '../controllers/commissionerController.js';

const router = express.Router();

router.get('/', authenticate, getCommissioners);

export default router;
