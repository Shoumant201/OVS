import express from 'express';
import { authenticate, isAdminOrSuperAdmin } from '../middleware/authMiddleware.js';
import { 
  addCommissioner, adminForgotPassword, adminLogin, adminRegister, adminResetPassword, 
  adminForgotPassword, 
  adminLogin, 
  adminRegister, 
  adminResetPassword, 
  removeCommissioner, getUserProfileController, updateUserProfileController, updateUserPasswordController 
} from '../controllers/adminController.js';
import { getCommissioners, getCommissionerById } from '../controllers/commissionerCOntroller.js';
import { banUserController, unbanUserController } from '../controllers/userController.js';

const router = express.Router();

// router.post('/commissioner', addCommissioner);
// router.delete('/commissioner/:id', removeCommissioner);

router.post("/commissioner", authenticate, isAdminOrSuperAdmin, addCommissioner)
router.delete("/commissioner/:id", authenticate, isAdminOrSuperAdmin, removeCommissioner)
router.get("/getCommissioners", authenticate, isAdminOrSuperAdmin, getCommissioners)
router.get("/getCommissioner/:id", authenticate, isAdminOrSuperAdmin, getCommissionerById)


// Get user profile
router.get("/profile", authenticate, getUserProfileController)

// Update user profile
router.put("/profile", authenticate, updateUserProfileController)

// Update user password
router.put("/password", authenticate, updateUserPasswordController)

router.post('/adminRegister', adminRegister);
router.post('/adminLogin', adminLogin);
router.post('/adminForgot-password', adminForgotPassword);
router.post('/adminReset-password', adminResetPassword);

// Ban/Unban User Routes (Admin only)
router.put('/users/:id/ban', authenticate, isAdminOrSuperAdmin, banUserController);
router.put('/users/:id/unban', authenticate, isAdminOrSuperAdmin, unbanUserController);

export default router;
