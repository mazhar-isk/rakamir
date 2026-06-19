'use client';

import { AdminUser, apiPost, clearAuthToken, LoginRequest, LoginResponse, setAuthToken } from '@ecommerce/api-client';
import { hasPermission, Permission } from '@ecommerce/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string;
  can: (permission: Permission) => boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bo_admin');
    if (stored) {
      try { setAdmin(JSON.parse(stored)); } catch { }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    // Mock is handled transparently by the Axios interceptor (NEXT_PUBLIC_MOCK_API=true)
    const response = await apiPost<LoginResponse>('/admin/login', data);

    if (!response) {
      throw new Error('Login gagal.');
    }

    setAuthToken(response.access_token);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('bo_admin', JSON.stringify({ ...response.user }));
    setAdmin({ ...response.user } as unknown as AdminUser);
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('bo_admin');
    setAdmin(null);
  };

  const role = admin?.role?.login_scope ?? '';
  const can = (permission: Permission) => hasPermission(role, permission);

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, role, can, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
