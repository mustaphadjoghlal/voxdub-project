'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';           // ← المسار الصحيح
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../components/firebase';               // ← المسار الصحيح

export default function Login() {
  const { setUserRole, isLoaded } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // هنا تضع منطق تسجيل الدخول الحقيقي لاحقاً (مع Firebase Auth أو Supabase)
      // حالياً نستخدم localStorage كحل مؤقت
      if (email.includes('artist')) {
        setUserRole('artist');
      } else if (email.includes('client')) {
        setUserRole('client');
      } else {
        setUserRole('client'); // افتراضي
      }

      // توجيه بعد تسجيل الدخول
      window.location.href = '/dashboard';   // أو أي صفحة داشبورد عندك
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl">🎙️</span>
          </div>
          <h1 className="text-3xl font-black mt-6">تسجيل الدخول</h1>
          <p className="text-gray-500 mt-2">مرحباً بعودتك إلى VoxDub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-red-600"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-red-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-bold text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-bold text-lg hover:bg-red-700 transition disabled:opacity-70"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-red-600 font-bold hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
