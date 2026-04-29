'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../components/firebase';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // المدير
        if (firebaseUser.email === 'admin@voxdub.com') {
          setRoleState('admin');
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userId', 'admin');
          setMounted(true);
          return;
        }

        // نتحقق إذا في localStorage role محفوظ
        const savedRole = localStorage.getItem('userRole');
        if (savedRole === 'artist' || savedRole === 'client') {
          setRoleState(savedRole);
          setMounted(true);
          return;
        }

        // نبحث في Firestore لتحديد الدور
        try {
          const artistsSnap = await getDocs(collection(db, 'artists'));
          const artist = artistsSnap.docs.find(d => d.data().email === firebaseUser.email);
          if (artist) {
            setRoleState('artist');
            localStorage.setItem('userRole', 'artist');
            localStorage.setItem('userId', artist.id);
            setMounted(true);
            return;
          }

          const clientsSnap = await getDocs(collection(db, 'clients'));
          const client = clientsSnap.docs.find(d => d.data().email === firebaseUser.email);
          if (client) {
            setRoleState('client');
            localStorage.setItem('userRole', 'client');
            localStorage.setItem('userId', client.id);
            localStorage.setItem('userName', client.data().name || '');
            setMounted(true);
            return;
          }
        } catch (err) {
          console.error(err);
        }

        setRoleState('visitor');
        setMounted(true);
      } else {
        // لا يوجد مستخدم مسجل في Firebase Auth
        // نتحقق من localStorage (للمدير الذي قد لا يكون في Firebase Auth)
        const savedRole = localStorage.getItem('userRole');
        if (savedRole === 'admin' || savedRole === 'artist' || savedRole === 'client') {
          setRoleState(savedRole as Role);
        } else {
          setRoleState('visitor');
        }
        setMounted(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const setUserRole = (role: Role) => {
    localStorage.setItem('userRole', role);
    setRoleState(role);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
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
