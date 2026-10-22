import React, { useState } from 'react';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CreditCard,
  Truck,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, Order } from '../services/api';

interface CartViewProps {
  onNavigateToProducts: () => void;
  onNavigateToLogin: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onNavigateToProducts,
  onNavigateToLogin,
  onOrderPlaced,
}) => {
  const { cart, totals, updateQuantity, removeFromCart, clearCart, promoCode, applyPromoCode, removePromoCode } = useCart();
  const { user } = useAuth();

  const [inputPromo, setInputPromo] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  // Checkout address state
  const [fullName, setFullName] = useState(user?.name || 'John Doe');
  const [address, setAddress] = useState('123 Innovation Way');
  const [city, setCity] = useState('San Francisco');
  const [postalCode, setPostalCode] = useState('94103');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('+1 415-555-0142');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  React.useEffect(() => {
    if (user?.name && (!fullName || fullName === 'John Doe')) {
      setFullName(user.name);
    }
  }, [user]);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!inputPromo.trim()) return;

    const success = applyPromoCode(inputPromo.trim());
    if (success) {
      setInputPromo('');
    } else {
      setPromoError('Invalid promo code. Try "MERN10" for 10% off!');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!user) {
      setOrderError('Please log in or create an account to complete your order.');
      return;
    }

    if (!fullName.trim() || !address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setOrderError('Please fill out all required shipping address fields.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: fullName.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          phone: phone.trim(),
        },
        promoCode: promoCode || undefined,
        paymentMethod,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderPlaced(createdOrder);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our high-tech catalog and find gear you love!
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToProducts}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Your Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review your selected items and proceed to secure checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:underline cursor-pointer"
        >
          Clear all items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="divide-y divide-slate-800">
              {cart.map((item) => (
                <div key={item.productId} className="p-4 sm:p-5 flex items-center gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                  />

                  {/* Title and Price */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      ${item.price.toFixed(2)} each
                    </p>

                    {/* Mobile Stepper */}
                    <div className="flex sm:hidden items-center gap-2 mt-3">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 text-slate-300 hover:bg-slate-800 rounded-l"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1 text-slate-300 hover:bg-slate-800 rounded-r disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Stepper */}
                  <div className="hidden sm:flex items-center border border-slate-700 rounded-xl bg-slate-950">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 text-slate-300 hover:bg-slate-800 rounded-l-xl transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white min-w-8 text-center select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 text-slate-300 hover:bg-slate-800 rounded-r-xl transition-colors disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-white block">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="hidden sm:inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 mt-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo code card */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Promotional Discount Code</span>
              </span>
              {promoCode && (
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  Active: {promoCode} (-${totals.discount.toFixed(2)})
                </span>
              )}
            </div>

            {promoCode ? (
              <div className="flex items-center justify-between text-xs bg-emerald-950/60 text-emerald-300 p-2.5 rounded-xl border border-emerald-500/40">
                <span>Code applied: <strong>{promoCode}</strong></span>
                <button
                  onClick={removePromoCode}
                  className="text-rose-400 hover:underline font-bold cursor-pointer"
                >
                  Remove Code
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try code: MERN10"
                  value={inputPromo}
                  onChange={(e) => setInputPromo(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {promoError && (
              <p className="text-xs text-rose-400 mt-1.5">{promoError}</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500">Sample codes:</span>
              <button
                type="button"
                onClick={() => applyPromoCode('MERN10')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              >
                MERN10 (10% off)
              </button>
              <button
                type="button"
                onClick={() => applyPromoCode('SAVE20')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              >
                SAVE20 (20% off)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-5">
            <h2 className="font-bold text-white text-base">Order Summary</h2>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({promoCode})</span>
                  <span>-${totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span>Shipping</span>
                  {totals.shipping === 0 && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 rounded">
                      Free &gt; $50
                    </span>
                  )}
                </span>
                <span className="font-semibold text-white">
                  {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-white">
                  ${totals.tax.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-black text-emerald-400">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Auth Gate Check */}
            {!user ? (
              <div className="p-4 bg-amber-950/40 border border-amber-600/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <LogIn className="w-4 h-4" />
                  <span>Account Required for Checkout</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Please log in or create a customer account so your order can be securely saved in your MongoDB history.
                </p>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Log In to Continue
                </button>
              </div>
            ) : (
              /* Checkout Shipping Address & Payment Form */
              <form onSubmit={handleCheckout} className="space-y-4 pt-3 border-t border-slate-800 text-xs">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Delivery Address</span>
                </h3>

                {orderError && (
                  <div className="p-2.5 bg-rose-950 border border-rose-600/40 text-rose-300 rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Springfield"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="97477"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Country *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0199"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="pt-2">
                  <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment Method</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Credit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                          paymentMethod === method
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmittingOrder ? 'Processing Order...' : `Place Order ($${totals.total.toFixed(2)})`}
                  </span>
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL encrypted • Server-side MongoDB verification</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
