'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Mic2, LogIn } from 'lucide-react';

const Login = () => {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUserRole } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted) return;
    setError('');
    setLoading(true);

    // تسجيل دخول المدير
    if (email === 'admin@voxdub.com' && password === 'admin123') {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (_) {
        // المدير ممكن ما عنده Firebase Auth account، نكمل بـ localStorage
      }
      setUserRole('admin');
      localStorage.setItem('userId', 'admin');
      router.push('/dashboard');
      setLoading(false);
      return;
    }

    try {
      // تسجيل دخول عبر Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // نحدد الـ role من Firestore
      const artistsSnapshot = await getDocs(collection(db, 'artists'));
      const artist = artistsSnapshot.docs.find(doc => doc.data().email === email);

      if (artist) {
        setUserRole('artist');
        localStorage.setItem('userId', artist.id);
        router.push('/dashboard');
        return;
      }

      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const client = clientsSnapshot.docs.find(doc => doc.data().email === email);

      if (client) {
        setUserRole('client');
        localStorage.setItem('userId', client.id);
        localStorage.setItem('userName', client.data().name || '');
        router.push('/client-dashboard');
        return;
      }

      // مسجل في Firebase لكن مش في artists أو clients
      setUserRole('client');
      localStorage.setItem('userId', uid);
      router.push('/client-dashboard');

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول.');
      }
    }

    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>

      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="bg-red-600 p-2 rounded-xl">
              <Mic2 className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-black">Vox<span className="text-red-600">Dub</span></span>
          </Link>
          <p className="text-gray-500 font-bold mt-3">سجل دخولك للمتابعة</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center py-3 px-4 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-900 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 font-bold text-sm">ليس لديك حساب؟</p>
            <Link href="/register" className="text-red-600 font-black hover:underline mt-1 inline-block">
              انضم إلينا
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 font-bold text-sm hover:text-gray-600 transition">
            ← العودة للواجهة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
