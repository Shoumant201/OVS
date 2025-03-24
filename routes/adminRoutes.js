import express from 'express';
import { authenticate, isAdminOrSuperAdmin } from '../middleware/authMiddleware.js';
import { addCommissioner, adminForgotPassword, adminLogin, adminRegister, adminResetPassword, removeCommissioner } from '../controllers/adminController.js';

const router = express.Router();

router.post('/commissioner', authenticate, isAdminOrSuperAdmin, addCommissioner);
router.delete('/commissioner/:id', authenticate, isAdminOrSuperAdmin, removeCommissioner);
router.post('/adminRegister', adminRegister);
router.post('/adminLogin', adminLogin);
router.post('/adminForgot-password', adminForgotPassword);
router.post('/adminReset-password', adminResetPassword);

export default router;
