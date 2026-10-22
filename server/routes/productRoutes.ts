import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} from '../controllers/productController';
import { protect, admin } from '../middleware/auth';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Reviews
router.post('/:id/reviews', protect, addProductReview);

// Admin-only management routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
