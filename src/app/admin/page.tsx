'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../components/firebase';
import { useAuth } from '../context/AuthContext';
import { Mic2, LogIn, Lock } from 'lucide-react';

const ADMIN_EMAIL = 'admin@voxdub.com';
const ADMIN_PASSWORD = 'admin123';

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { userRole, setUserRole, mounted } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mounted && userRole === 'admin') {
      router.replace('/dashboard');
    }
  }, [mounted, userRole, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== ADMIN_PASSWORD) {
      setError('كلمة المرور غير صحيحة');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    } catch {
      // Firebase Auth account may not exist — proceed with localStorage only
    }

    setUserRole('admin');
    localStorage.setItem('userId', 'admin');
    router.push('/dashboard');
    setLoading(false);
  };

  if (!mounted || userRole === 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4" dir="rtl">
      

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-red-600 p-2 rounded-xl">
              <Mic2 className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-white">Vox<span className="text-red-500">Dub</span></span>
          </div>
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <Lock size={16} />
            <p className="font-black text-sm">دخول المديرة</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-gray-300 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none font-bold text-sm focus:border-yellow-500 transition-colors placeholder-gray-500"
                placeholder="أدخل كلمة المرور"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center py-3 px-4 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
