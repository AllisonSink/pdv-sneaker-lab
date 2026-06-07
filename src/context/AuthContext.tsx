'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'seller';
  tenant_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Injeção de Usuário Simulado (Bypass de Segurança)
  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored mock user:', e);
      }
    } else {
      // Injeta usuário mock imediatamente para destravar o desenvolvimento visual
        setUser({
          id: 'mock-123',
          email: 'admin@kickspdv.com',
          username: 'Admin Kicks PDV',
          role: 'admin',
          tenant_id: 'mock-tenant-id'
        });
    }
    setIsLoading(false);
  }, []);

  // Client-side route protection
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = pathname === '/login' || pathname === '/planos' || pathname === '/';

    if (!user && !isPublicRoute) {
      router.replace('/login');
    } else if (user && pathname === '/login') {
      if (user.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/pdv');
      }
    } else if (user && user.role === 'seller' && pathname === '/dashboard') {
      router.replace('/pdv');
    }
  }, [user, pathname, isLoading, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const role = email.includes('seller') ? 'seller' : 'admin';
      const loggedUser: User = {
        id: 'mock-123',
        email,
        username: email.split('@')[0] || 'demo',
        role,
        tenant_id: 'mock-tenant-id'
      };
      
      setUser(loggedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user', JSON.stringify(loggedUser));
        document.cookie = `mock_user=${encodeURIComponent(JSON.stringify(loggedUser))}; path=/; max-age=86400`;
      }

      setTimeout(() => {
        if (role === 'admin') {
          router.replace('/dashboard');
        } else {
          router.replace('/pdv');
        }
      }, 100);

      return true;
    } catch (err) {
      console.error('Failed to log in:', err);
      return false;
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user');
      document.cookie = 'mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
