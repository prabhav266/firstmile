import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Clerk-Style Passwordless Email OTP Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Traditional & Fallback Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/profile', protect, updateProfile);

export default router;
