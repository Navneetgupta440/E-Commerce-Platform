export interface ReviewItem {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface RatingBreakdownItem {
  star: number;
  count: number;
  percentage: number;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: RatingBreakdownItem[];
  recommendationPercentage: number;
}

/**
 * Calculates rating statistics and percentage distribution across 1 to 5 stars.
 */
export function calculateRatingStats(
  reviews?: ReviewItem[] | null,
  fallbackRating: number = 5.0,
  fallbackCount: number = 0
): RatingStats {
  const list = Array.isArray(reviews) ? reviews : [];

  if (list.length === 0) {
    const defaultTotal = Math.max(0, fallbackCount);
    const avg = Number(Math.min(5, Math.max(1, fallbackRating)).toFixed(1));
    const roundedAvg = Math.round(avg);

    const distribution: RatingBreakdownItem[] = [5, 4, 3, 2, 1].map((star) => {
      const isDefaultStar = star === roundedAvg;
      return {
        star,
        count: isDefaultStar ? defaultTotal : 0,
        percentage: defaultTotal > 0 && isDefaultStar ? 100 : 0,
      };
    });

    return {
      averageRating: avg,
      totalReviews: defaultTotal,
      distribution,
      recommendationPercentage: avg >= 4.0 ? 95 : avg >= 3.0 ? 75 : 40,
    };
  }

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let recommendCount = 0;

  for (const r of list) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    counts[star] = (counts[star] || 0) + 1;
    sum += r.rating;
    if (r.rating >= 4) {
      recommendCount += 1;
    }
  }

  const totalReviews = list.length;
  const averageRating = Number((sum / totalReviews).toFixed(1));
  const recommendationPercentage = Math.round((recommendCount / totalReviews) * 100);

  const distribution: RatingBreakdownItem[] = [5, 4, 3, 2, 1].map((star) => {
    const count = counts[star] || 0;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return {
      star,
      count,
      percentage,
    };
  });

  return {
    averageRating,
    totalReviews,
    distribution,
    recommendationPercentage,
  };
}

/**
 * Validates review input before submission.
 */
export function validateReviewInput(input: {
  rating: number;
  title: string;
  comment: string;
}): {
  isValid: boolean;
  errors: { rating?: string; title?: string; comment?: string };
} {
  const errors: { rating?: string; title?: string; comment?: string } = {};

  if (!input.rating || input.rating < 1 || input.rating > 5) {
    errors.rating = 'Please select a star rating between 1 and 5.';
  }

  const cleanTitle = (input.title || '').trim();
  if (!cleanTitle) {
    errors.title = 'Please provide a review title.';
  } else if (cleanTitle.length < 3) {
    errors.title = 'Title must be at least 3 characters long.';
  } else if (cleanTitle.length > 100) {
    errors.title = 'Title must not exceed 100 characters.';
  }

  const cleanComment = (input.comment || '').trim();
  if (!cleanComment) {
    errors.comment = 'Please write a review comment.';
  } else if (cleanComment.length < 5) {
    errors.comment = 'Comment must be at least 5 characters long.';
  } else if (cleanComment.length > 2000) {
    errors.comment = 'Comment must not exceed 2000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Formats review dates into user-friendly strings.
 */
export function formatReviewDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}
