import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Users } from '../config/db';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await Users.findOne({ email: cleanEmail });

    if (userExists) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'user',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      token,
      message: 'Account registered successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error registering user' });
  }
}

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/users/login
 * @access  Public
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please enter both email and password' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: cleanEmail });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      token,
      message: 'Login successful',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
}

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export async function getUserProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      ...req.user,
      wishlist: req.user.wishlist || [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
}

/**
 * @desc    Toggle a product in user's wishlist
 * @route   POST /api/users/wishlist/toggle or PUT /api/users/wishlist/:productId
 * @access  Private
 */
export async function toggleWishlist(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const productId = req.params.productId || req.body.productId;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    const user = await Users.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const currentWishlist = Array.isArray(user.wishlist) ? [...user.wishlist] : [];
    const index = currentWishlist.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      currentWishlist.splice(index, 1);
      isAdded = false;
    } else {
      currentWishlist.push(productId);
      isAdded = true;
    }

    const updated = await Users.findByIdAndUpdate(user._id, {
      wishlist: currentWishlist,
    });

    res.json({
      wishlist: updated?.wishlist || currentWishlist,
      isAdded,
      productId,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update wishlist' });
  }
}

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/users/wishlist
 * @access  Private
 */
export async function getWishlist(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await Users.findById(req.user._id);
    res.json({
      wishlist: user?.wishlist || [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to get wishlist' });
  }
}

