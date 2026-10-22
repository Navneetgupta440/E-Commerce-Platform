import { Response } from 'express';
import { Orders, Products, Users, IOrderItem, IShippingAddress } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateOrderTotals, CartItem } from '../../src/utils/pricing';

/**
 * @desc    Create a new order (calculates real prices on server, validates stock)
 * @route   POST /api/orders
 * @access  Private
 */
export async function createOrder(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { orderItems, shippingAddress, promoCode, paymentMethod } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items provided' });
      return;
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      res.status(400).json({ message: 'Please provide a complete shipping address' });
      return;
    }

    // Verify all products from the database and verify stock
    const verifiedOrderItems: IOrderItem[] = [];
    const pricingItems: CartItem[] = [];

    for (const item of orderItems) {
      const product = await Products.findById(item.productId);
      if (!product) {
        res.status(404).json({
          message: `Product with ID ${item.productId} was not found`,
        });
        return;
      }

      const requestedQty = Math.max(1, Math.floor(Number(item.quantity) || 1));

      if (product.stock < requestedQty) {
        res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${requestedQty}`,
        });
        return;
      }

      // Decrement stock
      await Products.findByIdAndUpdate(product._id, {
        stock: product.stock - requestedQty,
      });

      verifiedOrderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, // Trust database price, NOT client price
        quantity: requestedQty,
        imageUrl: product.imageUrl,
      });

      pricingItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: requestedQty,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
    }

    // Calculate totals on the server
    const pricing = calculateOrderTotals(pricingItems, promoCode);

    const newOrder = await Orders.create({
      userId: req.user!._id,
      userName: req.user!.name,
      userEmail: req.user!.email,
      orderItems: verifiedOrderItems,
      shippingAddress: shippingAddress as IShippingAddress,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      tax: pricing.tax,
      shippingFee: pricing.shipping,
      totalAmount: pricing.total,
      orderStatus: 'Pending',
      paymentMethod: paymentMethod || 'Credit Card (Simulated)',
      isPaid: true,
      paidAt: new Date().toISOString(),
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
}

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export async function getMyOrders(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const orders = await Orders.find((order) => order.userId === req.user!._id);
    // Sort newest first
    orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user orders' });
  }
}

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export async function getOrderById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const order = await Orders.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Security check: Only the customer who placed the order or an Admin can view it
    if (order.userId !== req.user!._id && req.user!.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: You cannot view other users orders' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching order' });
  }
}

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export async function getAllOrders(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const orders = await Orders.find();
    // Sort newest first
    orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching all orders' });
  }
}

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export async function updateOrderStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const order = await Orders.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const updated = await Orders.findByIdAndUpdate(id, {
      orderStatus: status as any,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
}
