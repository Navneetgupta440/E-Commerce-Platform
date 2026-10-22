import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure logic test for wishlist toggle, add, remove, and duplicate handling.
 */
function toggleWishlistItem(list: string[], productId: string): { updated: string[]; isAdded: boolean } {
  const index = list.indexOf(productId);
  if (index > -1) {
    return {
      updated: list.filter((id) => id !== productId),
      isAdded: false,
    };
  } else {
    return {
      updated: [...list, productId],
      isAdded: true,
    };
  }
}

function addToWishlist(list: string[], productId: string): string[] {
  if (list.includes(productId)) return list;
  return [...list, productId];
}

function removeFromWishlist(list: string[], productId: string): string[] {
  return list.filter((id) => id !== productId);
}

test('wishlist - toggle adds item when absent', () => {
  const initial: string[] = ['prod-1'];
  const res = toggleWishlistItem(initial, 'prod-2');
  assert.equal(res.isAdded, true);
  assert.deepEqual(res.updated, ['prod-1', 'prod-2']);
});

test('wishlist - toggle removes item when present', () => {
  const initial: string[] = ['prod-1', 'prod-2', 'prod-3'];
  const res = toggleWishlistItem(initial, 'prod-2');
  assert.equal(res.isAdded, false);
  assert.deepEqual(res.updated, ['prod-1', 'prod-3']);
});

test('wishlist - addToWishlist prevents duplicates', () => {
  const initial: string[] = ['prod-1'];
  const updated1 = addToWishlist(initial, 'prod-1');
  assert.deepEqual(updated1, ['prod-1']);

  const updated2 = addToWishlist(initial, 'prod-2');
  assert.deepEqual(updated2, ['prod-1', 'prod-2']);
});

test('wishlist - removeFromWishlist handles empty or non-existent items safely', () => {
  const initial: string[] = ['prod-1'];
  const res1 = removeFromWishlist(initial, 'prod-99');
  assert.deepEqual(res1, ['prod-1']);

  const res2 = removeFromWishlist(initial, 'prod-1');
  assert.deepEqual(res2, []);
});
