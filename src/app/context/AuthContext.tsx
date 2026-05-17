'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebase';

type Role = 'admin' | 'artist' | 'client' | 'visitor';

const ADMIN_EMAIL = 'admin@voxdub.com';

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
        // Admin: verify by email from Firebase Auth (not localStorage)
        if (firebaseUser.email === ADMIN_EMAIL) {
          setRoleState('admin');
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userId', 'admin');
          setMounted(true);
          return;
        }

        // Verify role from Firestore
        try {
          const artistsSnap = await getDocs(collection(db, 'artists'));
          const artistDoc = artistsSnap.docs.find(d => d.data().email === firebaseUser.email);
          if (artistDoc) {
            setRoleState('artist');
            localStorage.setItem('userRole', 'artist');
            localStorage.setItem('userId', artistDoc.id);
            setMounted(true);
            return;
          }

          const clientsSnap = await getDocs(collection(db, 'clients'));
          const clientDoc = clientsSnap.docs.find(d => d.data().email === firebaseUser.email);
          if (clientDoc) {
            setRoleState('client');
            localStorage.setItem('userRole', 'client');
            localStorage.setItem('userId', clientDoc.id);
            localStorage.setItem('userName', clientDoc.data().name || '');
            setMounted(true);
            return;
          }
        } catch (err) {
          console.error(err);
        }

        setRoleState('visitor');
        setMounted(true);
      } else {
        // No Firebase session — always visitor, clear any stale localStorage
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        setRoleState('visitor');
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
