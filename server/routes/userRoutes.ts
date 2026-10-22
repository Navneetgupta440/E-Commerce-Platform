import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  toggleWishlist,
  getWishlist,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.put('/wishlist/:productId', protect, toggleWishlist);

export default router;
