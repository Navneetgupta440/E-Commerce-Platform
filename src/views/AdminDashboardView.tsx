import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { api, Product, Order, AdminStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdminProductModal } from '../components/AdminProductModal';

interface AdminDashboardViewProps {
  categories: string[];
  onRefreshProducts: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  categories,
  onRefreshProducts,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'overview'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const fetchData = async () => {
    if (user?.role !== 'admin') return;
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        api.getAdminStats(),
        api.getProducts(),
        api.getAllOrders(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch administrator data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-slate-900/90 rounded-3xl p-8 border border-rose-500/30 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400">
            This dashboard is protected by Express role-based access control (RBAC). Only users with the <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">admin</code> role can manage products and customer orders.
          </p>
          <p className="text-[11px] text-slate-500">
            Please log in with <strong className="text-slate-300">admin@novacart.com</strong> (password: <strong className="text-slate-300">admin123</strong>).
          </p>
        </div>
      </div>
    );
  }

  // Handle Product Save (Create or Update)
  const handleSaveProduct = async (productData: Partial<Product>): Promise<boolean> => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, productData);
      } else {
        await api.createProduct(productData);
      }
      await fetchData();
      onRefreshProducts();
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
      return false;
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product from the MongoDB database?')) {
      return;
    }

    try {
      setDeletingProductId(productId);
      await api.deleteProduct(productId);
      await fetchData();
      onRefreshProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus as any } : o))
      );
      api.getAdminStats().then(setStats).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'All' && o.orderStatus !== orderStatusFilter) {
      return false;
    }
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      (o.userName && o.userName.toLowerCase().includes(q)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-amber-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
              Admin Access
            </span>
            <span className="text-xs text-slate-400">Authenticated as {user.name}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Store Administrator Panel</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading administration metrics from backend...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/60 border border-rose-600/40 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Total Revenue
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    ${stats?.totalRevenue.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    From {stats?.totalOrders} completed orders
                  </span>
                </div>

                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-3">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Customer Orders
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {stats?.totalOrders || 0}
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
                    {stats?.pendingOrdersCount} pending / in process
                  </span>
                </div>

                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-500/30 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Active Catalog Items
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {stats?.totalProducts || 0}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                    Across {categories.length} categories
                  </span>
                </div>

                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-3">
                    <UsersIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Registered Users
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {stats?.totalUsers || 0}
                  </span>
                  <span className="text-[11px] text-purple-300 font-semibold mt-1 block">
                    Stored in MongoDB Users
                  </span>
                </div>
              </div>

              {/* Quick Actions & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">Recent Store Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-emerald-400 hover:underline cursor-pointer font-semibold"
                    >
                      View all orders
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">
                            {order.userName || 'Customer'} <span className="font-normal text-slate-500 font-mono">({order._id.slice(-6)})</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {order.orderItems.length} items • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-white block">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm">Inventory Quick Actions</h3>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>Manage Order Statuses</span>
                  </button>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                    <span className="font-bold text-slate-200 block">MERN Backend Architecture:</span>
                    <p className="text-[11px] text-slate-500">
                      All products and orders are persisted in the MongoDB database and protected with JSON Web Token verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-white text-base">Product Inventory Management</h2>
                  <p className="text-xs text-slate-400">
                    Add new items, update pricing and stock, or remove products from the catalog
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="px-3 py-2 pl-8 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-48 sm:w-64"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white truncate max-w-xs">
                                {product.name}
                              </p>
                              <span className="font-mono text-[10px] text-slate-500">
                                {product._id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300">
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[11px] font-semibold text-emerald-300 border border-slate-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-3 font-black text-white">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="p-3">
                          {product.stock <= 0 ? (
                            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded font-bold text-[10px] border border-rose-500/30">
                              Out of Stock
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-bold text-[10px] border border-amber-500/30">
                              Low: {product.stock} left
                            </span>
                          ) : (
                            <span className="text-slate-300 font-semibold">
                              {product.stock} units
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          ⭐ {product.rating.toFixed(1)} ({product.numReviews})
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={deletingProductId === product._id}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-white text-base">Customer Orders &amp; Fulfillment</h2>
                  <p className="text-xs text-slate-400">
                    Review orders placed across all users and update delivery status
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="px-3 py-2 pl-8 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-44"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-950 text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Order ID &amp; Date</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items Purchased</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <span className="font-mono font-bold text-emerald-400 block">
                            {order._id}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-white">{order.userName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-400">{order.userEmail}</p>
                          <p className="text-[10px] text-slate-500">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {order.orderItems.map((item, i) => (
                              <p key={i} className="text-slate-300 text-[11px] truncate max-w-xs">
                                • {item.name} <span className="text-emerald-400 font-semibold">×{item.quantity}</span>
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-black text-white text-sm block">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Paid via {order.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                                : order.orderStatus === 'Shipped'
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                                : order.orderStatus === 'Processing'
                                ? 'bg-teal-950 text-teal-300 border-teal-500/50'
                                : order.orderStatus === 'Cancelled'
                                ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                : 'bg-amber-950 text-amber-300 border-amber-500/50'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Edit / Create Modal */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categories={categories}
      />
    </div>
  );
};
