import React, { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  ShoppingBag,
  Sparkles,
  Check,
} from 'lucide-react';
import { Product } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface WishlistViewProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onNavigateToProducts: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  products,
  onSelectProduct,
  onNavigateToProducts,
}) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useAuth();
  const { addToCart } = useCart();
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  // Filter products matching current wishlist IDs
  const wishlistProducts = products.filter((p) => wishlist.includes(p._id));

  const handleAddSingleToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAddedItemMap((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const handleAddAllToCart = () => {
    const inStock = wishlistProducts.filter((p) => p.stock > 0);
    if (inStock.length === 0) return;
    for (const item of inStock) {
      addToCart(item, 1);
    }
    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 2000);
  };

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    removeFromWishlist(productId);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nova-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                My Wishlist
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved items stored in your user context and synced across sessions
              </p>
            </div>
          </div>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={clearWishlist}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear List</span>
            </button>

            <button
              onClick={handleAddAllToCart}
              disabled={addedAllSuccess || wishlistProducts.every((p) => p.stock <= 0)}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                addedAllSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {addedAllSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added all in-stock to cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add All to Cart</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {wishlistProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-xl">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Click the heart icon on any product in the catalog or product page to save it for later.
            </p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isJustAdded = addedItemMap[product._id];

            return (
              <div
                key={product._id}
                onClick={() => onSelectProduct(product._id)}
                className="group bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/50 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
              >
                {/* Image frame */}
                <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {product.category}
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(e, product._id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/90 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 backdrop-blur-md transition-colors cursor-pointer shadow-md"
                    title="Remove from wishlist"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Stock status */}
                  <div className="absolute bottom-3 left-3">
                    {isOutOfStock ? (
                      <span className="bg-rose-500/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                        Sold Out
                      </span>
                    ) : (
                      <span className="bg-emerald-500/90 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        In Stock ({product.stock})
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">
                        Price
                      </span>
                      <span className="text-base font-black text-white">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddSingleToCart(e, product)}
                      disabled={isOutOfStock}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommended for You Shelf */}
      {products.length > 0 && (
        <div className="pt-8 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Recommended to Pair with Your Wishlist</span>
              </h2>
              <p className="text-xs text-slate-400">Discover more top-rated tech and developer gear</p>
            </div>
            <button
              onClick={onNavigateToProducts}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products
              .filter((p) => !wishlist.includes(p._id))
              .slice(0, 4)
              .map((rec) => (
                <div
                  key={rec._id}
                  onClick={() => onSelectProduct(rec._id)}
                  className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.imageUrl}
                      alt={rec.name}
                      className="w-14 h-14 object-cover rounded-xl bg-slate-950 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-emerald-400 font-semibold">{rec.category}</span>
                      <h4 className="text-xs font-bold text-slate-100 truncate hover:text-emerald-300">
                        {rec.name}
                      </h4>
                      <span className="text-xs font-black text-white">${rec.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
