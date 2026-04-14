'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { setUserRole } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // تسجيل دخول بسيط جدًا للاختبار
    if (email.toLowerCase().includes('artist')) {
      setUserRole('artist');
    } else {
      setUserRole('client');
    }

    // توجيه بسيط
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-center mb-8">تسجيل الدخول</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="أدخل الإيميل (اكتب artist لو عايز artist)"
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          جرب تكتب "artist" في الإيميل عشان تدخل كمعلق
        </p>
      </div>
    </div>
  );
}
