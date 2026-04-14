'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'artist' | 'client' | 'visitor';

interface AuthContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  logout: () => void;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setRoleState] = useState<Role>('visitor');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // هذا الـ useEffect يشتغل مرة واحدة فقط بعد تحميل الصفحة في المتصفح
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userRole');
      if (saved && ['admin', 'artist', 'client'].includes(saved)) {
        setRoleState(saved as Role);
      }
      setIsLoaded(true);   // ← مهم جداً: نعلن أن الـ auth جاهز
    }
  }, []);

  const setUserRole = (role: Role) => {
    localStorage.setItem('userRole', role);
    setRoleState(role);
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    setRoleState('visitor');
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, logout, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
