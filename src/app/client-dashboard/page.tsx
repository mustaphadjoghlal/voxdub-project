'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, app } from '../components/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic2, LogOut, Plus, Clock, CheckCircle,
  PlayCircle, AlertCircle, FileText, X, Tag,
  Eye, Download, MessageSquare, Send, Bell
} from 'lucide-react';
import ChatBox from '../components/ChatBox';

interface Order {
  id: string;
  selectedPackage: string;
  selectedVoiceActor: string;
  workType: string;
  description: string;
  fileAttachmentURL?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'review';
  createdAt: any;
}

interface Notif {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: any;
}

interface PackageItem {
  id: string; name: string; price: string; desc: string; features: string[]; popular: boolean;
}

export default function ClientDashboard() {
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [chatOrderLabel, setChatOrderLabel] = useState('');

  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedVoiceActor, setSelectedVoiceActor] = useState('');
  const [workType, setWorkType] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');

  const workTypes = ['إعلان تجاري', 'وثائقي', 'كتاب صوتي', 'رد آلي (IVR)', 'بودكاست', 'آخر'];

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
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

    const fetchAll = async () => {
      try {
        // Get client email from Firestore
        let email = '';
        try {
          const clientSnap = await getDoc(doc(db, 'clients', id));
          if (clientSnap.exists()) email = clientSnap.data().email || '';
        } catch {}
        setUserEmail(email);

        // Fetch orders by clientId OR email
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const all = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        setOrders(all.filter(o => o.clientId === id || (email && o.email === email)));

        // Fetch status-change notifications for this client
        if (email) {
          const notifQ = query(
            collection(db, 'notifications'),
            where('clientEmail', '==', email),
            where('type', '==', 'order_status_update')
          );
          const notifSnap = await getDocs(notifQ);
          setNotifications(notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as Notif)));
        }

        const artistsSnap = await getDocs(collection(db, 'artists'));
        setArtists(artistsSnap.docs.map(d => ({ id: d.id, ...d.data() as any })).filter(a => a.name));
        const pkgSnap = await getDocs(collection(db, 'packages'));
        setPackages(pkgSnap.docs.map(d => ({ id: d.id, ...d.data() } as PackageItem)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [mounted, router]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) { setFormError('يرجى اختيار الباقة'); return; }
    if (!selectedVoiceActor) { setFormError('يرجى اختيار المعلق'); return; }
    if (!workType) { setFormError('يرجى اختيار نوع العمل'); return; }
    setSubmitting(true); setFormError(''); setStorageWarning('');

    let fileURL: string | null = null;
    if (attachedFile) {
      try {
        const storage = getStorage(app);
        const storageRef = ref(storage, `orders/${Date.now()}_${attachedFile.name}`);
        const snapshot = await uploadBytes(storageRef, attachedFile);
        fileURL = await getDownloadURL(snapshot.ref);
      } catch (uploadErr) {
        console.warn('Storage upload failed:', uploadErr);
        setStorageWarning('تعذّر رفع الملف، سيتم إرسال الطلب بدونه.');
      }
    }

    try {
      const newOrder = {
        clientId: userId, clientName: userName,
        selectedPackage, selectedVoiceActor, workType, description,
        fileAttachmentURL: fileURL, status: 'pending', createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      setOrders(prev => [...prev, { id: docRef.id, ...newOrder } as any]);
      await addDoc(collection(db, 'notifications'), {
        artistId: 'admin',
        title: '📋 طلب عمل جديد',
        body: `${userName} طلب ${selectedPackage} — المعلق: ${selectedVoiceActor} — ${workType}`,
        type: 'new_order', read: false, createdAt: serverTimestamp(),
      });
      if (selectedVoiceActor !== 'اختيار الأنسب من طرفكم') {
        const artistQ = query(collection(db, 'artists'), where('name', '==', selectedVoiceActor));
        const artistSnap = await getDocs(artistQ).catch(() => null);
        if (artistSnap && !artistSnap.empty) {
          await addDoc(collection(db, 'notifications'), {
            artistId: artistSnap.docs[0].id,
            title: '🎯 طلب عمل جديد لصوتك!',
            body: `${userName} طلب ${workType} — الباقة: ${selectedPackage}`,
            type: 'new_order', read: false, createdAt: serverTimestamp(),
          });
        }
      }
      setSelectedPackage(''); setSelectedVoiceActor('');
      setWorkType(''); setDescription(''); setAttachedFile(null); setShowForm(false);
    } catch (err) {
      console.error(err); setFormError('حدث خطأ أثناء الإرسال.');
    }
    setSubmitting(false);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim() || !selectedOrder) return;
    setSendingFeedback(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        artistId: 'admin',
        title: '💬 ملاحظات من عميل',
        body: `${userName} — طلب "${selectedOrder.selectedPackage}" — المعلق: ${selectedOrder.selectedVoiceActor}\n\nالملاحظات: ${feedbackText}`,
        type: 'client_feedback', orderId: selectedOrder.id,
        clientName: userName, read: false, createdAt: serverTimestamp(),
      });
      setFeedbackSent(true); setFeedbackText('');
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch { alert('حدث خطأ.'); }
    setSendingFeedback(false);
  };

  const handleLogout = async () => { await logout(); router.push('/login'); };

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

  const selectedPkgDetails = packages.find(p => p.name === selectedPackage);

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

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifPanel(v => !v); if (!showNotifPanel && unreadCount > 0) markAllRead(); }}
              className="relative p-2 text-gray-400 hover:text-white transition">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifPanel && (
              <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 text-sm">تحديثات طلباتك</h3>
                  <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 font-bold text-sm">لا توجد تحديثات</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {[...notifications].reverse().map(n => (
                      <div key={n.id} className={`px-5 py-4 ${n.read ? '' : 'bg-red-50'}`}>
                        <p className="font-black text-gray-900 text-sm">{n.title}</p>
                        <p className="text-gray-500 font-bold text-xs mt-1 leading-relaxed">{n.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-black text-sm hover:bg-red-700 transition">
            <LogOut size={16} /> خروج
          </button>
        </div>
      </header>
      {showNotifPanel && <div className="fixed inset-0 z-30" onClick={() => setShowNotifPanel(false)} />}

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
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
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
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setSelectedOrder(order); setFeedbackSent(false); }}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-black text-xs hover:bg-gray-200 transition">
                        <Eye size={14} /> التفاصيل
                      </button>
                      <button
                        onClick={() => { setChatOrderId(order.id); setChatOrderLabel(`${order.selectedPackage} — ${order.selectedVoiceActor}`); }}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-black text-xs hover:bg-red-700 transition">
                        <MessageSquare size={14} /> دردشة
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">تفاصيل الطلب</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="px-8 py-6 space-y-5">
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-gray-900">{selectedOrder.selectedPackage}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                </div>
                <p className="text-gray-500 font-bold text-sm">المعلق: <span className="text-gray-800">{selectedOrder.selectedVoiceActor}</span></p>
                <p className="text-gray-500 font-bold text-sm">نوع العمل: <span className="text-gray-800">{selectedOrder.workType}</span></p>
              </div>
              {selectedOrder.description && (
                <div>
                  <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2"><FileText size={16} className="text-red-600" /> النص / تفاصيل المشروع</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-gray-700 font-bold text-sm leading-relaxed whitespace-pre-wrap">{selectedOrder.description}</p>
                  </div>
                </div>
              )}
              {selectedOrder.fileAttachmentURL && (
                <div>
                  <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2"><Download size={16} className="text-red-600" /> الملف المرفق</h3>
                  <a href={selectedOrder.fileAttachmentURL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 hover:bg-emerald-100 transition">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Download size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-black text-emerald-800 text-sm">تحميل الملف المرفق</p>
                      <p className="text-emerald-600 font-bold text-xs">اضغط للفتح أو التحميل</p>
                    </div>
                  </a>
                </div>
              )}
              <div>
                <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2"><MessageSquare size={16} className="text-red-600" /> إرسال ملاحظات للإدارة</h3>
                <p className="text-gray-400 font-bold text-xs mb-3">ستصل ملاحظاتك للمديرة التي ستتولى إيصالها للمعلق الصوتي</p>
                {feedbackSent ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <p className="text-emerald-700 font-black">✅ تم إرسال ملاحظاتك بنجاح!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={4}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none font-bold text-sm resize-none focus:border-red-400 transition"
                      placeholder="اكتب ملاحظاتك هنا..." />
                    <button onClick={handleSendFeedback} disabled={sendingFeedback || !feedbackText.trim()}
                      className="w-full bg-red-600 text-white py-3 rounded-2xl font-black hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 transition flex items-center justify-center gap-2">
                      <Send size={16} />{sendingFeedback ? 'جاري الإرسال...' : 'إرسال الملاحظات'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
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
                {packages.length === 0 ? (
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-sm bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    <Tag size={16} /> لا توجد باقات متاحة حالياً
                  </div>
                ) : (
                  <>
                    <select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400">
                      <option value="">— اختر الباقة —</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.name}>{pkg.name} — {pkg.price} دج {pkg.popular ? '⭐' : ''}</option>
                      ))}
                    </select>
                    {selectedPkgDetails && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-red-700 text-sm">{selectedPkgDetails.name}</p>
                          <span className="font-black text-red-600 text-sm">{selectedPkgDetails.price} دج</span>
                        </div>
                        {selectedPkgDetails.desc && <p className="text-red-500 font-bold text-xs mb-2">{selectedPkgDetails.desc}</p>}
                        {selectedPkgDetails.features?.length > 0 && (
                          <ul className="space-y-1">
                            {selectedPkgDetails.features.map((f, i) => (
                              <li key={i} className="text-xs text-red-600 font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">اختر المعلق الصوتي *</label>
                <select value={selectedVoiceActor} onChange={e => setSelectedVoiceActor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400">
                  <option value="">— اختر المعلق —</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.name}>{a.name}{a.voiceType ? ` — ${a.voiceType}` : ''}</option>
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
                <label className="block text-sm font-black text-gray-700 mb-2">النص وتفاصيل المشروع *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm resize-none focus:border-red-400"
                  placeholder="اكتب النص المراد تسجيله وأي تفاصيل أخرى..." />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">ملف مرفق (اختياري)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-red-400 transition">
                  <input type="file" id="attachFile" onChange={e => setAttachedFile(e.target.files?.[0] || null)} className="hidden" />
                  <label htmlFor="attachFile" className="cursor-pointer">
                    <FileText size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 font-bold text-sm">{attachedFile ? attachedFile.name : 'اضغط لرفع ملف'}</p>
                  </label>
                </div>
                {storageWarning && <p className="text-orange-500 font-bold text-xs mt-2">⚠️ {storageWarning}</p>}
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center py-3 px-4 rounded-xl">{formError}</div>
              )}
              <button type="submit" disabled={submitting}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-900 disabled:bg-gray-200 transition-all">
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatOrderId && (
        <ChatBox
          orderId={chatOrderId}
          currentUserId={userId}
          currentUserName={userName}
          currentUserRole="client"
          orderLabel={chatOrderLabel}
          onClose={() => setChatOrderId(null)}
        />
      )}
    </div>
  );
}
