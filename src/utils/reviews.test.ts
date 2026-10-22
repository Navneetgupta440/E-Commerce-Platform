import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRatingStats,
  validateReviewInput,
  formatReviewDate,
  type ReviewItem,
} from './reviews';

test('calculateRatingStats calculates correct average and distribution', () => {
  const reviews: ReviewItem[] = [
    {
      _id: 'r1',
      userId: 'u1',
      userName: 'Alice',
      rating: 5,
      title: 'Amazing quality',
      comment: 'Exceeded all my expectations!',
      createdAt: '2025-01-10T12:00:00Z',
    },
    {
      _id: 'r2',
      userId: 'u2',
      userName: 'Bob',
      rating: 5,
      title: 'Flawless',
      comment: 'Would recommend to everyone.',
      createdAt: '2025-01-11T12:00:00Z',
    },
    {
      _id: 'r3',
      userId: 'u3',
      userName: 'Charlie',
      rating: 4,
      title: 'Very good',
      comment: 'Almost perfect, great battery life.',
      createdAt: '2025-01-12T12:00:00Z',
    },
    {
      _id: 'r4',
      userId: 'u4',
      userName: 'David',
      rating: 2,
      title: 'Mediocre packaging',
      comment: 'The box was dented but device works.',
      createdAt: '2025-01-13T12:00:00Z',
    },
  ];

  const stats = calculateRatingStats(reviews);

  // Total reviews: 4
  assert.equal(stats.totalReviews, 4);

  // Sum: 5 + 5 + 4 + 2 = 16. 16 / 4 = 4.0
  assert.equal(stats.averageRating, 4.0);

  // 3 out of 4 reviews have rating >= 4 -> 75%
  assert.equal(stats.recommendationPercentage, 75);

  // Distribution:
  // 5 star: 2 (50%)
  // 4 star: 1 (25%)
  // 3 star: 0 (0%)
  // 2 star: 1 (25%)
  // 1 star: 0 (0%)
  const fiveStar = stats.distribution.find((d) => d.star === 5);
  const fourStar = stats.distribution.find((d) => d.star === 4);
  const threeStar = stats.distribution.find((d) => d.star === 3);
  const twoStar = stats.distribution.find((d) => d.star === 2);
  const oneStar = stats.distribution.find((d) => d.star === 1);

  assert.equal(fiveStar?.count, 2);
  assert.equal(fiveStar?.percentage, 50);

  assert.equal(fourStar?.count, 1);
  assert.equal(fourStar?.percentage, 25);

  assert.equal(threeStar?.count, 0);
  assert.equal(threeStar?.percentage, 0);

  assert.equal(twoStar?.count, 1);
  assert.equal(twoStar?.percentage, 25);

  assert.equal(oneStar?.count, 0);
  assert.equal(oneStar?.percentage, 0);
});

test('calculateRatingStats handles empty review list with fallback', () => {
  const stats = calculateRatingStats([], 4.8, 12);
  assert.equal(stats.totalReviews, 12);
  assert.equal(stats.averageRating, 4.8);
  assert.equal(stats.recommendationPercentage, 95);
});

test('validateReviewInput detects invalid inputs', () => {
  const emptyRes = validateReviewInput({
    rating: 0,
    title: '',
    comment: '',
  });

  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.rating);
  assert.ok(emptyRes.errors.title);
  assert.ok(emptyRes.errors.comment);

  const shortRes = validateReviewInput({
    rating: 5,
    title: 'ok',
    comment: 'good',
  });
  assert.equal(shortRes.isValid, false);
  assert.ok(shortRes.errors.title);
  assert.ok(shortRes.errors.comment);
});

test('validateReviewInput approves valid reviews', () => {
  const validRes = validateReviewInput({
    rating: 5,
    title: 'Sensational Sound Quality',
    comment: 'The active noise cancelling is top tier and very comfortable for flights.',
  });

  assert.equal(validRes.isValid, true);
  assert.deepEqual(validRes.errors, {});
});

test('formatReviewDate formats valid ISO dates cleanly', () => {
  const formatted = formatReviewDate('2025-05-15T00:00:00Z');
  assert.match(formatted, /May 15, 2025/);
});
