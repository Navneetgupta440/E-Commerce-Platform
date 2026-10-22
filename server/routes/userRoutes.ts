import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
