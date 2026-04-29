'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'artist' | 'client' | 'visitor';

interface AuthContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  logout: () => void;
  mounted: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setRoleState] = useState<Role>('visitor');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // نقرأ localStorage فقط في المتصفح
    const saved = localStorage.getItem('userRole');
    if (saved === 'admin' || saved === 'artist' || saved === 'client') {
      setRoleState(saved);
    }
    setMounted(true);
  }, []);

  const setUserRole = (role: Role) => {
    localStorage.setItem('userRole', role);
    setRoleState(role);
  };

  const logout = () => {
    localStorage.clear();
    setRoleState('visitor');
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, logout, mounted }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
