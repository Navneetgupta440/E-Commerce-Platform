import React, { useState } from 'react';
import { Star, ShoppingCart, Check, Eye } from 'lucide-react';
import { Product } from '../services/api';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => onSelect(product._id)}
      className="group bg-slate-900 dark:bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/50 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
          {product.category}
        </span>

        {/* Stock indicator badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-rose-500/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Only {product.stock} left
            </span>
          ) : (
            <span className="bg-emerald-500/90 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              In Stock
            </span>
          )}
        </div>

        {/* Quick View overlay hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-slate-900/95 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-200">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">
              ({product.numReviews})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-100 text-sm sm:text-base line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Price</span>
            <span className="text-lg font-black text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
