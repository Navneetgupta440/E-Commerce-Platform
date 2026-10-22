import React from 'react';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { Order } from '../services/api';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
  onGoHome: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewOrders,
  onGoHome,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          </div>
          <h2 className="text-xl font-black">Order Placed Successfully!</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Thank you for your purchase. We are preparing your shipment.
          </p>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Order Details Header */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Order ID (MongoDB _id)
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {order._id}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 font-bold rounded-full text-[11px]">
              {order.orderStatus}
            </span>
          </div>

          {/* Items Summary */}
          <div>
            <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Purchased Items ({order.orderItems.length})</span>
            </h4>
            <div className="divide-y divide-slate-800 max-h-36 overflow-y-auto pr-1">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-9 h-9 rounded-md object-cover border border-slate-800"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-slate-500 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping and Total */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Shipping Destination
              </span>
              <p className="text-slate-200 font-semibold mt-0.5">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-slate-400 text-[11px]">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </p>
            </div>

            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Total Paid
              </span>
              <span className="text-lg font-black text-emerald-400 block mt-0.5">
                ${order.totalAmount.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onGoHome();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View in My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
