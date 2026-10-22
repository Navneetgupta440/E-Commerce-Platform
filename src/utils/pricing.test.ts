import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  updateCartQuantity,
  addItemToCart,
  type CartItem,
} from './pricing';

test('calculateOrderTotals returns zeros for empty cart', () => {
  const result = calculateOrderTotals([]);
  assert.equal(result.subtotal, 0);
  assert.equal(result.total, 0);
  assert.equal(result.shipping, 0);
  assert.equal(result.tax, 0);
});

test('calculateOrderTotals applies standard shipping under $50', () => {
  const items: CartItem[] = [
    {
      productId: 'p1',
      name: 'Wireless Mouse',
      price: 25.0,
      quantity: 1,
      imageUrl: 'test.jpg',
      stock: 10,
    },
  ];
  const result = calculateOrderTotals(items);
  assert.equal(result.subtotal, 25.0);
  assert.equal(result.shipping, 9.99);
  // Tax: 25 * 0.08 = 2.00
  assert.equal(result.tax, 2.0);
  // Total: 25 + 9.99 + 2.0 = 36.99
  assert.equal(result.total, 36.99);
});

test('calculateOrderTotals gives free shipping at or over $50', () => {
  const items: CartItem[] = [
    {
      productId: 'p1',
      name: 'Noise Cancelling Headphones',
      price: 150.0,
      quantity: 1,
      imageUrl: 'test.jpg',
      stock: 5,
    },
  ];
  const result = calculateOrderTotals(items);
  assert.equal(result.subtotal, 150.0);
  assert.equal(result.shipping, 0);
  // Tax: 150 * 0.08 = 12.00
  assert.equal(result.tax, 12.0);
  assert.equal(result.total, 162.0);
});

test('calculateOrderTotals applies MERN10 discount code', () => {
  const items: CartItem[] = [
    {
      productId: 'p1',
      name: 'Smart Watch',
      price: 100.0,
      quantity: 1,
      imageUrl: 'test.jpg',
      stock: 5,
    },
  ];
  const result = calculateOrderTotals(items, 'MERN10');
  assert.equal(result.subtotal, 100.0);
  assert.equal(result.discount, 10.0);
  // Discounted subtotal: 90.00 -> free shipping
  assert.equal(result.shipping, 0);
  // Tax: 90 * 0.08 = 7.20
  assert.equal(result.tax, 7.2);
  assert.equal(result.total, 97.2);
});

test('updateCartQuantity removes item if quantity <= 0', () => {
  const cart: CartItem[] = [
    {
      productId: 'p1',
      name: 'Item 1',
      price: 10,
      quantity: 2,
      imageUrl: 'test.jpg',
      stock: 10,
    },
    {
      productId: 'p2',
      name: 'Item 2',
      price: 20,
      quantity: 1,
      imageUrl: 'test.jpg',
      stock: 5,
    },
  ];
  const updated = updateCartQuantity(cart, 'p1', 0);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].productId, 'p2');
});

test('updateCartQuantity caps quantity at max available stock', () => {
  const cart: CartItem[] = [
    {
      productId: 'p1',
      name: 'Item 1',
      price: 10,
      quantity: 2,
      imageUrl: 'test.jpg',
      stock: 4,
    },
  ];
  const updated = updateCartQuantity(cart, 'p1', 10);
  assert.equal(updated[0].quantity, 4);
});

test('addItemToCart handles existing vs new items properly', () => {
  const cart: CartItem[] = [];
  const afterFirst = addItemToCart(cart, {
    productId: 'p1',
    name: 'Item 1',
    price: 15,
    imageUrl: 'test.jpg',
    stock: 5,
    quantity: 2,
  });
  assert.equal(afterFirst.length, 1);
  assert.equal(afterFirst[0].quantity, 2);

  const afterSecond = addItemToCart(afterFirst, {
    productId: 'p1',
    name: 'Item 1',
    price: 15,
    imageUrl: 'test.jpg',
    stock: 5,
    quantity: 2,
  });
  assert.equal(afterSecond.length, 1);
  assert.equal(afterSecond[0].quantity, 4);

  // Exceeding stock caps at stock (5)
  const afterThird = addItemToCart(afterSecond, {
    productId: 'p1',
    name: 'Item 1',
    price: 15,
    imageUrl: 'test.jpg',
    stock: 5,
    quantity: 3,
  });
  assert.equal(afterThird[0].quantity, 5);
});
