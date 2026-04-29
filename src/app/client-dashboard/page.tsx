'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, app } from '../components/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic2, LogOut, Plus, Clock, CheckCircle,
  PlayCircle, AlertCircle, FileText, X
} from 'lucide-react';

interface Order {
  id: string;
  selectedPackage: string;
  selectedVoiceActor: string;
  workType: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'review';
  createdAt: any;
}

const packagesDetails = [
  {
    name: 'باقة التعليق الصوتي',
    price: '5000 د.ج',
    desc: 'مثالية للمشاريع البسيطة',
    features: ['تعليق صوتي احترافي', 'جودة تسجيل HD', 'تسليم خلال 3 أيام', 'مراجعة واحدة مجانية']
  },
  {
    name: 'باقة التعليق والتدقيق',
    price: '8000 د.ج',
    desc: 'للمحتوى الاحترافي — الأكثر طلباً',
    features: ['كل مميزات الباقة الأولى', 'تدقيق لغوي للنص', 'تصحيح الأخطاء النحوية', 'تحسين الصياغة']
  },
  {
    name: 'باقة كاملة المحتوى',
    price: '13000 د.ج',
    desc: 'حل شامل ومتكامل',
    features: ['كل مميزات الباقتين السابقتين', 'كتابة النص من الصفر', 'بحث وتطوير المحتوى', 'كتابة إبداعية']
  },
];

