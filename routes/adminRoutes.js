import express from 'express';
import { authenticate, isAdminOrSuperAdmin } from '../middleware/authMiddleware.js';
import { 
  addCommissioner, 
  removeCommissioner, 
  adminForgotPassword, 
  adminLogin, 
  adminRegister, 
  adminResetPassword,
  getUserProfileController, 
  updateUserProfileController, 
  updateUserPasswordController, 
  getUsers,
  removeUser
} from '../controllers/adminController.js';
import { getCommissioners, getCommissionerById } from '../controllers/commissionerController.js';
import { banUserController, unbanUserController } from '../controllers/userController.js';

const router = express.Router();

router.post("/commissioner", authenticate, isAdminOrSuperAdmin, addCommissioner);
router.delete("/commissioner/:id", authenticate, isAdminOrSuperAdmin, removeCommissioner);
router.get("/getCommissioners", authenticate, isAdminOrSuperAdmin, getCommissioners);
router.get("/getCommissioner/:id", authenticate, isAdminOrSuperAdmin, getCommissionerById);

// Get user profile
router.get("/profile", authenticate, getUserProfileController);

// Update user profile
router.put("/profile", authenticate, updateUserProfileController);

// Update user password
router.put("/password", authenticate, updateUserPasswordController);

// Ban/Unban User Routes (Admin only)
router.get("/getUsers", authenticate, getUsers);
router.put('/users/:id/ban', authenticate, banUserController);
router.put('/users/:id/unban', authenticate, unbanUserController);
router.delete('/delUser/:id', authenticate, removeUser);

export default router;
