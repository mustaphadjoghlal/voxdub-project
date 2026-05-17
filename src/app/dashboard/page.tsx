'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  doc, getDoc, updateDoc, arrayUnion, collection,
  getDocs, deleteDoc, query, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../components/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic2, Upload, LogOut, User, Music, Plus, Eye, Users, FileText,
  Bell, CheckCircle, Check, X, Trash2, Edit3, Save, Star,
  MessageSquare, Mic, Package, Sparkles, Camera, BarChart3, Heart,
  TrendingUp, Building2, UserCheck, Phone, Mail, Briefcase, Tag,
  Send, Download, Settings
} from 'lucide-react';

import AdminSettingsTab from '../components/AdminSettingsTab';
import AdminServicesTab from '../components/AdminServicesTab';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:     { label: 'في الانتظار',     color: 'bg-amber-100 text-amber-700' },
  accepted:    { label: 'تم القبول',        color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'جاري التنفيذ',    color: 'bg-violet-100 text-violet-700' },
  review:      { label: 'بحاجة للمراجعة', color: 'bg-orange-100 text-orange-700' },
  completed:   { label: 'مكتمل',           color: 'bg-emerald-100 text-emerald-700' },
};

const statusOptions = [
  { value: 'pending',     label: 'في الانتظار' },
  { value: 'accepted',    label: 'تم القبول' },
  { value: 'in_progress', label: 'جاري التنفيذ' },
  { value: 'review',      label: 'بحاجة للمراجعة' },
  { value: 'completed',   label: 'مكتمل' },
];

type TabType = 'overview' | 'audio' | 'profile' | 'reviews' | 'notifications' | 'artists' | 'orders' | 'stats' | 'partners' | 'clients' | 'packages' | 'settings' | 'services-mgmt';

