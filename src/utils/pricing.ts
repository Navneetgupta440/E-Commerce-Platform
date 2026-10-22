/**
 * Pricing and Cart utility calculations.
 * Pure logic decoupled from React DOM to allow fast, deterministic unit testing.
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export const SHIPPING_THRESHOLD = 50.0;
export const STANDARD_SHIPPING_FEE = 9.99;
export const TAX_RATE = 0.08; // 8% sales tax

/**
 * Validates and calculates order totals given items and optional promo code.
 */
export function calculateOrderTotals(
  items: CartItem[],
  promoCode?: string
): PriceBreakdown {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    };
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const qty = Math.max(1, Math.floor(item.quantity || 1));
    const price = Math.max(0, Number(item.price) || 0);
    return sum + price * qty;
  }, 0);

  // Discount codes
  let discount = 0;
  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    if (code === 'MERN10') {
      discount = subtotal * 0.1; // 10% off
    } else if (code === 'SAVE20') {
      discount = subtotal * 0.2; // 20% off
    } else if (code === 'WELCOME5') {
      discount = Math.min(subtotal, 5.0); // $5 off
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);

  // Free shipping over $50 after discount
  const shipping =
    discountedSubtotal >= SHIPPING_THRESHOLD || discountedSubtotal === 0
      ? 0
      : STANDARD_SHIPPING_FEE;

  // Tax calculation
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;

  // Final total rounded to 2 decimals
  const total = Math.round((discountedSubtotal + shipping + tax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax,
    shipping,
    total,
  };
}

/**
 * Modifies cart state deterministically.
 */
export function updateCartQuantity(
  cart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] {
  if (newQuantity <= 0) {
    return cart.filter((item) => item.productId !== productId);
  }

  return cart.map((item) => {
    if (item.productId === productId) {
      const clampedQty = Math.min(newQuantity, item.stock);
      return { ...item, quantity: clampedQty };
    }
    return item;
  });
}

/**
 * Adds an item to the cart or increments its quantity up to available stock.
 */
export function addItemToCart(
  cart: CartItem[],
  newItem: Omit<CartItem, 'quantity'> & { quantity?: number }
): CartItem[] {
  const existing = cart.find((i) => i.productId === newItem.productId);
  const qtyToAdd = Math.max(1, newItem.quantity || 1);

  if (existing) {
    const nextQty = Math.min(existing.stock, existing.quantity + qtyToAdd);
    return cart.map((item) =>
      item.productId === newItem.productId
        ? { ...item, quantity: nextQty }
        : item
    );
  }

  const initialQty = Math.min(newItem.stock, qtyToAdd);
  return [...cart, { ...newItem, quantity: initialQty }];
}
