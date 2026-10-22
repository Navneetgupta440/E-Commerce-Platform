import { Router } from 'express';
import { getAdminStats } from '../controllers/adminController';
import { protect, admin } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, admin, getAdminStats);

export default router;
