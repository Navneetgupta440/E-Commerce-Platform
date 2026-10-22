import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
} from 'lucide-react';
import { Product } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onSelectCategory: (category: string) => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  product,
  onBack,
  onSelectCategory,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = isInWishlist(product._id);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumbs and back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button
            onClick={onBack}
            className="hover:text-emerald-400 cursor-pointer"
          >
            Catalog
          </button>
          <span>/</span>
          <button
            onClick={() => {
              onSelectCategory(product.category);
              onBack();
            }}
            className="hover:text-emerald-400 cursor-pointer text-emerald-400"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-slate-300 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 bg-slate-950 p-8 flex items-center justify-center relative min-h-[380px] border-b lg:border-b-0 lg:border-r border-slate-800">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-[440px] w-full object-contain object-center rounded-2xl shadow-md"
          />

          <span className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
            {product.category}
          </span>

          <button
            type="button"
            onClick={() => toggleWishlist(product._id)}
            className={`absolute top-6 right-6 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer ${
              isFavorite
                ? 'bg-rose-950/90 text-rose-500 border border-rose-500/50 shadow-rose-500/30'
                : 'bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-rose-400 border border-slate-700/60'
            }`}
            title={isFavorite ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Right: Details & Purchase Controls */}
        <div className="lg:col-span-6 p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-200">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({product.numReviews} customer ratings)
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">USD</span>
            </div>

            {/* Stock Badge */}
            <div>
              {isOutOfStock ? (
                <span className="inline-block px-3 py-1 bg-rose-950 text-rose-300 border border-rose-600/40 text-xs font-bold rounded-full">
                  Currently Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-block px-3 py-1 bg-amber-950 text-amber-300 border border-amber-600/40 text-xs font-bold rounded-full animate-pulse">
                  Only {product.stock} units remaining in stock
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-xs font-semibold rounded-full">
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                About this item
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-white select-none min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-98'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added {quantity} to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-400 hover:bg-rose-900/60 shadow-lg shadow-rose-500/10'
                    : 'bg-slate-900 border-slate-750 text-slate-300 hover:text-rose-400 hover:border-rose-400/50 hover:bg-slate-850'
                }`}
                title={isFavorite ? 'Saved to Wishlist' : 'Save to Wishlist'}
                aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : ''
                  }`}
                />
                <span className="hidden sm:inline">
                  {isFavorite ? 'Saved' : 'Wishlist'}
                </span>
              </button>
            </div>

            {/* Guarantees Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>1-Year Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
