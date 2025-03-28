import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getCommissioners } from '../controllers/commissionerCOntroller.js';

const router = express.Router();

router.get('/', authenticate, getCommissioners);

export default router;
