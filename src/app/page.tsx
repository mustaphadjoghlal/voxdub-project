'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
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
  const { isLoaded, userRole } = useAuth();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  console.log("🔥 Auth in Home Page:", { isLoaded, userRole });   // ← للتصحيح

  const packages = [
    {
      name: 'باقة التعليق الصوتي',
      price: '5000',
      popular: false,
      desc: 'مثالية للمشاريع البسيطة',
      features: ['تعليق صوتي احترافي', 'جودة تسجيل HD', 'تسليم خلال 3 أيام', 'مراجعة واحدة مجانية']
    },
    {
      name: 'باقة التعليق والتدقيق',
      price: '8000',
      popular: true,
      desc: 'للمحتوى الاحترافي',
      features: ['كل مميزات الباقة الأولى', 'تدقيق لغوي للنص', 'تصحيح الأخطاء النحوية', 'تحسين الصياغة']
    },
    {
      name: 'باقة كاملة المحتوى',
      price: '13000',
      popular: false,
      desc: 'حل شامل ومتكامل',
      features: ['كل مميزات الباقتين السابقتين', 'كتابة النص من الصفر', 'بحث وتطوير المحتوى', 'كتابة إبداعية']
    },
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
          .filter((artist: Artist) => {
            const hasAudio = (artist.audioSamples && artist.audioSamples.length > 0) || !!artist.audio;
            return artist.name && hasAudio;
          });
        setArtists(data);
      } catch (err) {
        console.error("خطأ في جلب المعلقين:", err);
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">جاري تحميل الموقع...</p>
        </div>
      </div>
    );
  }

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

      {/* باقي الكود (Hero, Why VoxDub, Artists, How it works, Pricing, CTA, Footer) كما هو عندك بدون أي تغيير */}

      {/* ... (انسخ باقي الأقسام من الكود القديم اللي عندك) ... */}

      {/* Artists Section (مثال) */}
      <section id="artists" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">معلقونا الصوتيون</h2>
            <p className="text-gray-500 font-bold text-lg">اضغط على اسم المعلق لسماع عينته الصوتية</p>
          </div>

          {loadingArtists ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-bold">جاري تحميل المعلقين...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold">
              لا يوجد معلقون معتمدون بعينات صوتية حالياً
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist) => {
                const audioUrl = getAudioUrl(artist);
                const hasAudio = !!audioUrl;
                const isPlaying = playingId === artist.id;

                return (
                  <div key={artist.id} className="bg-gray-900 rounded-3xl p-8 text-white hover:-translate-y-2 transition-transform duration-300">
                    {/* باقي كود الكارت كما هو عندك */}
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16 text-center rounded-t-3xl">
        <div className="text-3xl font-black mb-4">Vox<span className="text-red-500">Dub</span></div>
        <p className="text-gray-500 font-bold text-sm">إدارة وتأسيس: لميس حميمي © 2026 — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