const Dashboard = () => {
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [artist, setArtist] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [artistOrders, setArtistOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [promotingClientId, setPromotingClientId] = useState<string | null>(null);

  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerLogo, setNewPartnerLogo] = useState<File | null>(null);
  const [addingPartner, setAddingPartner] = useState(false);
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);

  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgFeature, setNewPkgFeature] = useState('');
  const [newPkgFeatures, setNewPkgFeatures] = useState<string[]>([]);
  const [newPkgPopular, setNewPkgPopular] = useState(false);
  const [addingPackage, setAddingPackage] = useState(false);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [audioSample, setAudioSample] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState('');

  const [editingBio, setEditingBio] = useState(false);
  const [editingTagline, setEditingTagline] = useState(false);
  const [bioValue, setBioValue] = useState('');
  const [taglineValue, setTaglineValue] = useState('');
  const [editingSampleIdx, setEditingSampleIdx] = useState<number | null>(null);
  const [editingSampleName, setEditingSampleName] = useState('');

  // modal تفاصيل الطلب للمعلق
  const [selectedArtistOrder, setSelectedArtistOrder] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (!userId) { router.push('/login'); return; }

    if (role === 'admin') {
      setIsAdmin(true);
      setActiveTab('artists');
      const fetchAll = async () => {
        try {
          const artistsSnap = await getDocs(collection(db, 'artists'));
          setAllArtists(artistsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          const ordersSnap = await getDocs(collection(db, 'orders'));
          setAllOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          const partnersSnap = await getDocs(collection(db, 'partners'));
          setAllPartners(partnersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          const clientsSnap = await getDocs(collection(db, 'clients'));
          setAllClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          const packagesSnap = await getDocs(collection(db, 'packages'));
          setAllPackages(packagesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          const notifsSnap = await getDocs(query(collection(db, 'notifications'), where('artistId', '==', 'admin')));
          const notifs = notifsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          setAdminNotifications(notifs);
          setAdminUnreadCount(notifs.filter((n: any) => !n.read).length);
        } catch (err) { console.error(err); }
        setLoading(false);
      };
      fetchAll();
    } else {
      const fetchArtist = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'artists', userId));
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as any;
            setArtist(data);
            setBioValue(data.bio || '');
            setTaglineValue(data.tagline || '');
            const ordersSnap = await getDocs(collection(db, 'orders'));
            const myOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(o => o.selectedVoiceActor === data.name);
            setArtistOrders(myOrders);
            try {
              const reviewsSnap = await getDocs(query(collection(db, 'reviews'), where('artistId', '==', userId)));
              setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (_) {}
            try {
              const notifsSnap = await getDocs(query(collection(db, 'notifications'), where('artistId', '==', userId)));
              const notifs = notifsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
              setNotifications(notifs);
              setUnreadCount(notifs.filter((n: any) => !n.read).length);
            } catch (_) {}
          }
        } catch (err) { console.error(err); }
        setLoading(false);
      };
      fetchArtist();
    }
  }, [mounted, router]);

  const sendNotification = async ({ artistId, title, body, type }: { artistId: string; title: string; body: string; type: string; }) => {
    try {
      await addDoc(collection(db, 'notifications'), { artistId, title, body, type, read: false, createdAt: serverTimestamp() });
    } catch (err) { console.error(err); }
  };

  // ===== إدارة الباقات =====
  const handleAddFeature = () => {
    if (!newPkgFeature.trim()) return;
    setNewPkgFeatures(prev => [...prev, newPkgFeature.trim()]);
    setNewPkgFeature('');
  };
  const handleRemoveFeature = (idx: number) => setNewPkgFeatures(prev => prev.filter((_, i) => i !== idx));

  const handleAddPackage = async () => {
    if (!newPkgName.trim() || !newPkgPrice.trim()) return;
    setAddingPackage(true);
    try {
      const docRef = await addDoc(collection(db, 'packages'), {
        name: newPkgName.trim(), price: newPkgPrice.trim(), desc: newPkgDesc.trim(),
        features: newPkgFeatures, popular: newPkgPopular, createdAt: serverTimestamp(),
      });
      setAllPackages(prev => [...prev, { id: docRef.id, name: newPkgName.trim(), price: newPkgPrice.trim(), desc: newPkgDesc.trim(), features: newPkgFeatures, popular: newPkgPopular }]);
      setNewPkgName(''); setNewPkgPrice(''); setNewPkgDesc(''); setNewPkgFeatures([]); setNewPkgPopular(false);
    } catch (err) { alert('حدث خطأ.'); }
    setAddingPackage(false);
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm('هل تريد حذف هذه الباقة؟')) return;
    setDeletingPackageId(pkgId);
    try {
      await deleteDoc(doc(db, 'packages', pkgId));
      setAllPackages(prev => prev.filter(p => p.id !== pkgId));
    } catch (err) { alert('حدث خطأ.'); }
    setDeletingPackageId(null);
  };

  const handleSavePackageEdit = async () => {
    if (!editingPackage) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'packages', editingPackage.id), {
        name: editingPackage.name, price: editingPackage.price, desc: editingPackage.desc,
        features: editingPackage.features, popular: editingPackage.popular,
      });
      setAllPackages(prev => prev.map(p => p.id === editingPackage.id ? editingPackage : p));
      setEditingPackage(null);
    } catch (err) { alert('حدث خطأ.'); }
    setSaving(false);
  };

  // ===== إدارة الشركاء =====
  const handlePromoteToPartner = async (client: any) => {
    if (!confirm(`هل تريد ترقية "${client.name}" ليصبح شريكاً؟`)) return;
    setPromotingClientId(client.id);
    try {
      const alreadyPartner = allPartners.some(p => p.name === client.name);
      if (alreadyPartner) { alert('هذا العميل موجود بالفعل في قائمة الشركاء'); setPromotingClientId(null); return; }
      const docRef = await addDoc(collection(db, 'partners'), { name: client.name, logo: client.logo || '', promotedFrom: client.id, createdAt: serverTimestamp() });
      setAllPartners(prev => [...prev, { id: docRef.id, name: client.name, logo: client.logo || '' }]);
      alert(`✅ تمت ترقية ${client.name} إلى شريك بنجاح!`);
    } catch (err) { alert('حدث خطأ.'); }
    setPromotingClientId(null);
  };

  const handleAddPartner = async () => {
    if (!newPartnerName.trim()) return;
    setAddingPartner(true);
    try {
      let logoUrl = '';
      if (newPartnerLogo) {
        const storageRef = ref(storage, `partners/${Date.now()}_${newPartnerLogo.name}`);
        await uploadBytes(storageRef, newPartnerLogo);
        logoUrl = await getDownloadURL(storageRef);
      }
      const docRef = await addDoc(collection(db, 'partners'), { name: newPartnerName.trim(), logo: logoUrl, createdAt: serverTimestamp() });
      setAllPartners(prev => [...prev, { id: docRef.id, name: newPartnerName.trim(), logo: logoUrl }]);
      setNewPartnerName(''); setNewPartnerLogo(null);
    } catch (err) { alert('حدث خطأ.'); }
    setAddingPartner(false);
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('هل تريد حذف هذا الشريك؟')) return;
    setDeletingPartnerId(partnerId);
    try {
      await deleteDoc(doc(db, 'partners', partnerId));
      setAllPartners(prev => prev.filter(p => p.id !== partnerId));
    } catch (err) { alert('حدث خطأ.'); }
    setDeletingPartnerId(null);
  };

  const togglePlay = (url: string, idx: number) => {
    if (playingIdx === idx) { audioRef.current?.pause(); setPlayingIdx(null); }
    else {
      if (audioRef.current) audioRef.current.pause();
      const a = new Audio(url);
      a.play().catch(() => {});
      audioRef.current = a; setPlayingIdx(idx);
      a.onended = () => setPlayingIdx(null);
    }
  };

  const handleDeleteSample = async (idx: number) => {
    if (!artist || !confirm('هل تريد حذف هذه العينة؟')) return;
    const updated = artist.audioSamples.filter((_: any, i: number) => i !== idx);
    try { await updateDoc(doc(db, 'artists', artist.id), { audioSamples: updated }); setArtist({ ...artist, audioSamples: updated }); } catch (_) { alert('حدث خطأ.'); }
  };

  const handleRenameSample = async (idx: number) => {
    if (!artist || !editingSampleName.trim()) return;
    setSaving(true);
    const updated = artist.audioSamples.map((s: any, i: number) => i === idx ? { ...s, name: editingSampleName } : s);
    try { await updateDoc(doc(db, 'artists', artist.id), { audioSamples: updated }); setArtist({ ...artist, audioSamples: updated }); setEditingSampleIdx(null); } catch (_) { alert('حدث خطأ.'); }
    setSaving(false);
  };

  const handleSaveBio = async () => {
    if (!artist) return; setSaving(true);
    try { await updateDoc(doc(db, 'artists', artist.id), { bio: bioValue }); setArtist({ ...artist, bio: bioValue }); setEditingBio(false); } catch (_) { alert('حدث خطأ.'); }
    setSaving(false);
  };

  const handleSaveTagline = async () => {
    if (!artist) return; setSaving(true);
    try { await updateDoc(doc(db, 'artists', artist.id), { tagline: taglineValue }); setArtist({ ...artist, tagline: taglineValue }); setEditingTagline(false); } catch (_) { alert('حدث خطأ.'); }
    setSaving(false);
  };

  const handleProfilePicUpload = async () => {
    if (!profilePic || !artist) return; setUploading(true);
    try {
      const storageRef = ref(storage, `profile_pics/${artist.id}`);
      await uploadBytes(storageRef, profilePic);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'artists', artist.id), { profilePicture: url });
      setArtist({ ...artist, profilePicture: url }); setProfilePicPreview(null); setProfilePic(null);
    } catch (_) { alert('حدث خطأ.'); }
    setUploading(false);
  };

  const handleAudioUpload = async () => {
    if (!audioSample || !sampleName || !artist) return; setUploading(true);
    try {
      const storageRef = ref(storage, `audio_samples/${artist.id}/${Date.now()}_${audioSample.name}`);
      await uploadBytes(storageRef, audioSample);
      const url = await getDownloadURL(storageRef);
      const newSample = { name: sampleName, url, pendingApproval: true };
      await updateDoc(doc(db, 'artists', artist.id), { audioSamples: arrayUnion(newSample) });
      setArtist({ ...artist, audioSamples: [...(artist.audioSamples || []), newSample] });
      await sendNotification({ artistId: 'admin', title: '🎙️ عينة صوتية جديدة بانتظار موافقتك', body: `رفع ${artist.name} عينة جديدة: "${sampleName}"`, type: 'new_sample' });
      setSampleName(''); setAudioSample(null);
    } catch (_) { alert('حدث خطأ.'); }
    setUploading(false);
  };

  const markAllRead = async () => {
    for (const n of notifications.filter((n: any) => !n.read)) { try { await updateDoc(doc(db, 'notifications', n.id), { read: true }); } catch (_) {} }
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))); setUnreadCount(0);
  };

  const markAdminAllRead = async () => {
    for (const n of adminNotifications.filter((n: any) => !n.read)) { try { await updateDoc(doc(db, 'notifications', n.id), { read: true }); } catch (_) {} }
    setAdminNotifications(prev => prev.map(n => ({ ...n, read: true }))); setAdminUnreadCount(0);
  };

  const handleApproveSample = async (artistId: string, idx: number) => {
    const target = allArtists.find(a => a.id === artistId);
    if (!target) return;
    const sample = target.audioSamples[idx];
    const updated = target.audioSamples.map((s: any, i: number) => i === idx ? { ...s, pendingApproval: false } : s);
    try {
      await updateDoc(doc(db, 'artists', artistId), { audioSamples: updated });
      setAllArtists(prev => prev.map(a => a.id === artistId ? { ...a, audioSamples: updated } : a));
      await sendNotification({ artistId, title: '✅ تمت الموافقة على عينتك الصوتية', body: `تمت الموافقة على عينة "${sample?.name}" وأصبحت ظاهرة للعملاء`, type: 'sample_approved' });
    } catch (err) { console.error(err); }
  };

  const handleRejectSample = async (artistId: string, idx: number) => {
    const target = allArtists.find(a => a.id === artistId);
    if (!target) return;
    const sample = target.audioSamples[idx];
    const updated = target.audioSamples.filter((_: any, i: number) => i !== idx);
    try {
      await updateDoc(doc(db, 'artists', artistId), { audioSamples: updated });
      setAllArtists(prev => prev.map(a => a.id === artistId ? { ...a, audioSamples: updated } : a));
      await sendNotification({ artistId, title: '❌ تم رفض عينتك الصوتية', body: `للأسف تم رفض عينة "${sample?.name}" — يمكنك رفع عينة أخرى`, type: 'sample_rejected' });
    } catch (err) { console.error(err); }
  };

  const handleDeleteArtist = async (artistId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    setDeletingId(artistId);
    try { await deleteDoc(doc(db, 'artists', artistId)); setAllArtists(prev => prev.filter(a => a.id !== artistId)); } catch (_) { alert('حدث خطأ.'); }
    setDeletingId(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      const order = allOrders.find(o => o.id === orderId);
      if (order) {
        await addDoc(collection(db, 'notifications'), {
          artistId: `client_${order.email || order.clientName || ''}`,
          clientEmail: order.email || '',
          title: '📦 تحديث حالة طلبك',
          body: `تم تحديث حالة طلب "${order.selectedPackage}" إلى "${statusConfig[newStatus]?.label || newStatus}"`,
          type: 'order_status_update',
          orderId,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse"><Mic2 className="text-white w-8 h-8" /></div>
          <p className="text-white font-black text-lg animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ADMIN VIEW
  // =====================================================
  if (isAdmin) {
    const artistsWithPending = allArtists.filter(a => a.audioSamples?.some((s: any) => s.pendingApproval));
    const completedOrders = allOrders.filter(o => o.status === 'completed');
    const statusStats = statusOptions.map(s => ({
      ...s, count: allOrders.filter(o => o.status === s.value).length,
      bgBar: s.value === 'pending' ? 'bg-amber-400' : s.value === 'accepted' ? 'bg-blue-400' : s.value === 'in_progress' ? 'bg-violet-400' : s.value === 'review' ? 'bg-orange-400' : 'bg-emerald-400',
    }));
    const maxOrders = Math.max(...statusStats.map(s => s.count), 1);
    const artistOrderCounts = allArtists.map(a => ({ name: a.name, count: allOrders.filter(o => o.selectedVoiceActor === a.name).length, pic: a.profilePicture })).sort((a, b) => b.count - a.count);
    const maxArtistOrders = Math.max(...artistOrderCounts.map(a => a.count), 1);
    const workTypeCounts: Record<string, number> = {};
    allOrders.forEach(o => { if (o.workType) workTypeCounts[o.workType] = (workTypeCounts[o.workType] || 0) + 1; });
    const workTypeStats = Object.entries(workTypeCounts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
    const maxWorkType = Math.max(...workTypeStats.map(w => w.count), 1);
    const packageCounts: Record<string, number> = {};
    allOrders.forEach(o => { if (o.selectedPackage) packageCounts[o.selectedPackage] = (packageCounts[o.selectedPackage] || 0) + 1; });
    const packageStats = Object.entries(packageCounts).map(([pkg, count]) => ({ pkg, count })).sort((a, b) => b.count - a.count);

    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>

        <header className="bg-gray-900 text-white px-8 py-5 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl"><Mic2 className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-black">Vox<span className="text-red-500">Dub</span> <span className="text-gray-400 font-bold text-sm">— لوحة المديرة</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('notifications')} className="relative w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
              <Bell size={18} className="text-gray-300" />
              {adminUnreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs font-black flex items-center justify-center">{adminUnreadCount}</span>}
            </button>
            <Link href="/" className="text-gray-400 hover:text-white font-bold text-sm transition">الواجهة الرئيسية</Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-black text-sm hover:bg-red-700 transition"><LogOut size={16} /> خروج</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'إجمالي المعلقين', value: allArtists.length, color: 'bg-blue-500', icon: Users },
              { label: 'العملاء المسجلون', value: allClients.length, color: 'bg-indigo-500', icon: User },
              { label: 'إجمالي الطلبات', value: allOrders.length, color: 'bg-violet-500', icon: FileText },
              { label: 'طلبات مكتملة', value: completedOrders.length, color: 'bg-emerald-500', icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><stat.icon size={20} className="text-white" /></div>
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                <div className="text-gray-500 font-bold text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            {[
              { key: 'artists',       label: 'المعلقون',   icon: Users },
              { key: 'clients',       label: 'العملاء',    icon: User },
              { key: 'orders',        label: 'الطلبات',    icon: FileText },
              { key: 'stats',         label: 'الإحصائيات', icon: BarChart3 },
              { key: 'packages',      label: 'الباقات',    icon: Tag },
              { key: 'partners',      label: 'الشركاء',    icon: Building2 },
              { key: 'services-mgmt', label: 'الخدمات',    icon: Mic2 },
                { key: 'settings',      label: 'الإعدادات',  icon: Settings },
                { key: 'notifications', label: 'الإشعارات',  icon: Bell },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <tab.icon size={16} />{tab.label}
                {tab.key === 'artists' && artistsWithPending.length > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{artistsWithPending.length}</span>}
                {tab.key === 'notifications' && adminUnreadCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{adminUnreadCount}</span>}
              </button>
            ))}
          </div>

          {/* ===== تبويب المعلقين ===== */}
          {activeTab === 'artists' && (
            <div className="space-y-6">
              {artistsWithPending.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                  <div className="px-8 py-5 border-b border-amber-100 bg-amber-50">
                    <h2 className="text-lg font-black text-amber-800">🎙️ عينات بانتظار الموافقة ({artistsWithPending.length})</h2>
                  </div>
                  {artistsWithPending.map(a => (
                    <div key={a.id} className="px-8 py-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400">{a.name?.[0]}</div>
                        <div><p className="font-black text-gray-900">{a.name}</p><p className="text-sm text-gray-500 font-bold">{a.voiceType} | {a.gender}</p></div>
                      </div>
                      {a.audioSamples?.map((s: any, idx: number) => s.pendingApproval && (
                        <div key={idx} className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-4 mb-2 mr-14">
                          <div className="flex-1"><p className="font-black text-gray-800 text-sm mb-2">{s.name}</p><audio src={s.url} controls className="w-full h-8" /></div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleApproveSample(a.id, idx)} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-2 rounded-full font-black text-xs hover:bg-emerald-700 transition"><Check size={12} /> موافقة</button>
                            <button onClick={() => handleRejectSample(a.id, idx)} className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-2 rounded-full font-black text-xs hover:bg-red-200 transition"><X size={12} /> رفض</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-black text-gray-900">المعلقون ({allArtists.length})</h2>
                  <Link href="/register" className="bg-red-600 text-white px-5 py-2 rounded-full font-black text-sm hover:bg-red-700 transition flex items-center gap-2"><Plus size={16} /> إضافة</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {allArtists.map(a => {
                    const approved = a.audioSamples?.filter((s: any) => !s.pendingApproval) || [];
                    const pending = a.audioSamples?.filter((s: any) => s.pendingApproval) || [];
                    return (
                      <div key={a.id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {a.profilePicture ? <img src={a.profilePicture} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-black">{a.name?.[0]}</div>}
                          </div>
                          <div><p className="font-black text-gray-900">{a.name}</p><p className="text-sm text-gray-500 font-bold">{a.voiceType} | {a.gender}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${approved.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{approved.length} معتمدة</span>
                          {pending.length > 0 && <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700">{pending.length} انتظار</span>}
                          <Link href={`/artists/${a.id}`} className="text-gray-500 hover:text-red-600 transition"><Eye size={16} /></Link>
                          <button onClick={() => handleDeleteArtist(a.id, a.name)} disabled={deletingId === a.id} className="text-red-400 hover:text-red-600 transition disabled:text-gray-300"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== تبويب العملاء ===== */}
          {activeTab === 'clients' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-gray-900">العملاء المسجلون</h2>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full">{allClients.length} عميل</span>
                </div>
              </div>
              {allClients.length === 0 ? (
                <div className="p-16 text-center"><User size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-black text-lg">لا يوجد عملاء بعد</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {allClients.map(client => {
                    const isPartner = allPartners.some(p => p.name === client.name);
                    const clientOrders = allOrders.filter(o => o.clientName === client.name);
                    return (
                      <div key={client.id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg flex-shrink-0">{client.name?.[0] || 'ع'}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-gray-900">{client.name}</p>
                              {isPartner && <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-0.5 rounded-full">شريك ✓</span>}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              {client.email && <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Mail size={11} /> {client.email}</span>}
                              {client.company && <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Briefcase size={11} /> {client.company}</span>}
                              {client.phone && <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Phone size={11} /> {client.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{clientOrders.length} طلب</span>
                          {!isPartner ? (
                            <button onClick={() => handlePromoteToPartner(client)} disabled={promotingClientId === client.id}
                              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-black text-xs hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition">
                              <UserCheck size={14} />{promotingClientId === client.id ? 'جاري...' : 'ترقية إلى شريك'}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600 font-black text-xs"><Building2 size={14} /> شريك معتمد</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== تبويب الطلبات ===== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* ملاحظات العملاء الواردة */}
              {(() => {
                const feedbacks = adminNotifications.filter(n => n.type === 'client_feedback');
                if (feedbacks.length === 0) return null;
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
                    <div className="px-8 py-5 border-b border-orange-100 bg-orange-50">
                      <h2 className="text-lg font-black text-orange-800">💬 ملاحظات العملاء ({feedbacks.length})</h2>
                      <p className="text-orange-600 font-bold text-xs mt-1">راجع الملاحظات وأرسلها للمعلق المعني</p>
                    </div>
                    <div className="divide-y divide-orange-50">
                      {feedbacks.map((n: any) => {
                        const artistName = n.voiceActor;
                        const targetArtist = allArtists.find(a => a.name === artistName);
                        return (
                          <div key={n.id} className={`px-8 py-5 ${!n.read ? 'bg-orange-50/50' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-black text-gray-900 text-sm mb-1">{n.clientName} ← {n.voiceActor}</p>
                                <p className="text-gray-600 font-bold text-sm leading-relaxed bg-gray-50 p-3 rounded-xl mt-2 whitespace-pre-wrap">{n.body?.split('الملاحظات: ')[1] || n.body}</p>
                              </div>
                              {targetArtist && (
                                <button
                                  onClick={async () => {
                                    const msg = n.body?.split('الملاحظات: ')[1] || n.body;
                                    await addDoc(collection(db, 'notifications'), {
                                      artistId: targetArtist.id,
                                      title: '📝 ملاحظات على طلبك',
                                      body: `من العميل ${n.clientName}: ${msg}`,
                                      type: 'order_feedback',
                                      read: false,
                                      createdAt: serverTimestamp(),
                                    });
                                    alert(`✅ تم إرسال الملاحظات لـ ${artistName}`);
                                  }}
                                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full font-black text-xs hover:bg-blue-700 transition flex-shrink-0">
                                  <Send size={12} /> إرسال للمعلق
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* قائمة الطلبات */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {allOrders.length === 0 ? (
                  <div className="p-16 text-center"><FileText size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-black">لا توجد طلبات</p></div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {allOrders.map(order => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <div key={order.id} className="px-8 py-6 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-black text-gray-900">{order.selectedPackage}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-black ${status.color}`}>{status.label}</span>
                              </div>
                              <p className="text-gray-500 font-bold text-sm">العميل: <span className="text-gray-700">{order.clientName || '—'}</span></p>
                              <p className="text-gray-500 font-bold text-sm">المعلق: <span className="text-gray-700">{order.selectedVoiceActor}</span></p>
                              <p className="text-gray-500 font-bold text-sm">نوع العمل: <span className="text-gray-700">{order.workType}</span></p>
                            </div>
                            <select value={order.status || 'pending'} onChange={e => handleStatusChange(order.id, e.target.value)}
                              className="bg-white border border-gray-200 rounded-xl py-2 px-3 text-gray-700 font-bold text-sm outline-none focus:border-red-400 flex-shrink-0">
                              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          {/* النص الكامل */}
                          {order.description && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                              <p className="text-xs font-black text-blue-700 mb-1">📄 النص / تفاصيل المشروع:</p>
                              <p className="text-gray-700 font-bold text-sm leading-relaxed whitespace-pre-wrap">{order.description}</p>
                            </div>
                          )}
                          {/* الملف المرفق */}
                          {order.fileAttachmentURL && (
                            <a href={order.fileAttachmentURL} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black text-xs hover:bg-emerald-100 transition">
                              <Download size={14} /> تحميل الملف المرفق
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== تبويب الإحصائيات ===== */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2">
                  <BarChart3 size={20} className="text-violet-600" />
                  <h2 className="text-lg font-black text-gray-900">توزيع حالات الطلبات</h2>
                  <span className="text-gray-400 font-bold text-sm mr-auto">{allOrders.length} طلب إجمالي</span>
                </div>
                <div className="p-8">
                  {allOrders.length === 0 ? <p className="text-gray-400 font-bold text-center py-8">لا توجد طلبات بعد</p> : (
                    <>
                      <div className="space-y-4 mb-8">
                        {statusStats.map(s => (
                          <div key={s.value}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${statusConfig[s.value]?.color}`}>{s.label}</span>
                              <span className="font-black text-gray-900 text-sm">{s.count} طلب</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${s.bgBar}`} style={{ width: `${(s.count / maxOrders) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-8 flex-wrap">
                        <div className="relative w-36 h-36">
                          <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                            {(() => { const colors = ['#f59e0b','#3b82f6','#8b5cf6','#f97316','#10b981']; let offset = 0; return statusStats.map((s, i) => { const pct = allOrders.length ? (s.count / allOrders.length) * 100 : 0; const el = <circle key={s.value} cx="18" cy="18" r="15.9" fill="none" stroke={colors[i]} strokeWidth="3.5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} />; offset += pct; return el; }); })()}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-gray-900">{allOrders.length}</span><span className="text-xs text-gray-400 font-bold">طلب</span></div>
                        </div>
                        <div className="space-y-2">
                          {statusStats.filter(s => s.count > 0).map((s, i) => { const colors = ['bg-amber-400','bg-blue-400','bg-violet-400','bg-orange-400','bg-emerald-400']; return (<div key={s.value} className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colors[i]}`} /><span className="text-xs font-bold text-gray-600">{s.label}</span><span className="text-xs font-black text-gray-900 mr-2">{s.count}</span></div>); })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2"><TrendingUp size={20} className="text-red-600" /><h2 className="text-lg font-black text-gray-900">المعلقون الأكثر طلباً</h2></div>
                <div className="p-8">
                  {artistOrderCounts.filter(a => a.count > 0).length === 0 ? <p className="text-gray-400 font-bold text-center py-8">لا توجد طلبات بعد</p> : (
                    <div className="space-y-4">
                      {artistOrderCounts.slice(0, 5).map((a, i) => (
                        <div key={a.name} className="flex items-center gap-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">{a.pic ? <img src={a.pic} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-gray-400 text-sm">{a.name?.[0]}</div>}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1"><span className="font-black text-gray-900 text-sm">{a.name}</span><span className="font-black text-gray-500 text-xs">{a.count} طلب</span></div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${(a.count / maxArtistOrders) * 100}%` }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><FileText size={18} className="text-blue-600" /><h2 className="font-black text-gray-900">أنواع الأعمال</h2></div>
                  <div className="p-6">{workTypeStats.length === 0 ? <p className="text-gray-400 font-bold text-center py-6">لا توجد بيانات</p> : (<div className="space-y-3">{workTypeStats.map(w => (<div key={w.type}><div className="flex justify-between mb-1"><span className="text-sm font-bold text-gray-700">{w.type}</span><span className="text-sm font-black text-gray-900">{w.count}</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(w.count / maxWorkType) * 100}%` }} /></div></div>))}</div>)}</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><Package size={18} className="text-emerald-600" /><h2 className="font-black text-gray-900">الباقات الأكثر طلباً</h2></div>
                  <div className="p-6">{packageStats.length === 0 ? <p className="text-gray-400 font-bold text-center py-6">لا توجد بيانات</p> : (<div className="space-y-4">{packageStats.map((p, i) => { const colors = ['bg-emerald-500','bg-blue-500','bg-violet-500']; const pct = allOrders.length ? Math.round((p.count / allOrders.length) * 100) : 0; return (<div key={p.pkg} className="flex items-start gap-3"><div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${colors[i] || 'bg-gray-400'}`} /><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-700">{p.pkg}</span><span className="text-xs font-black text-gray-900">{pct}%</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${colors[i] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} /></div><p className="text-xs text-gray-400 font-bold mt-0.5">{p.count} طلب</p></div></div>); })}</div>)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ===== تبويب الباقات ===== */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2"><Plus size={20} className="text-red-600" /><h2 className="text-lg font-black text-gray-900">إضافة باقة جديدة</h2></div>
                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">اسم الباقة *</label>
                      <input type="text" value={newPkgName} onChange={e => setNewPkgName(e.target.value)} placeholder="مثال: باقة التعليق الصوتي" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">السعر *</label>
                      <input type="text" value={newPkgPrice} onChange={e => setNewPkgPrice(e.target.value)} placeholder="مثال: 15,000" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">الوصف</label>
                    <input type="text" value={newPkgDesc} onChange={e => setNewPkgDesc(e.target.value)} placeholder="وصف مختصر للباقة" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">المميزات</label>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newPkgFeature} onChange={e => setNewPkgFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddFeature()} placeholder="اكتب ميزة واضغط إضافة أو Enter" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
                      <button onClick={handleAddFeature} className="bg-gray-900 text-white px-4 py-3 rounded-xl font-black text-sm hover:bg-red-600 transition flex items-center gap-1"><Plus size={16} /> إضافة</button>
                    </div>
                    {newPkgFeatures.length > 0 && (
                      <div className="space-y-2">
                        {newPkgFeatures.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                            <Check size={14} className="text-emerald-600 flex-shrink-0" />
                            <span className="flex-1 text-sm font-bold text-gray-700">{f}</span>
                            <button onClick={() => handleRemoveFeature(i)} className="text-red-400 hover:text-red-600 transition"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setNewPkgPopular(!newPkgPopular)} className={`w-12 h-6 rounded-full transition-all ${newPkgPopular ? 'bg-red-600' : 'bg-gray-200'} relative`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${newPkgPopular ? 'left-7' : 'left-1'}`} />
                    </button>
                    <span className="font-black text-gray-700 text-sm">الباقة الأكثر طلباً (تظهر مميزة)</span>
                  </div>
                  <button onClick={handleAddPackage} disabled={addingPackage || !newPkgName.trim() || !newPkgPrice.trim()}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-black hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 transition flex items-center justify-center gap-2">
                    <Plus size={18} />{addingPackage ? 'جاري الإضافة...' : 'إضافة الباقة'}
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2"><Tag size={20} className="text-blue-600" /><h2 className="text-lg font-black text-gray-900">الباقات الحالية ({allPackages.length})</h2></div>
                {allPackages.length === 0 ? (
                  <div className="p-16 text-center"><Tag size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-black text-lg">لا توجد باقات بعد</p></div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {allPackages.map(pkg => (
                      <div key={pkg.id} className="px-8 py-6">
                        {editingPackage?.id === pkg.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input value={editingPackage.name} onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400" placeholder="اسم الباقة" />
                              <input value={editingPackage.price} onChange={e => setEditingPackage({ ...editingPackage, price: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400" placeholder="السعر" />
                            </div>
                            <input value={editingPackage.desc} onChange={e => setEditingPackage({ ...editingPackage, desc: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400" placeholder="الوصف" />
                            <div className="space-y-2">
                              {editingPackage.features?.map((f: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input value={f} onChange={e => { const updated = [...editingPackage.features]; updated[i] = e.target.value; setEditingPackage({ ...editingPackage, features: updated }); }} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none font-bold text-sm focus:border-red-400" />
                                  <button onClick={() => setEditingPackage({ ...editingPackage, features: editingPackage.features.filter((_: any, fi: number) => fi !== i) })} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                </div>
                              ))}
                              <button onClick={() => setEditingPackage({ ...editingPackage, features: [...(editingPackage.features || []), ''] })} className="text-gray-500 font-bold text-xs flex items-center gap-1 hover:text-red-600 transition"><Plus size={12} /> إضافة ميزة</button>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => setEditingPackage({ ...editingPackage, popular: !editingPackage.popular })} className={`w-10 h-5 rounded-full transition-all ${editingPackage.popular ? 'bg-red-600' : 'bg-gray-200'} relative`}>
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editingPackage.popular ? 'left-5' : 'left-0.5'}`} />
                              </button>
                              <span className="text-sm font-bold text-gray-600">الأكثر طلباً</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleSavePackageEdit} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-black text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-1"><Save size={14} /> حفظ</button>
                              <button onClick={() => setEditingPackage(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-black text-sm hover:bg-gray-200 transition">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-black text-gray-900">{pkg.name}</h3>
                                {pkg.popular && <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">⭐ الأكثر طلباً</span>}
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-0.5 rounded-full">{pkg.price} دج</span>
                              </div>
                              {pkg.desc && <p className="text-gray-400 font-bold text-sm mb-2">{pkg.desc}</p>}
                              {pkg.features?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {pkg.features.map((f: string, i: number) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Check size={10} className="text-emerald-600" />{f}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => setEditingPackage({ ...pkg })} className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition"><Edit3 size={14} className="text-blue-600" /></button>
                              <button onClick={() => handleDeletePackage(pkg.id)} disabled={deletingPackageId === pkg.id} className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition disabled:opacity-50"><Trash2 size={14} className="text-red-600" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== تبويب الشركاء ===== */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2"><Plus size={20} className="text-red-600" /><h2 className="text-lg font-black text-gray-900">إضافة شريك جديد</h2></div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-black text-gray-700 mb-2">اسم الشركة *</label>
                      <input type="text" value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} placeholder="مثال: شركة الجزائر للإنتاج" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-black text-gray-700 mb-2">الشعار (اختياري)</label>
                      <div className="flex items-center gap-3">
                        {newPartnerLogo && <img src={URL.createObjectURL(newPartnerLogo)} alt="preview" className="w-12 h-12 rounded-xl object-contain border border-gray-200 flex-shrink-0" />}
                        <label className="flex-1 cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 hover:border-red-400 transition text-gray-500 font-bold text-sm">
                          <Upload size={16} />{newPartnerLogo ? newPartnerLogo.name : 'اختر صورة'}
                          <input type="file" accept="image/*" className="hidden" onChange={e => setNewPartnerLogo(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>
                    <button onClick={handleAddPartner} disabled={addingPartner || !newPartnerName.trim()} className="w-full bg-red-600 text-white py-3 rounded-xl font-black hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 transition flex items-center justify-center gap-2">
                      <Plus size={18} />{addingPartner ? 'جاري الإضافة...' : 'إضافة شريك'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2"><Building2 size={20} className="text-blue-600" /><h2 className="text-lg font-black text-gray-900">الشركاء الحاليون ({allPartners.length})</h2></div>
                {allPartners.length === 0 ? (
                  <div className="p-16 text-center"><Building2 size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-black text-lg">لا يوجد شركاء بعد</p></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8">
                    {allPartners.map(partner => (
                      <div key={partner.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center gap-3 relative group hover:border-red-100 hover:shadow-md transition">
                        <button onClick={() => handleDeletePartner(partner.id)} disabled={deletingPartnerId === partner.id} className="absolute top-2 left-2 w-7 h-7 bg-red-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 hover:text-white text-red-500"><Trash2 size={13} /></button>
                        {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-16 h-16 object-contain rounded-xl" /> : <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center"><Building2 size={28} className="text-red-300" /></div>}
                        <p className="font-black text-gray-800 text-sm text-center">{partner.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== تبويب الخدمات ===== */}
            {activeTab === 'services-mgmt' && (
              <div className="space-y-6">
                <AdminServicesTab />
              </div>
            )}

            {/* ===== تبويب الإعدادات ===== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <AdminSettingsTab />
              </div>
            )}

          {/* ===== تبويب الإشعارات ===== */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3"><h2 className="text-lg font-black text-gray-900">الإشعارات</h2>{adminUnreadCount > 0 && <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{adminUnreadCount} جديد</span>}</div>
                {adminUnreadCount > 0 && <button onClick={markAdminAllRead} className="text-gray-400 hover:text-gray-700 font-bold text-xs transition flex items-center gap-1"><Check size={12} /> تحديد الكل كمقروء</button>}
              </div>
              {adminNotifications.length === 0 ? (
                <div className="p-16 text-center"><Bell size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-black">لا توجد إشعارات</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {adminNotifications.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map((n: any) => (
                    <div key={n.id} className={`px-8 py-5 flex items-start gap-4 ${!n.read ? 'bg-red-50' : 'hover:bg-gray-50'} transition`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'new_order' ? 'bg-blue-100' : n.type === 'new_sample' ? 'bg-amber-100' : n.type === 'client_feedback' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        {n.type === 'new_order' ? <Package size={18} className="text-blue-600" /> : n.type === 'new_sample' ? <Mic size={18} className="text-amber-600" /> : n.type === 'client_feedback' ? <MessageSquare size={18} className="text-orange-600" /> : <Bell size={18} className="text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                        {n.body && <p className="text-gray-400 font-bold text-xs mt-0.5">{n.body}</p>}
                        {n.createdAt && <p className="text-gray-300 text-xs font-bold mt-1">{new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleDateString('ar-DZ')}</p>}
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  // =====================================================
  // ARTIST DASHBOARD
  // =====================================================
  const approvedSamples = artist?.audioSamples?.filter((s: any) => !s.pendingApproval) || [];
  const pendingSamples = artist?.audioSamples?.filter((s: any) => s.pendingApproval) || [];

  const tabs = [
    { key: 'overview',      label: 'نظرة عامة',  icon: BarChart3 },
    { key: 'audio',         label: 'العينات',     icon: Music,   badge: pendingSamples.length },
    { key: 'profile',       label: 'الملف',       icon: User },
    { key: 'reviews',       label: 'التقييمات',   icon: Star,    badge: reviews.length },
    { key: 'notifications', label: 'الإشعارات',   icon: Bell,    badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        * { font-family: 'Cairo', sans-serif; }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
        .red-glow { box-shadow: 0 0 40px rgba(220,38,38,0.2); }
      `}</style>

      <header className="sticky top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl" style={{boxShadow:'0 0 20px rgba(220,38,38,0.4)'}}><Mic2 className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-black text-white">Vox<span className="text-red-500">Dub</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('notifications')} className="relative w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition">
            <Bell size={18} className="text-gray-300" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs font-black flex items-center justify-center">{unreadCount}</span>}
          </button>
          <Link href="/" className="text-gray-400 hover:text-white font-bold text-sm transition hidden md:block">الرئيسية</Link>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-full font-black text-sm hover:bg-red-600 hover:text-white transition border border-red-600/30"><LogOut size={14} /> خروج</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="glass rounded-3xl p-6 mb-6 red-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-800 border-2 border-red-600/40">
                {artist?.profilePicture ? <img src={artist.profilePicture} alt={artist.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-500">{artist?.name?.[0]}</div>}
              </div>
              <button onClick={() => setActiveTab('profile')} className="absolute -bottom-2 -left-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg"><Camera size={14} className="text-white" /></button>
            </div>
            <div className="flex-1 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{artist?.name}</h1>
                <span className="bg-red-600/20 text-red-400 text-xs font-black px-2 py-0.5 rounded-full border border-red-600/30">معلق</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                {editingTagline ? (
                  <div className="flex items-center gap-2 w-full max-w-sm">
                    <input value={taglineValue} onChange={e => setTaglineValue(e.target.value)} className="flex-1 bg-white/10 text-white text-sm font-bold rounded-lg px-3 py-1.5 outline-none border border-white/20 focus:border-red-500" placeholder="جملة تعبر عنك..." />
                    <button onClick={handleSaveTagline} disabled={saving} className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition"><Save size={12} className="text-white" /></button>
                    <button onClick={() => setEditingTagline(false)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition"><X size={12} className="text-white" /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-red-400 font-bold text-sm italic">{artist?.tagline ? `"${artist.tagline}"` : 'أضف جملة تعبر عنك...'}</p>
                    <button onClick={() => setEditingTagline(true)} className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center hover:bg-white/20 transition"><Edit3 size={11} className="text-gray-400" /></button>
                  </>
                )}
              </div>
              <p className="text-gray-400 font-bold text-sm mb-4">{artist?.voiceType} · {artist?.gender}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {[{ label: 'عينة معتمدة', value: approvedSamples.length }, { label: 'طلب', value: artistOrders.length }, { label: 'تقييم', value: avgRating || '—' }].map((stat, i) => (
                  <div key={i} className="glass rounded-xl px-3 py-2 text-center"><p className="text-white font-black text-lg">{stat.value}</p><p className="text-gray-400 text-xs font-bold">{stat.label}</p></div>
                ))}
                {pendingSamples.length > 0 && (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-amber-400 font-black text-lg">{pendingSamples.length}</p><p className="text-amber-400/70 text-xs font-bold">انتظار موافقة</p></div>
                )}
              </div>
            </div>
            <Link href={`/artists/${artist?.id}`} className="flex items-center gap-2 glass text-gray-300 px-4 py-2 rounded-full font-black text-sm hover:bg-white/10 transition flex-shrink-0"><Eye size={14} /> عرض ملفي</Link>
          </div>
        </div>

        <div className="flex gap-1 mb-6 glass rounded-2xl p-1.5 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all relative ${activeTab === tab.key ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon size={15} />
              <span className="hidden sm:block">{tab.label}</span>
              {tab.badge && tab.badge > 0 ? <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-xs font-black flex items-center justify-center ${activeTab === tab.key ? 'bg-white text-red-600' : 'bg-red-600'}`}>{tab.badge}</span> : null}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2"><Package size={18} className="text-red-400" /><h2 className="text-white font-black">الطلبات الواردة</h2><span className="bg-red-600/20 text-red-400 text-xs font-black px-2 py-0.5 rounded-full mr-auto">{artistOrders.length}</span></div>
              {artistOrders.length === 0 ? (<div className="px-6 py-12 text-center"><Package size={40} className="text-gray-700 mx-auto mb-3" /><p className="text-gray-500 font-bold">لا توجد طلبات حتى الآن</p></div>) : (
                <div className="divide-y divide-white/5">
                  {artistOrders.slice(0, 6).map((order: any) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition cursor-pointer" onClick={() => setSelectedArtistOrder(order)}>
                        <div>
                          <p className="text-white font-black text-sm">{order.selectedPackage}</p>
                          <p className="text-gray-400 font-bold text-xs mt-0.5">{order.clientName} · {order.workType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${status.color}`}>{status.label}</span>
                          <Eye size={14} className="text-gray-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2"><Star size={18} className="text-amber-400" /><h2 className="text-white font-black">آخر التقييمات</h2>{avgRating && <div className="flex items-center gap-1 mr-auto"><span className="text-amber-400 font-black">{avgRating}</span><Star size={14} className="fill-amber-400 text-amber-400" /></div>}</div>
              {reviews.length === 0 ? (<div className="px-6 py-12 text-center"><Heart size={40} className="text-gray-700 mx-auto mb-3" /><p className="text-gray-500 font-bold">لا توجد تقييمات بعد</p></div>) : (
                <div className="divide-y divide-white/5">
                  {reviews.slice(0, 3).map((r: any) => (<div key={r.id} className="px-6 py-4"><div className="flex items-center justify-between mb-1"><p className="text-white font-black text-sm">{r.clientName || 'عميل'}</p><div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />)}</div></div>{r.comment && <p className="text-gray-400 font-bold text-xs">{r.comment}</p>}</div>))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center"><Plus size={16} className="text-red-400" /></div><h2 className="text-white font-black">رفع عينة جديدة</h2></div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-4"><p className="text-amber-400 font-bold text-xs">⏳ ستظهر للعملاء بعد موافقة الإدارة</p></div>
              <div className="space-y-3">
                <input type="text" value={sampleName} onChange={e => setSampleName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition placeholder:text-gray-500" placeholder="اسم العينة (مثال: إعلان تجاري)" />
                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-red-500/50 transition">
                  <input type="file" accept="audio/*" id="audioFile" onChange={e => setAudioSample(e.target.files?.[0] || null)} className="hidden" />
                  <label htmlFor="audioFile" className="cursor-pointer"><Mic size={24} className="text-gray-500 mx-auto mb-2" /><p className="text-gray-400 font-bold text-sm">{audioSample ? audioSample.name : 'اضغط لاختيار ملف صوتي'}</p></label>
                </div>
                <button onClick={handleAudioUpload} disabled={uploading || !audioSample || !sampleName} className="w-full bg-red-600 text-white py-3 rounded-xl font-black hover:bg-red-700 disabled:bg-white/5 disabled:text-gray-500 transition flex items-center justify-center gap-2"><Upload size={16} />{uploading ? 'جاري الرفع...' : 'رفع العينة'}</button>
              </div>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5"><h2 className="text-white font-black">عيناتك ({(artist?.audioSamples || []).length})</h2></div>
              {(artist?.audioSamples || []).length === 0 ? (<div className="px-6 py-12 text-center"><Music size={40} className="text-gray-700 mx-auto mb-3" /><p className="text-gray-500 font-bold">لا توجد عينات بعد</p></div>) : (
                <div className="divide-y divide-white/5">
                  {artist.audioSamples.map((sample: any, i: number) => (
                    <div key={i} className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => togglePlay(sample.url, i)} className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition ${playingIdx === i ? 'bg-red-600' : 'bg-white/10 hover:bg-red-600'}`}>
                          {playingIdx === i ? <span className="w-3 h-3 border-2 border-white border-r-transparent rounded-full animate-spin" /> : <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg>}
                        </button>
                        <div className="flex-1">
                          {editingSampleIdx === i ? (
                            <div className="flex items-center gap-2">
                              <input value={editingSampleName} onChange={e => setEditingSampleName(e.target.value)} className="flex-1 bg-white/10 text-white text-sm font-bold rounded-lg px-3 py-1.5 outline-none border border-white/20 focus:border-red-500" />
                              <button onClick={() => handleRenameSample(i)} disabled={saving} className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition"><Save size={12} className="text-white" /></button>
                              <button onClick={() => setEditingSampleIdx(null)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition"><X size={12} className="text-white" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-white font-black text-sm">{sample.name}</p>
                              <button onClick={() => { setEditingSampleIdx(i); setEditingSampleName(sample.name); }} className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center hover:bg-white/15 transition"><Edit3 size={11} className="text-gray-400" /></button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {sample.pendingApproval ? <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">⏳ انتظار</span> : <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">✓ معتمدة</span>}
                          <button onClick={() => handleDeleteSample(i)} className="w-7 h-7 bg-red-600/10 rounded-lg flex items-center justify-center hover:bg-red-600 transition group"><Trash2 size={13} className="text-red-400 group-hover:text-white" /></button>
                        </div>
                      </div>
                      <audio src={sample.url} controls className="w-full h-8 opacity-50" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5"><Camera size={18} className="text-red-400" /><h2 className="text-white font-black">الصورة الشخصية</h2></div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-800 border-2 border-white/10">
                  {profilePicPreview ? <img src={profilePicPreview} alt="preview" className="w-full h-full object-cover" /> : artist?.profilePicture ? <img src={artist.profilePicture} alt={artist.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl font-black text-gray-600">{artist?.name?.[0]}</div>}
                </div>
                <input type="file" accept="image/*" id="picFile" className="hidden" onChange={e => { const f = e.target.files?.[0] || null; setProfilePic(f); if (f) setProfilePicPreview(URL.createObjectURL(f)); }} />
                <label htmlFor="picFile" className="cursor-pointer glass text-gray-300 px-5 py-2 rounded-full font-bold text-sm hover:bg-white/10 transition">اختيار صورة</label>
                <button onClick={handleProfilePicUpload} disabled={uploading || !profilePic} className="w-full max-w-xs bg-red-600 text-white py-3 rounded-xl font-black hover:bg-red-700 disabled:bg-white/5 disabled:text-gray-500 transition flex items-center justify-center gap-2"><Upload size={16} />{uploading ? 'جاري الرفع...' : 'تحديث الصورة'}</button>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Edit3 size={18} className="text-red-400" /><h2 className="text-white font-black">نبذة عنك (Bio)</h2></div>
                {!editingBio && <button onClick={() => setEditingBio(true)} className="glass text-gray-400 px-3 py-1.5 rounded-lg font-bold text-xs hover:text-white transition flex items-center gap-1"><Edit3 size={12} /> تعديل</button>}
              </div>
              {editingBio ? (
                <div className="space-y-3">
                  <textarea value={bioValue} onChange={e => setBioValue(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition resize-none placeholder:text-gray-500" placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..." />
                  <div className="flex gap-2">
                    <button onClick={handleSaveBio} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"><Save size={14} /> حفظ</button>
                    <button onClick={() => { setEditingBio(false); setBioValue(artist?.bio || ''); }} className="flex-1 glass text-gray-400 py-2.5 rounded-xl font-black text-sm hover:bg-white/10 transition">إلغاء</button>
                  </div>
                </div>
              ) : <p className="text-gray-400 font-bold text-sm leading-relaxed">{artist?.bio || <span className="text-gray-600 italic">لم تُضف نبذة بعد...</span>}</p>}
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Sparkles size={18} className="text-red-400" /><h2 className="text-white font-black">الجملة التعريفية (Tagline)</h2></div>
                {!editingTagline && <button onClick={() => setEditingTagline(true)} className="glass text-gray-400 px-3 py-1.5 rounded-lg font-bold text-xs hover:text-white transition flex items-center gap-1"><Edit3 size={12} /> تعديل</button>}
              </div>
              {editingTagline ? (
                <div className="space-y-3">
                  <input value={taglineValue} onChange={e => setTaglineValue(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition placeholder:text-gray-500" placeholder="جملة قصيرة تعبر عنك..." />
                  <div className="flex gap-2">
                    <button onClick={handleSaveTagline} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"><Save size={14} /> حفظ</button>
                    <button onClick={() => { setEditingTagline(false); setTaglineValue(artist?.tagline || ''); }} className="flex-1 glass text-gray-400 py-2.5 rounded-xl font-black text-sm hover:bg-white/10 transition">إلغاء</button>
                  </div>
                </div>
              ) : <p className="text-red-400 font-bold italic text-sm">{artist?.tagline ? `"${artist.tagline}"` : <span className="text-gray-600">لم تُضف tagline بعد...</span>}</p>}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length > 0 && (
              <div className="glass rounded-2xl p-6 flex items-center justify-between">
                <div><p className="text-5xl font-black text-white mb-1">{avgRating}</p><div className="flex gap-1 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={18} className={s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />)}</div><p className="text-gray-400 font-bold text-sm">من {reviews.length} تقييم</p></div>
                <div className="space-y-1.5">{[5,4,3,2,1].map(star => { const count = reviews.filter((r: any) => r.rating === star).length; const pct = reviews.length ? (count / reviews.length) * 100 : 0; return (<div key={star} className="flex items-center gap-2"><span className="text-gray-400 text-xs font-bold w-3">{star}</span><div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width:`${pct}%`}} /></div><span className="text-gray-500 text-xs font-bold w-4">{count}</span></div>); })}</div>
              </div>
            )}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2"><MessageSquare size={18} className="text-red-400" /><h2 className="text-white font-black">تعليقات العملاء</h2></div>
              {reviews.length === 0 ? (<div className="px-6 py-16 text-center"><Star size={48} className="text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-black text-lg mb-1">لا توجد تقييمات بعد</p></div>) : (
                <div className="divide-y divide-white/5">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{r.clientName?.[0] || 'ع'}</div><div><p className="text-white font-black text-sm">{r.clientName || 'عميل'}</p>{r.createdAt && <p className="text-gray-500 text-xs font-bold">{new Date(r.createdAt?.toDate?.() || r.createdAt).toLocaleDateString('ar-DZ')}</p>}</div></div>
                        <div className="flex gap-0.5 flex-shrink-0">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />)}</div>
                      </div>
                      {r.comment && <p className="text-gray-400 font-bold text-sm leading-relaxed mr-12">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2"><Bell size={18} className="text-red-400" /><h2 className="text-white font-black">الإشعارات</h2>{unreadCount > 0 && <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{unreadCount} جديد</span>}</div>
              {unreadCount > 0 && <button onClick={markAllRead} className="text-gray-400 hover:text-white font-bold text-xs transition flex items-center gap-1"><Check size={12} /> تحديد الكل كمقروء</button>}
            </div>
            {notifications.length === 0 ? (<div className="px-6 py-16 text-center"><Bell size={48} className="text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-black text-lg mb-1">لا توجد إشعارات</p></div>) : (
              <div className="divide-y divide-white/5">
                {notifications.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map((n: any) => (
                  <div key={n.id} className={`px-6 py-4 flex items-start gap-3 transition ${!n.read ? 'bg-red-600/5' : 'hover:bg-white/3'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'new_order' ? 'bg-blue-600/20' : n.type === 'sample_approved' ? 'bg-emerald-600/20' : n.type === 'sample_rejected' ? 'bg-red-600/20' : n.type === 'order_feedback' ? 'bg-orange-600/20' : 'bg-amber-600/20'}`}>
                      {n.type === 'new_order' ? <Package size={16} className="text-blue-400" /> : n.type === 'sample_approved' ? <Check size={16} className="text-emerald-400" /> : n.type === 'sample_rejected' ? <X size={16} className="text-red-400" /> : n.type === 'order_feedback' ? <MessageSquare size={16} className="text-orange-400" /> : <Bell size={16} className="text-amber-400" />}
                    </div>
                    <div className="flex-1"><p className={`font-black text-sm ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title || 'إشعار جديد'}</p>{n.body && <p className="text-gray-500 font-bold text-xs mt-0.5">{n.body}</p>}{n.createdAt && <p className="text-gray-600 text-xs font-bold mt-1">{new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleDateString('ar-DZ')}</p>}</div>
                    {!n.read && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* modal تفاصيل الطلب للمعلق */}
      {selectedArtistOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
              <h2 className="text-white font-black text-lg">تفاصيل الطلب</h2>
              <button onClick={() => setSelectedArtistOrder(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* معلومات أساسية */}
              <div className="glass rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-black">{selectedArtistOrder.selectedPackage}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${statusConfig[selectedArtistOrder.status]?.color}`}>
                    {statusConfig[selectedArtistOrder.status]?.label}
                  </span>
                </div>
                <p className="text-gray-400 font-bold text-sm">العميل: <span className="text-gray-200">{selectedArtistOrder.clientName}</span></p>
                <p className="text-gray-400 font-bold text-sm">نوع العمل: <span className="text-gray-200">{selectedArtistOrder.workType}</span></p>
              </div>
              {/* النص الكامل */}
              {selectedArtistOrder.description && (
                <div>
                  <p className="text-red-400 font-black text-sm mb-2 flex items-center gap-2"><FileText size={14} /> النص الكامل وتفاصيل المشروع</p>
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-4">
                    <p className="text-gray-200 font-bold text-sm leading-relaxed whitespace-pre-wrap">{selectedArtistOrder.description}</p>
                  </div>
                </div>
              )}
              {/* الملف المرفق */}
              {selectedArtistOrder.fileAttachmentURL && (
                <div>
                  <p className="text-red-400 font-black text-sm mb-2 flex items-center gap-2"><Download size={14} /> الملف المرفق</p>
                  <a href={selectedArtistOrder.fileAttachmentURL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-emerald-600/10 border border-emerald-600/20 rounded-2xl p-4 hover:bg-emerald-600/20 transition">
                    <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><Download size={16} className="text-white" /></div>
                    <div><p className="font-black text-emerald-400 text-sm">تحميل الملف</p><p className="text-emerald-600 font-bold text-xs">اضغط للفتح أو التحميل</p></div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
