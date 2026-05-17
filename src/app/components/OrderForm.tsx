'use client';

import React, { useState, useEffect } from 'react';
import { db, app } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Artist { id: string; name: string; }
interface Package { id: string; name: string; price: string; desc?: string; features?: string[]; popular?: boolean; }

export function OrderForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedVoiceActor, setSelectedVoiceActor] = useState('');
  const [workType, setWorkType] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const workTypes = ['إعلان تجاري', 'وثائقي', 'كتاب صوتي', 'رد آلي (IVR)', 'بودكاست', 'آخر'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsSnap, packagesSnap] = await Promise.all([
          getDocs(collection(db, 'artists')),
          getDocs(collection(db, 'packages')),
        ]);
        const approvedArtists = artistsSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(a => a.name && a.audioSamples?.some((s: any) => !s.pendingApproval))
          .map(a => ({ id: a.id, name: a.name }));
        approvedArtists.push({ id: 'auto', name: 'اختيار الأنسب من طرفكم' });
        setArtists(approvedArtists);
        setPackages(packagesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Package)));
      } catch (e) {
        console.error(e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) { setError('يرجى اختيار الباقة المناسبة أولاً'); return; }
    if (!selectedVoiceActor) { setError('يرجى اختيار المعلق الصوتي'); return; }

    setLoading(true);
    setError(null);

    try {
      let fileDownloadURL = null;
      if (attachedFile) {
        const storage = getStorage(app);
        const storageRef = ref(storage, `orders/${Date.now()}_${attachedFile.name}`);
        const snapshot = await uploadBytes(storageRef, attachedFile);
        fileDownloadURL = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'orders'), {
        firstName, lastName, email, phoneNumber,
        selectedPackage, selectedVoiceActor, workType,
        description, fileAttachmentURL: fileDownloadURL,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Firebase Error: ', err);
      setError('حدث خطأ أثناء الإرسال، يرجى التأكد من تفعيل Firebase Storage والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-green-50 border-2 border-green-200 text-green-800 rounded-[32px] text-center shadow-xl">
        <h2 className="text-3xl font-bold mb-4">تم استلام طلبك بنجاح!</h2>
        <p className="text-lg">شكراً لثقتك بـ VoxDub. سيقوم فريقنا بمراجعة طلبك والتواصل معك قريباً.</p>
        <button onClick={() => setIsSubmitted(false)} className="mt-8 text-green-700 font-bold underline">إرسال طلب آخر</button>
      </div>
    );
  }

  return (
    <section className="py-16 bg-stone-50" id="order-form">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-900 mb-4">ابدأ مشروعك الآن</h2>
          <p className="text-stone-500">اختر الباقة المناسبة وأكمل بياناتك لنبدأ العمل فوراً</p>
        </div>

        {dataLoading ? (
          <div className="text-center py-12 text-stone-400 font-bold">جاري تحميل البيانات...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Packages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.name)}
                  className={`cursor-pointer p-6 rounded-[24px] border-2 transition-all duration-300 ${
                    selectedPackage === pkg.name
                      ? (pkg.popular ? 'border-red-600 bg-red-50 shadow-lg' : 'border-stone-800 bg-stone-50 shadow-lg')
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  {pkg.popular && <div className="text-xs font-black text-red-600 mb-2">⭐ الأكثر طلباً</div>}
                  <h3 className="font-bold text-lg text-stone-800 mb-2">{pkg.name}</h3>
                  <p className="text-2xl font-black mb-2">{pkg.price} <span className="text-sm font-normal text-stone-500">د.ج</span></p>
                  {pkg.desc && <p className="text-xs text-stone-500 mb-4">{pkg.desc}</p>}
                  {pkg.features && (
                    <ul className="space-y-2">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-[11px] text-stone-600 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-red-600" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl border border-stone-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none" placeholder="الاسم الأول *" />
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none" placeholder="اللقب *" />
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none" placeholder="البريد الإلكتروني *" />
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none" placeholder="رقم الهاتف *" />
                  <select value={workType} onChange={e => setWorkType(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none">
                    <option value="">اختر نوع العمل *</option>
                    {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">اختر المعلق الصوتي *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {artists.map(actor => (
                        <button key={actor.id} type="button" onClick={() => setSelectedVoiceActor(actor.name)}
                          className={`p-2 text-[11px] font-bold border rounded-xl transition-all ${
                            selectedVoiceActor === actor.name ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200'
                          }`}>
                          {actor.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none" rows={3} placeholder="تفاصيل إضافية *" />
                  <input type="file" onChange={e => setAttachedFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-stone-500 cursor-pointer" />
                </div>
              </div>

              <div className="mt-12">
                <button type="submit" disabled={loading}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-stone-900 transition-all duration-300 disabled:bg-stone-300">
                  {loading ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
                </button>
                {error && <p className="text-red-600 text-center font-bold mt-4">{error}</p>}
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