export default function ClientDashboard() {
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedVoiceActor, setSelectedVoiceActor] = useState('');
  const [workType, setWorkType] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const workTypes = ['إعلان تجاري', 'وثائقي', 'كتاب صوتي', 'رد آلي (IVR)', 'بودكاست', 'آخر'];

  const statusConfig = {
    pending:     { label: 'في انتظار الموافقة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    accepted:    { label: 'تم القبول',           color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
    in_progress: { label: 'جاري التنفيذ',        color: 'bg-purple-100 text-purple-700', icon: PlayCircle },
    review:      { label: 'بحاجة للمراجعة',     color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    completed:   { label: 'مكتمل',               color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    if (!id || role !== 'client') { router.push('/login'); return; }
    setUserId(id);
    setUserName(name || 'صاحب عمل');

    const fetchData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setOrders(allOrders.filter((o: any) => o.clientId === id));

        const artistsSnapshot = await getDocs(collection(db, 'artists'));
        setArtists(artistsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })).filter(a => a.name));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) { setFormError('يرجى اختيار الباقة'); return; }
    if (!selectedVoiceActor) { setFormError('يرجى اختيار المعلق'); return; }
    if (!workType) { setFormError('يرجى اختيار نوع العمل'); return; }

    setSubmitting(true);
    setFormError('');

    try {
      let fileURL = null;
      if (attachedFile) {
        const storage = getStorage(app);
        const storageRef = ref(storage, `orders/${Date.now()}_${attachedFile.name}`);
        const snapshot = await uploadBytes(storageRef, attachedFile);
        fileURL = await getDownloadURL(snapshot.ref);
      }

      const newOrder = {
        clientId: userId,
        clientName: userName,
        selectedPackage,
        selectedVoiceActor,
        workType,
        description,
        fileAttachmentURL: fileURL,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      setOrders(prev => [...prev, { id: docRef.id, ...newOrder } as any]);

      // إشعار للمديرة
      await addDoc(collection(db, 'notifications'), {
        artistId: 'admin',
        title: '📋 طلب عمل جديد',
        body: `${userName} طلب ${selectedPackage} — المعلق: ${selectedVoiceActor} — ${workType}`,
        type: 'new_order',
        read: false,
        createdAt: serverTimestamp(),
      });

      // إشعار للمعلق المختار
      if (selectedVoiceActor !== 'اختيار الأنسب من طرفكم') {
        try {
          const artistsSnap = await getDocs(
            query(collection(db, 'artists'), where('name', '==', selectedVoiceActor))
          );
          if (!artistsSnap.empty) {
            await addDoc(collection(db, 'notifications'), {
              artistId: artistsSnap.docs[0].id,
              title: '🎯 طلب عمل جديد لصوتك!',
              body: `${userName} طلب ${workType} — الباقة: ${selectedPackage}`,
              type: 'new_order',
              read: false,
              createdAt: serverTimestamp(),
            });
          }
        } catch (_) {}
      }

      setSelectedPackage(''); setSelectedVoiceActor('');
      setWorkType(''); setDescription('');
      setAttachedFile(null); setShowForm(false);
    } catch (err) {
      console.error(err);
      setFormError('حدث خطأ أثناء الإرسال.');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-xl font-black text-red-600 animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  const statusCounts = {
    pending:     orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed:   orders.filter(o => o.status === 'completed').length,
    review:      orders.filter(o => o.status === 'review').length,
  };

  const selectedPkgDetails = packagesDetails.find(p => p.name === selectedPackage);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>

      <header className="bg-gray-900 text-white px-8 py-5 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl"><Mic2 className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-black">Vox<span className="text-red-500">Dub</span></span>
          <span className="text-gray-500 font-bold text-sm mr-2">— لوحة صاحب العمل</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white font-bold text-sm transition">الواجهة الرئيسية</Link>
          <span className="text-gray-400 font-bold text-sm">مرحباً، {userName}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-black text-sm hover:bg-red-700 transition">
            <LogOut size={16} /> خروج
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'في الانتظار',   value: statusCounts.pending,     color: 'bg-yellow-500', icon: Clock },
            { label: 'جاري التنفيذ',  value: statusCounts.in_progress, color: 'bg-purple-500', icon: PlayCircle },
            { label: 'بحاجة مراجعة', value: statusCounts.review,      color: 'bg-orange-500', icon: AlertCircle },
            { label: 'مكتملة',        value: statusCounts.completed,   color: 'bg-green-500',  icon: CheckCircle },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <div className="text-3xl font-black text-gray-900">{stat.value}</div>
              <div className="text-gray-500 font-bold text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">طلباتي</h2>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-black hover:bg-red-700 transition">
            <Plus size={18} /> طلب جديد
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
            <FileText size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-black text-lg">لا توجد طلبات بعد</p>
            <p className="text-gray-300 font-bold text-sm mt-2">اضغط على "طلب جديد" لإرسال أول طلب</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-gray-900">{order.selectedPackage}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${status.color}`}>
                      <StatusIcon size={12} />{status.label}
                    </span>
                  </div>
                  <p className="text-gray-500 font-bold text-sm mb-1">المعلق: <span className="text-gray-700">{order.selectedVoiceActor}</span></p>
                  <p className="text-gray-500 font-bold text-sm mb-1">نوع العمل: <span className="text-gray-700">{order.workType}</span></p>
                  {order.description && <p className="text-gray-400 font-bold text-xs mt-2 line-clamp-2">{order.description}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">طلب جديد</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">اختر الباقة *</label>
                <select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400">
                  <option value="">— اختر الباقة —</option>
                  {packagesDetails.map(pkg => (
                    <option key={pkg.name} value={pkg.name}>{pkg.name} — {pkg.price}</option>
                  ))}
                </select>
                {selectedPkgDetails && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                    <p className="font-black text-red-700 text-sm mb-1">{selectedPkgDetails.name} — {selectedPkgDetails.price}</p>
                    <p className="text-red-500 font-bold text-xs mb-2">{selectedPkgDetails.desc}</p>
                    <ul className="space-y-1">
                      {selectedPkgDetails.features.map((f, i) => (
                        <li key={i} className="text-xs text-red-600 font-bold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">اختر المعلق الصوتي *</label>
                <select value={selectedVoiceActor} onChange={e => setSelectedVoiceActor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400">
                  <option value="">— اختر المعلق —</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name}{a.voiceType ? ` — ${a.voiceType}` : ''}{a.gender ? ` — ${a.gender}` : ''}
                    </option>
                  ))}
                  <option value="اختيار الأنسب من طرفكم">اختيار الأنسب من طرفكم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">نوع العمل *</label>
                <select value={workType} onChange={e => setWorkType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400">
                  <option value="">— اختر نوع العمل —</option>
                  {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">تفاصيل المشروع *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  required rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm resize-none focus:border-red-400"
                  placeholder="اشرح مشروعك بالتفصيل..." />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">ملف مرفق (اختياري)</label>
                <input type="file" onChange={e => setAttachedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 font-bold cursor-pointer" />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center py-3 px-4 rounded-xl">
                  {formError}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-900 disabled:bg-gray-200 transition-all">
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
