import express from 'express';
import { authenticate, isAdminOrSuperAdmin } from '../middleware/authMiddleware.js';
import { 
  addCommissioner, 
  removeCommissioner 
} from '../controllers/adminController.js';
import { banUserController, unbanUserController } from '../controllers/userController.js';

const router = express.Router();

router.post('/commissioner', authenticate, isAdminOrSuperAdmin, addCommissioner);
router.delete('/commissioner/:id', authenticate, isAdminOrSuperAdmin, removeCommissioner);



// Ban/Unban User Routes (Admin only)
router.put('/users/:id/ban', authenticate, isAdminOrSuperAdmin, banUserController);
router.put('/users/:id/unban', authenticate, isAdminOrSuperAdmin, unbanUserController);

export default router;
