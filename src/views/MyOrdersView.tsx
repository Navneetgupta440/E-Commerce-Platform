import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api, Order } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MyOrdersViewProps {
  onNavigateToProducts: () => void;
  onNavigateToLogin: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  onNavigateToProducts,
  onNavigateToLogin,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Sign in to View Your Orders</h2>
          <p className="text-xs text-slate-400">
            Please log in with your customer account to view your past orders, delivery tracking, and receipt information.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'All') return true;
    return order.orderStatus === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivered</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shipped</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-500/40">
            <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white">My Order History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track deliveries, inspect line items, and view MongoDB receipts
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800">
          {['All', 'Pending', 'Shipped', 'Delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Loading your orders from MongoDB...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/60 border border-rose-600/40 text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any orders matching the selected status. Browse our catalog and start shopping!
          </p>
          <button
            onClick={onNavigateToProducts}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Order Placed
                      </span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        {formattedDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Order ID (MongoDB _id)
                      </span>
                      <span className="font-mono text-emerald-400 font-semibold">{order._id}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Total Amount
                      </span>
                      <span className="font-black text-white text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Items List */}
                <div className="p-4 sm:p-5 divide-y divide-slate-800">
                  {order.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Qty: <strong className="text-emerald-400">{item.quantity}</strong> × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-white shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Footer */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div>
                    <span>Ship to: </span>
                    <strong className="text-slate-200">{order.shippingAddress.fullName}</strong>
                    <span> ({order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode})</span>
                  </div>
                  <div>
                    <span>Payment: </span>
                    <span className="font-bold text-emerald-400">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
