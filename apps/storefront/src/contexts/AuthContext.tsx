'use client';

import AuthModal from '@/components/layout/AuthModal';
import { apiPost, clearAuthToken, LoginRequest, LoginResponse, setAuthToken, User } from '@ecommerce/api-client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  requestOtp: (phone_number: string) => Promise<any>;
  registerPhone: (phone_number: string, full_name: string) => Promise<any>;
  verifyOtp: (phone_number: string, otp: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (returnUrl?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReturnUrl, setAuthModalReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await apiPost<LoginResponse>('/auth/login', data);
    setAuthToken(response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const requestOtp = async (phone_number: string) => {
    return await apiPost('/auth/login/request-otp', { phone_number });
  };

  const registerPhone = async (phone_number: string, full_name: string) => {
    return await apiPost('/auth/register', { phone_number, full_name });
  };

  const verifyOtp = async (phone_number: string, otp: string) => {
    const response = await apiPost<{ success: boolean; access_token: string; user: User }>('/auth/verify-otp', { phone_number, otp });
    
    if (response && response.access_token) {
      setAuthToken(response.access_token);
    }
    if (response && response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } else {
      throw new Error('Verifikasi OTP gagal');
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const openAuthModal = (returnUrl?: string) => {
    setAuthModalReturnUrl(returnUrl || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReturnUrl(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        requestOtp,
        registerPhone,
        verifyOtp,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen
      }}
    >
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} returnUrl={authModalReturnUrl} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

