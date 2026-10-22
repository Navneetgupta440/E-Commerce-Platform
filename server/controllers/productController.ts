import { Request, Response } from 'express';
import { Products, IProductDocument, generateObjectId } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * @desc    Fetch all products with optional search, category filter, and sorting
 * @route   GET /api/products
 * @access  Public
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'newest';
    const featured = req.query.featured === 'true';

    let products = await Products.find();

    // Filter by keyword
    if (keyword) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter featured
    if (featured) {
      products = products.filter((p) => p.featured === true);
    }

    // Sort
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else {
      // Newest
      products.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
}

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching product' });
  }
}

/**
 * @desc    Get list of unique product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const all = await Products.find();
    const categories = Array.from(new Set(all.map((p) => p.category))).sort();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
}

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, price, description, imageUrl, category, stock, featured } = req.body;

    if (!name || price === undefined || !description || !imageUrl || !category) {
      res.status(400).json({
        message: 'Name, price, description, imageUrl, and category are required',
      });
      return;
    }

    const numPrice = Number(price);
    const numStock = Number(stock ?? 0);

    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400).json({ message: 'Price must be a positive number' });
      return;
    }

    if (isNaN(numStock) || numStock < 0) {
      res.status(400).json({ message: 'Stock must be a non-negative integer' });
      return;
    }

    const product = await Products.create({
      name: name.trim(),
      price: numPrice,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      category: category.trim(),
      stock: numStock,
      rating: 5.0,
      numReviews: 1,
      featured: Boolean(featured),
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
}

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await Products.findById(id);

    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const { name, price, description, imageUrl, category, stock, featured, rating } = req.body;

    const updates: Partial<IProductDocument> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (price !== undefined) updates.price = Math.max(0, Number(price));
    if (description !== undefined) updates.description = String(description).trim();
    if (imageUrl !== undefined) updates.imageUrl = String(imageUrl).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (stock !== undefined) updates.stock = Math.max(0, Math.floor(Number(stock)));
    if (featured !== undefined) updates.featured = Boolean(featured);
    if (rating !== undefined) updates.rating = Math.min(5, Math.max(1, Number(rating)));

    const updatedProduct = await Products.findByIdAndUpdate(id, updates);
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
}

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await Products.findByIdAndDelete(id);
    res.json({ message: 'Product removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
}

/**
 * @desc    Add or update customer review for a product
 * @route   POST /api/products/:id/reviews
 * @access  Private (Authenticated users)
 */
export async function addProductReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required to post a review' });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
      return;
    }

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      res.status(400).json({ message: 'Review headline must be at least 2 characters long' });
      return;
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      res.status(400).json({ message: 'Review comment must be at least 5 characters long' });
      return;
    }

    const product = await Products.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const reviews = product.reviews ? [...product.reviews] : [];
    const existingIndex = reviews.findIndex((r) => r.userId === req.user?._id);

    const reviewData = {
      _id: existingIndex >= 0 ? reviews[existingIndex]._id : generateObjectId(),
      userId: req.user._id,
      userName: req.user.name || 'NovaCart Customer',
      rating: Math.round(numRating),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = reviewData;
    } else {
      reviews.unshift(reviewData);
    }

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
        : 5.0;

    const updated = await Products.findByIdAndUpdate(id, {
      reviews,
      rating: avgRating,
      numReviews: totalReviews,
    });

    res.status(201).json({
      message: existingIndex >= 0 ? 'Review updated successfully' : 'Review submitted successfully',
      review: reviewData,
      product: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error submitting review' });
  }
}
