'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './components/firebase';
import {
  Mic2, Play, Pause, Award, Star, Mic,
  Search, MessageSquare, Headphones, FileCheck,
  CheckCircle2
} from 'lucide-react';

interface AudioSample {
  name: string;
  url: string;
}

interface Artist {
  id: string;
  name: string;
  role?: string;
  style?: string;
  rating?: number;
  experience?: string;
  language?: string;
  image?: string;
  profilePicture?: string;
  audioSamples?: AudioSample[] | string[];
  audio?: string;
}

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const packages = [
    { name: 'باقة التعليق الصوتي', price: '5000', popular: false, desc: 'مثالية للمشاريع البسيطة', features: ['تعليق صوتي احترافي', 'جودة تسجيل HD', 'تسليم خلال 3 أيام', 'مراجعة واحدة مجانية'] },
    { name: 'باقة التعليق والتدقيق', price: '8000', popular: true, desc: 'للمحتوى الاحترافي', features: ['كل مميزات الباقة الأولى', 'تدقيق لغوي للنص', 'تصحيح الأخطاء النحوية', 'تحسين الصياغة'] },
    { name: 'باقة كاملة المحتوى', price: '13000', popular: false, desc: 'حل شامل ومتكامل', features: ['كل مميزات الباقتين السابقتين', 'كتابة النص من الصفر', 'بحث وتطوير المحتوى', 'كتابة إبداعية'] },
  ];

  const getAudioUrl = (artist: Artist): string | null => {
    if (!artist.audioSamples || artist.audioSamples.length === 0) return artist.audio || null;
    const first = artist.audioSamples[0];
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && 'url' in first) return first.url;
    return artist.audio || null;
  };

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'artists'));
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Artist))
          .filter(a => a.name);
        setArtists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingArtists(false);
      }
    };
    fetchArtists();
  }, []);

  const toggleAudio = (artist: Artist) => {
    const audioUrl = getAudioUrl(artist);
    if (!audioUrl) return;
    if (playingId === artist.id) {
      currentAudio?.pause();
      setPlayingId(null);
    } else {
      if (currentAudio) currentAudio.pause();
      const newAudio = new Audio(audioUrl);
      newAudio.play().catch(() => {});
      setCurrentAudio(newAudio);
      setPlayingId(artist.id);
      newAudio.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        * { font-family: 'Cairo', sans-serif; }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl">
              <Mic2 className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black">Vox<span className="text-red-600">Dub</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#artists" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">المعلقون</a>
            <a href="#pricing" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">الباقات</a>
            <Link href="/login" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">دخول</Link>
            <Link href="/register" className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition">
              انضم إلينا
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-40 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-red-50 text-red-600 font-black px-5 py-2 rounded-full text-sm mb-8 border border-red-100">
            🎙️ منصة المعلقين الصوتيين الأولى في الجزائر
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
            اجعل لمشروعك<br />
            <span className="text-red-600">صوتاً</span> لا يُنسى
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-bold">
            نخبة من المعلقين الصوتيين المحترفين بجودة استوديو عالمية.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#artists" className="bg-gray-900 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-600 transition-all">اكتشف المعلقين</a>
            <Link href="/register" className="bg-white text-gray-900 border-2 border-gray-200 px-10 py-4 rounded-full font-black text-lg hover:border-red-600 hover:text-red-600 transition-all">
              انضم إلينا
            </Link>
          </div>
          <div className="mt-16 flex justify-center gap-12 text-center">
            {[['50+', 'معلق محترف'], ['500+', 'مشروع منجز'], ['100%', 'رضا العملاء']].map(([num, label]) => (
              <div key={label}>
                <div className="text-3xl font-black text-gray-900">{num}</div>
                <div className="text-gray-500 font-bold text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VoxDub */}
      <section className="py-24 bg-gray-950 rounded-[3rem] mx-4 text-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-16">لماذا <span className="text-red-500">VoxDub</span>؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: 'أصوات متنوعة', desc: 'أكثر من 50 معلق صوتي محترف بأساليب وأصوات متنوعة' },
              { icon: Headphones, title: 'جودة عالية', desc: 'تسجيلات بجودة استوديو احترافية مع ضمان الجودة' },
              { icon: FileCheck, title: 'خدمات شاملة', desc: 'باقات متكاملة تشمل الكتابة والتدقيق اللغوي' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black mb-3">{title}</h3>
                <p className="text-gray-400 font-bold leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artists */}
      <section id="artists" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">معلقونا الصوتيون</h2>
            <p className="text-gray-500 font-bold text-lg">اضغط على اسم المعلق لسماع عينته الصوتية</p>
          </div>

          {loadingArtists ? (
            <div className="text-center py-20 text-gray-400 font-bold">جاري تحميل المعلقين...</div>
          ) : artists.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold">لا يوجد معلقون حالياً</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist) => {
                const audioUrl = getAudioUrl(artist);
                const hasAudio = !!audioUrl;
                const isPlaying = playingId === artist.id;
                return (
                  <div key={artist.id} className="bg-gray-900 rounded-3xl p-8 text-white hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <Award size={22} className="text-red-400 opacity-60 flex-shrink-0" />
                      <div className="text-right flex-1 mr-3">
                        <button
                          onClick={() => toggleAudio(artist)}
                          disabled={!hasAudio}
                          className={`text-right w-full group ${hasAudio ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {hasAudio && (
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-red-600' : 'bg-white/10 group-hover:bg-red-600'}`}>
                                {isPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white fill-white" />}
                              </span>
                            )}
                            <h3 className={`text-2xl font-black transition-colors ${hasAudio ? 'group-hover:text-red-400' : ''} ${isPlaying ? 'text-red-400' : 'text-white'}`}>
                              {artist.name}
                            </h3>
                          </div>
                          {hasAudio && (
                            <p className="text-xs text-gray-500 mt-1 font-bold">
                              {isPlaying ? '▶ جاري التشغيل...' : 'اضغط للاستماع'}
                            </p>
                          )}
                        </button>
                        <p className="text-gray-400 font-bold mt-2 text-sm">{artist.role || artist.style || ''}</p>
                        {artist.rating && (
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <span className="font-black text-sm">{artist.rating}</span>
                            <Star size={13} className="fill-yellow-400 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl mb-6 border border-white/10">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                        {(artist.profilePicture || artist.image) ? (
                          <img src={artist.profilePicture || artist.image} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400">
                            {artist.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-gray-300 space-y-1 text-right">
                        {artist.experience && <p>الخبرة: <span className="text-white">{artist.experience}</span></p>}
                        {artist.language && <p>اللغة: <span className="text-white">{artist.language}</span></p>}
                      </div>
                    </div>

                    <Link
                      href={`/artists/${artist.id}`}
                      className="w-full py-3 rounded-2xl font-bold text-center block border border-white/20 text-gray-300 hover:bg-white hover:text-gray-900 transition-all text-sm"
                    >
                      الملف الشخصي
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/artists" className="bg-gray-900 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-600 transition-all inline-block">
              عرض جميع المعلقين
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-gray-900 mb-16">كيف <span className="text-red-600">نعمل؟</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Search, t: 'اكتشف', d: 'اختر الصوت المناسب لمشروعك' },
              { icon: MessageSquare, t: 'تواصل', d: 'أرسل تفاصيل مشروعك والنص' },
              { icon: Headphones, t: 'تنفيذ', d: 'نسجل العمل بأحدث التقنيات' },
              { icon: FileCheck, t: 'استلام', d: 'استلم ملفك بجودة احترافية' },
            ].map((step, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <step.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-black mb-2 text-gray-900">{i + 1}. {step.t}</h3>
                <p className="text-gray-500 font-bold text-sm">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-16">باقاتنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
            {packages.map((plan, i) => (
              <div key={i} className={`p-8 rounded-3xl border-2 bg-white transition-all ${plan.popular ? 'border-red-600 shadow-2xl scale-105 relative' : 'border-gray-100'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full font-black text-sm">
                    الأكثر طلباً
                  </div>
                )}
                <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-400 font-bold text-sm mb-6">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-red-600">{plan.price}</span>
                  <span className="text-gray-400 font-bold text-xs mr-2">دينار</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 size={16} className="text-red-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full py-3 rounded-2xl block text-center font-black transition-all ${plan.popular ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                >
                  ابدأ الآن
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900 mx-4 rounded-3xl text-center text-white mb-8">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-6">هل أنت مستعد؟</h2>
          <p className="text-gray-400 font-bold mb-10 text-lg">انضم إلى VoxDub اليوم — سواء كنت معلقاً صوتياً أو صاحب مشروع</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-700 transition-all">
              انضم إلينا
            </Link>
            <Link href="/login" className="bg-white text-gray-900 px-10 py-4 rounded-full font-black text-lg hover:bg-gray-100 transition-all">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16 text-center rounded-t-3xl">
        <div className="text-3xl font-black mb-4">Vox<span className="text-red-500">Dub</span></div>
        <p className="text-gray-500 font-bold text-sm">إدارة وتأسيس: لميس حميمي © 2026 — جميع الحقوق محفوظة</p>
        <div className="flex justify-center gap-8 mt-8">
          <a href="#artists" className="text-gray-400 hover:text-white font-bold text-sm transition">المعلقون</a>
          <Link href="/login" className="text-gray-400 hover:text-white font-bold text-sm transition">تسجيل الدخول</Link>
          <Link href="/register" className="text-gray-400 hover:text-white font-bold text-sm transition">انضم إلينا</Link>
        </div>
      </footer>
    </div>
  );
}
