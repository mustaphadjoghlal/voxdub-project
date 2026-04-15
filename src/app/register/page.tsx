'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mic2, Mic, Briefcase, ArrowRight, Check } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [userType, setUserType] = useState<'artist' | 'client' | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('ذكر');
  
  // 1. تغيير الحالة لتكون مصفوفة بدلاً من نص
  const [voiceType, setVoiceType] = useState<string[]>([]);
  
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // مصفوفة الخيارات الجديدة
  const performanceOptions = [
    "وثائقي", "إعلاني", "إخباري", "كتب صوتية", 
    "دوبلاج", "شعر وخواطر", "رسمي", "رد آلي"
  ];

  // دالة لإضافة أو إزالة الأداء من المصفوفة
  const toggleVoiceType = (type: string) => {
    if (voiceType.includes(type)) {
      setVoiceType(voiceType.filter(t => t !== type));
    } else {
      setVoiceType([...voiceType, type]);
    }
  };

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientConfirmPassword, setClientConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (!/[a-zA-Z]/.test(pwd)) return 'كلمة المرور يجب أن تحتوي على حروف لاتينية';
    if (!/[0-9]/.test(pwd)) return 'كلمة المرور يجب أن تحتوي على أرقام';
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // تحقق إضافي للمعلق الصوتي
    if (userType === 'artist' && voiceType.length === 0) {
      setError('يرجى اختيار أداء صوتي واحد على الأقل');
      return;
    }

    setLoading(true);

    const currentEmail = userType === 'artist' ? email : clientEmail;
    const currentPassword = userType === 'artist' ? password : clientPassword;
    const currentConfirm = userType === 'artist' ? confirmPassword : clientConfirmPassword;

    const pwdError = validatePassword(currentPassword);
    if (pwdError) { setError(pwdError); setLoading(false); return; }
    if (currentPassword !== currentConfirm) { setError('كلمات المرور غير متطابقة'); setLoading(false); return; }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, currentEmail, currentPassword);
      const uid = userCredential.user.uid;

      if (userType === 'artist') {
        await addDoc(collection(db, 'artists'), {
          uid,
          name,
          email,
          gender,
          voiceType, // سيتم تخزينها كمصفوفة في Firestore
          tagline,
          bio,
          role: 'artist',
          approved: true,
          profilePicture: '',
          audioSamples: [],
          createdAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'clients'), {
          uid,
          name: clientName,
          email: clientEmail,
          company,
          phone,
          role: 'client',
          createdAt: new Date().toISOString()
        });
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً');
      } else {
        setError('حدث خطأ أثناء التسجيل.');
      }
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-md w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">تم التسجيل بنجاح!</h2>
          <p className="text-gray-500 font-bold">جاري تحويلك لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>

      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="bg-red-600 p-2 rounded-xl">
              <Mic2 className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-black">Vox<span className="text-red-600">Dub</span></span>
          </Link>
        </div>

        {step === 'choose' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 text-center mb-2">انضم إلى VoxDub</h2>
            <p className="text-gray-500 font-bold text-center mb-8">اختر نوع حسابك</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setUserType('artist'); setStep('form'); }}
                className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all text-center">
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
                  <Mic size={32} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">معلق صوتي</h3>
                <p className="text-gray-400 font-bold text-sm">أنا معلق صوتي محترف وأريد عرض خدماتي</p>
              </button>
              <button onClick={() => { setUserType('client'); setStep('form'); }}
                className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all text-center">
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
                  <Briefcase size={32} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">صاحب عمل</h3>
                <p className="text-gray-400 font-bold text-sm">أريد الاستعانة بمعلق صوتي لمشروعي</p>
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-500 font-bold text-sm">لديك حساب بالفعل؟</p>
              <Link href="/login" className="text-red-600 font-black hover:underline">تسجيل الدخول</Link>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <button onClick={() => { setStep('choose'); setError(''); }}
              className="flex items-center gap-2 text-gray-500 font-bold hover:text-red-600 transition mb-6">
              <ArrowRight size={18} /> رجوع
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {userType === 'artist' ? 'تسجيل معلق صوتي' : 'تسجيل صاحب عمل'}
            </h2>
            <p className="text-gray-400 font-bold text-sm mb-6">
              {userType === 'artist' ? 'أنشئ حسابك وابدأ عرض خدماتك فوراً' : 'أنشئ حسابك وابدأ طلب خدماتك'}
            </p>
            <form onSubmit={handleRegister} className="space-y-4">
              {userType === 'artist' ? (
                <>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="الاسم الكامل *" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="البريد الإلكتروني *" />
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">الجنس:</label>
                    <div className="flex gap-4">
                      {['ذكر', 'أنثى'].map((g) => (
                        <button key={g} type="button" onClick={() => setGender(g)}
                          className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${gender === g ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700">الأداءات الصوتية المفضلّة (اختر واحدة أو أكثر):</label>
                    <div className="flex flex-wrap gap-2">
                      {performanceOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleVoiceType(opt)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2
                            ${voiceType.includes(opt) 
                              ? 'bg-red-600 text-white border-red-600' 
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-red-300'}`}
                        >
                          {opt}
                          {voiceType.includes(opt) && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="Tagline — جملة قصيرة تعبر عنك" />
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors resize-none"
                    placeholder="نبذة عنك" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="كلمة المرور *" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="تأكيد كلمة المرور *" />
                </>
              ) : (
                <>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="الاسم الكامل *" />
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="البريد الإلكتروني *" />
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="اسم الشركة (اختياري)" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="رقم الهاتف (اختياري)" />
                  <input type="password" value={clientPassword} onChange={e => setClientPassword(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="كلمة المرور *" />
                  <input type="password" value={clientConfirmPassword} onChange={e => setClientConfirmPassword(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition-colors"
                    placeholder="تأكيد كلمة المرور *" />
                </>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center py-3 px-4 rounded-xl">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-900 disabled:bg-gray-200 transition-all">
                {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
