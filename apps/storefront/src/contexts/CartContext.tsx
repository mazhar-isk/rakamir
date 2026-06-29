'use client';

import { useAuth } from '@/contexts/AuthContext';
import { apiClient, apiPost, CartItem, Product, ProductVariant } from '@ecommerce/api-client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  cartId: string | null;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapBackendItemToCartItem = (item: any): CartItem => {
  const actualPrice = item.price / 100;
  const actualSubtotal = item.subtotal / 100;

  return {
    id: item.product_id, // Use product_id as the ID for simpler update/delete matching
    product: {
      id: item.product_id,
      slug: item.product_id,
      name: item.name,
      description: '',
      price: item.price,
      original_price: actualPrice,
      stock: 999,
      images: item.image_url ? [item.image_url] : [],
      category: { id: '', name: '', slug: '' },
      categories: [],
      tags: [],
      rating: 5,
      review_count: 0,
      is_featured: false,
      is_new: false,
      is_active: true,
      sold_count: 0,
      created_at: item.created_at,
    },
    variant: {
      id: item.product_variant_id,
      name: item.product_variant_name,
      value: item.product_variant_name,
      price_modifier: item.price_modifier,
      stock: item.stock,
      picture: item.image_url,
    },
    quantity: item.quantity,
    subtotal: item.subtotal,
  };
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const { isAuthenticated, openAuthModal } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setCartId(null);
      return;
    }
    try {
      const response = await apiClient.get<any>('/carts').then((res) => res.data);
      if (response && response.items) {
        setCartId(response.id);
        const mappedItems = response.items.map(mapBackendItemToCartItem);
        setItems(mappedItems);
      } else {
        setCartId(null);
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  // Sync cart automatically when user auth state changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addItem = async (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (!isAuthenticated) {
      toast.info('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
      openAuthModal(window.location.pathname);
      return;
    }

    try {
      await apiPost<any>('/carts/items', {
        product_variant_id: variant?.id,
        quantity,
      });
      await fetchCart();

      const label = variant ? `${product.name} (${variant.name})` : product.name;
      toast.success(`"${label}" berhasil ditambahkan ke keranjang 🛒`);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal menambahkan produk';
      toast.error(errMsg);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) return;
    try {
      await apiClient.delete(`/carts/items/${itemId}`);
      await fetchCart();
      toast.success('Produk berhasil dihapus dari keranjang');
    } catch (err: any) {
      toast.error('Gagal menghapus produk dari keranjang');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    console.log(itemId, quantity);

    if (!isAuthenticated) return;
    try {
      await apiClient.put(`/carts/items/${itemId}`, { quantity });
      await fetchCart();
    } catch (err: any) {
      toast.error('Gagal memperbarui jumlah produk');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await apiClient.delete('/carts');
      setItems([]);
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, cartId, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
