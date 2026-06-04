'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  username: string;
  role: 'admin' | 'seller';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user session from localStorage
  useEffect(() => {
    // Safety Timeout: Force loader off after 3 seconds in case of storage blocks or hydration freezes
    const safetyTimeout = setTimeout(() => {
      console.warn('Authentication loading timeout exceeded. Forcing load completion.');
      setIsLoading(false);
    }, 3000);

    let loadedUser: User | null = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('sneaker_pos_user');
        if (savedUser) {
          loadedUser = JSON.parse(savedUser);
        }
      }
    } catch (e) {
      console.warn('LocalStorage is blocked or failed to load user session:', e);
    }

    setTimeout(() => {
      setUser(loadedUser);
      setIsLoading(false);
      clearTimeout(safetyTimeout);
    }, 0);

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Handle route protection based on auth state and role
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = pathname === '/login';

    if (!user && !isPublicRoute) {
      router.replace('/login');
    } else if (user && isPublicRoute) {
      // If logged in and trying to access login page, redirect appropriately
      if (user.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/pdv');
      }
    } else if (user && user.role === 'seller' && pathname === '/dashboard') {
      // Prevent sellers from entering dashboard
      router.replace('/pdv');
    }
  }, [user, pathname, isLoading, router]);

  const login = (username: string, password: string): boolean => {
    // Basic mock authentication
    if (username === 'admin' && password === 'admin') {
      const loggedUser: User = { username: 'Dono', role: 'admin' };
      setUser(loggedUser);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sneaker_pos_user', JSON.stringify(loggedUser));
        }
      } catch (e) {
        console.warn('Failed to save user session to LocalStorage:', e);
      }
      router.replace('/dashboard');
      return true;
    } else if (username === 'user' && password === 'user') {
      const loggedUser: User = { username: 'Vendedor', role: 'seller' };
      setUser(loggedUser);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sneaker_pos_user', JSON.stringify(loggedUser));
        }
      } catch (e) {
        console.warn('Failed to save user session to LocalStorage:', e);
      }
      router.replace('/pdv');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('sneaker_pos_user');
      }
    } catch (e) {
      console.warn('Failed to remove user session from LocalStorage:', e);
    }
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
