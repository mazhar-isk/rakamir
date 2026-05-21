'use client';

import { CartItem, Product, ProductVariant } from '@ecommerce/api-client';
import { createContext, ReactNode, useContext, useState } from 'react';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.variant?.id === variant?.id
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * product.price }
            : i
        );
      }
      const newItem: CartItem = {
        id: `${product.id}-${variant?.id ?? 'default'}-${Date.now()}`,
        product,
        variant,
        quantity,
        subtotal: quantity * product.price,
      };
      return [...prev, newItem];
    });
  };

  const removeItem = (itemId: string) =>
    setItems((prev) => prev.filter((i) => i.id !== itemId));

  const updateQuantity = (itemId: string, quantity: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity, subtotal: quantity * i.product.price } : i
      )
    );

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
