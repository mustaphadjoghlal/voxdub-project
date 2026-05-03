'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Admin: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-yellow-600 mb-6 text-center">
          لوحة تحكم المديرة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">إدارة المعلقين</h3>
            <p className="text-gray-600 mb-4">عرض وإدارة جميع المعلقين المسجلين في النظام.</p>
            <a href="/artists" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded inline-block">
              عرض المعلقين
            </a>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">الطلبات</h3>
            <p className="text-gray-600 mb-4">عرض وإدارة جميع طلبات العملاء.</p>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              عرض الطلبات
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Admin;
