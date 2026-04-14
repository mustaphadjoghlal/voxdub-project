import React, { createContext, useContext, useState } from 'react';

type Role = 'admin' | 'artist' | 'visitor';

interface AuthContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('voxdub_user_role');
    if (saved === 'admin' || saved === 'artist') return saved;
    return 'visitor';
  });

  const setUserRole = (role: Role) => {
    localStorage.setItem('voxdub_user_role', role);
    setRoleState(role);
  };

  const login = (user: string, pass: string): boolean => {
    if (user === 'admin2026' && pass === 'admin2026') {
      setUserRole('admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole('visitor');
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
