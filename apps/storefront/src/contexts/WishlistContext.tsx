'use client';

import { apiClient, apiPost } from '@ecommerce/api-client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  favoriteIds: string[];
  toggleFavorite: (productId: string, productName: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavoriteIds([]);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<string[]>('/favorites');
      setFavoriteIds(res.data ?? []);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = useCallback(async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      toast.error('Silakan login untuk menyimpan produk ke favorit');
      return;
    }

    // Optimistic update
    const isAdding = !favoriteIds.includes(productId);
    setFavoriteIds((prev) => 
      isAdding ? [...prev, productId] : prev.filter((id) => id !== productId)
    );

    if (isAdding) {
      toast.success(`${productName} ditambahkan ke favorit`);
    } else {
      toast.info(`${productName} dihapus dari favorit`);
    }

    try {
      // Hit API
      const res = await apiPost<{ data: string[] }>('/favorites', { productId });
      // Sync state with server response (in case of conflict)
      if (res && Array.isArray(res.data)) {
        setFavoriteIds(res.data);
      }
    } catch (error) {
      // Revert on error
      toast.error('Gagal memperbarui favorit');
      setFavoriteIds((prev) => 
        isAdding ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    }
  }, [isAuthenticated, favoriteIds]);

  return (
    <WishlistContext.Provider value={{ favoriteIds, toggleFavorite, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
