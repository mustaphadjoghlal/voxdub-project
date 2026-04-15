'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../components/firebase';

type Role = 'admin' | 'artist' | 'client' | 'visitor';

interface AuthContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  logout: () => void;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setRoleState] = useState<Role>('visitor');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase يتابع حالة تسجيل الدخول تلقائياً
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // نجيب الـ role من localStorage
        const saved = localStorage.getItem('userRole');
        if (saved === 'admin' || saved === 'artist' || saved === 'client') {
          setRoleState(saved);
        } else {
          setRoleState('client'); // default لأي مستخدم مسجل
        }
      } else {
        setUser(null);
        setRoleState('visitor');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setUserRole = (role: Role) => {
    localStorage.setItem('userRole', role);
    setRoleState(role);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
    setRoleState('visitor');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, logout, user, loading }}>
      {/* نخفي المحتوى لحد ما نعرف حالة المستخدم */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
