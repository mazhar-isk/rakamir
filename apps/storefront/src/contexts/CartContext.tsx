'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CartItem, Product, ProductVariant } from '@ecommerce/api-client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
  const { isAuthenticated } = useAuth();

  // Clear cart automatically when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
    }
  }, [isAuthenticated]);

  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (!isAuthenticated) {
      toast.info('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
      // Navigate to login — we use window.location to avoid needing useRouter here
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/login?returnUrl=${returnUrl}`;
      return;
    }

    let isUpdate = false;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.variant?.id === variant?.id
      );
      const unitPrice = product.price + (variant?.price_modifier ?? 0);
      if (existing) {
        isUpdate = true;
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * unitPrice }
            : i
        );
      }
      const newItem: CartItem = {
        id: `${product.id}-${variant?.id ?? 'default'}-${Date.now()}`,
        product,
        variant,
        quantity,
        subtotal: quantity * unitPrice,
      };
      return [...prev, newItem];
    });

    // Show success notification after state update is queued
    const label = variant ? `${product.name} (${variant.name})` : product.name;
    if (isUpdate) {
      toast.success(`Jumlah "${label}" diperbarui di keranjang 🛒`);
    } else {
      toast.success(`"${label}" berhasil ditambahkan ke keranjang 🛒`);
    }
  };


  const removeItem = (itemId: string) =>
    setItems((prev) => prev.filter((i) => i.id !== itemId));

  const updateQuantity = (itemId: string, quantity: number) =>
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const unitPrice = i.product.price + (i.variant?.price_modifier ?? 0);
          return { ...i, quantity, subtotal: quantity * unitPrice };
        }
        return i;
      })
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
