import React, { useState, useMemo } from 'react';
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
  MessageSquare,
  ThumbsUp,
  LogIn,
  AlertCircle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Product, Review, api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  calculateRatingStats,
  validateReviewInput,
  formatReviewDate,
} from '../utils/reviews';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onSelectCategory: (category: string) => void;
  onNavigateToLogin?: () => void;
  onProductUpdated?: (updatedProduct: Product) => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  product: initialProduct,
  onBack,
  onSelectCategory,
  onNavigateToLogin,
  onProductUpdated,
}) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const { addToCart } = useCart();
  const { user, isInWishlist, toggleWishlist } = useAuth();

  // Purchasing state
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  // Reviews state
  const reviews = useMemo(() => product.reviews || [], [product.reviews]);
  const stats = useMemo(
    () => calculateRatingStats(reviews, product.rating, product.numReviews),
    [reviews, product.rating, product.numReviews]
  );

  // Review Form state
  const existingUserReview = useMemo(
    () => (user ? reviews.find((r) => r.userId === user._id) : undefined),
    [user, reviews]
  );

  const [formRating, setFormRating] = useState<number>(existingUserReview ? existingUserReview.rating : 5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState<string>(existingUserReview ? existingUserReview.title : '');
  const [formComment, setFormComment] = useState<string>(existingUserReview ? existingUserReview.comment : '');
  const [formErrors, setFormErrors] = useState<{ rating?: string; title?: string; comment?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter and Sorting state
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Helpful votes state (local interaction)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});

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

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onNavigateToLogin) onNavigateToLogin();
      return;
    }

    const validation = validateReviewInput({
      rating: formRating,
      title: formTitle,
      comment: formComment,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const response = await api.createProductReview(product._id, {
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
      });

      if (response && response.product) {
        setProduct(response.product);
        if (onProductUpdated) {
          onProductUpdated(response.product);
        }
      } else {
        // Fallback optimistic update
        const newReview: Review = {
          _id: `rev_${Date.now()}`,
          userId: user._id,
          userName: user.name || 'NovaCart Customer',
          rating: formRating,
          title: formTitle.trim(),
          comment: formComment.trim(),
          verifiedPurchase: true,
          createdAt: new Date().toISOString(),
        };

        const updatedReviews = existingUserReview
          ? reviews.map((r) => (r.userId === user._id ? newReview : r))
          : [newReview, ...reviews];

        const newAvg =
          Math.round(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10
          ) / 10;

        const updatedProduct: Product = {
          ...product,
          reviews: updatedReviews,
          rating: newAvg,
          numReviews: updatedReviews.length,
        };

        setProduct(updatedProduct);
        if (onProductUpdated) {
          onProductUpdated(updatedProduct);
        }
      }

      setSubmitSuccess(
        existingUserReview
          ? 'Your review was updated successfully!'
          : 'Thank you! Your verified review has been published.'
      );
      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setSubmitError(err.message || 'Unable to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (userVoted[reviewId]) return;
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
    setUserVoted((prev) => ({
      ...prev,
      [reviewId]: true,
    }));
  };

  // Filtered and Sorted Reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (selectedStarFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }

    return list;
  }, [reviews, selectedStarFilter, sortBy]);

  const ratingLabelMap: Record<number, string> = {
    1: '1 Star - Poor / Disappointing',
    2: '2 Stars - Fair / Needs improvement',
    3: '3 Stars - Average / Acceptable',
    4: '4 Stars - Good / High quality',
    5: '5 Stars - Outstanding / Highly recommended!',
  };

  const activeRatingDisplay = formHoverRating || formRating;

  return (
    <div className="space-y-12 pb-20">
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
            {/* Rating and Reviews Quick Link */}
            <a
              href="#customer-reviews"
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
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
              <span className="text-xs text-emerald-400 underline underline-offset-2">
                ({product.numReviews} customer reviews)
              </span>
            </a>

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

      {/* ========================================================================= */}
      {/* EXTENDED SECTION: RATINGS AND CUSTOMER REVIEWS */}
      {/* ========================================================================= */}
      <div id="customer-reviews" className="space-y-8 scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Customer Ratings &amp; Reviews
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Verified feedback, honest impressions, and technical ratings from community buyers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verified Community Feedback</span>
          </div>
        </div>

        {/* Top Two-Column Summary & Review Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Overall Rating Breakdown & Star Percentages */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Rating Overview
              </h3>

              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-white tracking-tight">
                  {stats.averageRating.toFixed(1)}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(stats.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>

              {/* Recommendation rate pill */}
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{stats.recommendationPercentage}% of customers recommend this product</span>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300 mb-1 flex justify-between">
                <span>Rating Breakdown</span>
                {selectedStarFilter !== null && (
                  <button
                    onClick={() => setSelectedStarFilter(null)}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {stats.distribution.map((item) => {
                const isSelected = selectedStarFilter === item.star;
                return (
                  <button
                    key={item.star}
                    type="button"
                    onClick={() =>
                      setSelectedStarFilter(isSelected ? null : item.star)
                    }
                    className={`w-full flex items-center gap-3 text-xs p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-800 border border-emerald-500/40'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-12 text-slate-300 font-medium shrink-0 flex items-center gap-1">
                      <span>{item.star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>

                    {/* Progress Bar Track */}
                    <div className="flex-1 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <span className="w-14 text-right text-slate-400 font-mono text-[11px] shrink-0">
                      {item.percentage}%
                    </span>
                    <span className="w-6 text-right text-slate-500 text-[11px] shrink-0">
                      ({item.count})
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Click any star rating bar above to filter reviews by rating tier.
            </p>
          </div>

          {/* Right: Authenticated Submission Form OR Guest Login Prompt */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white">
                      {existingUserReview ? 'Update Your Review' : 'Write a Customer Review'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sharing as <span className="text-emerald-400 font-medium">{user.name}</span>
                    </p>
                  </div>
                  {existingUserReview && (
                    <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Previously Reviewed
                    </span>
                  )}
                </div>

                {/* Star Rating Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Overall Rating <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (formHoverRating || formRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setFormRating(star);
                              setFormErrors((prev) => ({ ...prev, rating: undefined }));
                            }}
                            onMouseEnter={() => setFormHoverRating(star)}
                            onMouseLeave={() => setFormHoverRating(0)}
                            className="p-1 text-slate-700 hover:scale-115 transition-transform cursor-pointer"
                            aria-label={`Rate ${star} star`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-medium text-amber-300 ml-2">
                      {ratingLabelMap[activeRatingDisplay]}
                    </span>
                  </div>
                  {formErrors.rating && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.rating}</span>
                    </p>
                  )}
                </div>

                {/* Headline / Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Review Headline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (formErrors.title) {
                        setFormErrors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    placeholder="e.g. Exceptional audio clarity and comfortable fit"
                    maxLength={100}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.title}</span>
                    </p>
                  )}
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Written Feedback <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {formComment.length}/2000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => {
                      setFormComment(e.target.value);
                      if (formErrors.comment) {
                        setFormErrors((prev) => ({ ...prev, comment: undefined }));
                      }
                    }}
                    placeholder="What did you like or dislike? How does it perform in daily usage? Is the build quality worth the price?"
                    maxLength={2000}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
                  />
                  {formErrors.comment && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.comment}</span>
                    </p>
                  )}
                </div>

                {/* Alerts */}
                {submitSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}
                {submitError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Review...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{existingUserReview ? 'Update My Review' : 'Submit Review'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Guest / Unauthenticated State */
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-base font-bold text-white">
                    Have you used this product?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sign in to your NovaCart customer account to leave verified ratings, detailed feedback, and assist prospective buyers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToLogin) {
                      onNavigateToLogin();
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Write a Review</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List & Controls */}
        <div className="space-y-4 pt-4">
          {/* Controls Bar: Filter Chips & Sorting Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedStarFilter(null)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedStarFilter === null
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({reviews.length})
              </button>

              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                const isSelected = selectedStarFilter === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className={`w-3 h-3 ${isSelected ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'}`} />
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-reviews" className="text-xs text-slate-400 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort-reviews"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* List of Reviews */}
          {filteredReviews.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">
                {selectedStarFilter !== null
                  ? `No ${selectedStarFilter}-star reviews found`
                  : 'No reviews yet for this product'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedStarFilter !== null
                  ? 'Try selecting a different rating filter or clearing the filter to view all customer reviews.'
                  : 'Be the first authenticated customer to share your thoughts and rate this item!'}
              </p>
              {selectedStarFilter !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedStarFilter(null)}
                  className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer pt-1"
                >
                  View All Reviews
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((rev) => {
                const isCurrentUserReview = user && rev.userId === user._id;
                const initials = rev.userName
                  ? rev.userName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'NC';

                const helpfulCount = (helpfulVotes[rev._id] || 0) + (rev.rating >= 4 ? 3 : 1);
                const hasVoted = userVoted[rev._id];

                return (
                  <div
                    key={rev._id}
                    className={`bg-slate-900/80 rounded-2xl p-6 border transition-all ${
                      isCurrentUserReview
                        ? 'border-emerald-500/40 shadow-md shadow-emerald-500/5'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
                          {initials}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {rev.userName}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified Buyer</span>
                              </span>
                            )}
                            {isCurrentUserReview && (
                              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Reviewed on {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Headline */}
                    <h4 className="text-sm sm:text-base font-bold text-white mt-4">
                      {rev.title}
                    </h4>

                    {/* Comment Body */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 whitespace-pre-line">
                      {rev.comment}
                    </p>

                    {/* Footer / Helpful Button */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleHelpfulClick(rev._id)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                          hasVoted
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                        <span>Helpful ({helpfulCount})</span>
                      </button>

                      <span className="text-[11px] text-slate-500">
                        NovaCart Verified Feedback
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
