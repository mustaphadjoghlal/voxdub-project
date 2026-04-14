'use client';   // ←←← هذا السطر ضروري جدًا

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'artist' | 'client' | 'visitor';

interface AuthContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setRoleState] = useState<Role>('visitor');

  // تحميل الدور من localStorage عند أول تحميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userRole');
      if (saved === 'admin' || saved === 'artist' || saved === 'client') {
        setRoleState(saved);
      }
    }
  }, []);

  const setUserRole = (role: Role) => {
    localStorage.setItem('userRole', role);
    setRoleState(role);
  };

  const logout = () => {
    localStorage.removeItem('userRole');   // ← أفضل من clear()
    setRoleState('visitor');
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, logout }}>
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
