import { Response } from 'express';
import { Orders, Products, Users } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * @desc    Get dashboard metrics & summary for admin
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export async function getAdminStats(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const allOrders = await Orders.find();
    const allProducts = await Products.find();
    const allUsers = await Users.find();

    const totalRevenue = allOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const pendingOrdersCount = allOrders.filter(
      (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing'
    ).length;

    const lowStockProductsCount = allProducts.filter((p) => p.stock <= 5).length;

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: allOrders.length,
      totalProducts: allProducts.length,
      totalUsers: allUsers.length,
      pendingOrdersCount,
      lowStockProductsCount,
      recentOrders: allOrders.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching admin stats' });
  }
}
