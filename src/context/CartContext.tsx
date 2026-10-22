import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CartItem,
  PriceBreakdown,
  calculateOrderTotals,
  addItemToCart,
  updateCartQuantity,
} from '../utils/pricing';
import { Product } from '../services/api';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  promoCode: string;
  totals: PriceBreakdown;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('novacart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState<string>(() => {
    return localStorage.getItem('novacart_promo') || '';
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem('novacart_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist promo
  useEffect(() => {
    if (promoCode) {
      localStorage.setItem('novacart_promo', promoCode);
    } else {
      localStorage.removeItem('novacart_promo');
    }
  }, [promoCode]);

  const totals = calculateOrderTotals(cart, promoCode);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) =>
      addItemToCart(prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        quantity,
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => updateCartQuantity(prev, productId, quantity));
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
  };

  const applyPromoCode = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    if (['MERN10', 'SAVE20', 'WELCOME5'].includes(formatted)) {
      setPromoCode(formatted);
      return true;
    }
    return false;
  };

  const removePromoCode = () => {
    setPromoCode('');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        promoCode,
        totals,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
