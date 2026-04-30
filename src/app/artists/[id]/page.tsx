'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mic2, Play, Pause, ArrowRight, Star,
  Mic, Globe, Clock, ChevronLeft, Headphones
} from 'lucide-react';

interface AudioSample {
  name: string;
  url: string;
  pendingApproval?: boolean;
}

interface Artist {
  id: string;
  name: string;
  gender?: string;
  voiceType?: string;
  style?: string;
  role?: string;
  experience?: string;
  language?: string;
  rating?: number;
  profilePicture?: string;
  audioSamples?: AudioSample[] | string[];
  audio?: string;
  tagline?: string;
  bio?: string;
}

export default function ArtistProfile() {
  const params = useParams();
  const id = params?.id as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const docRef = doc(db, 'artists', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArtist({ id: docSnap.id, ...docSnap.data() } as Artist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArtist();
  }, [id]);

  const getSampleName = (sample: AudioSample | string, index: number): string => {
    if (typeof sample === 'string') return `عينة ${index + 1}`;
    return sample.name;
  };

  const getSampleUrl = (sample: AudioSample | string): string => {
    if (typeof sample === 'string') return sample;
    return sample.url;
  };

  const toggleAudio = (index: number, url: string) => {
    if (playingIndex === index) {
      currentAudio?.pause();
      setPlayingIndex(null);
    } else {
      if (currentAudio) currentAudio.pause();
      const newAudio = new Audio(url);
      newAudio.play().catch(() => {});

      newAudio.ontimeupdate = () => {
        if (newAudio.duration) {
          setProgress(prev => ({
            ...prev,
            [index]: (newAudio.currentTime / newAudio.duration) * 100
          }));
        }
      };

      setCurrentAudio(newAudio);
      setPlayingIndex(index);
      newAudio.onended = () => {
        setPlayingIndex(null);
        setProgress(prev => ({ ...prev, [index]: 0 }));
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Mic2 className="text-white w-8 h-8" />
          </div>
          <p className="text-white font-black text-lg animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4" dir="rtl">
        <p className="text-2xl font-black text-gray-400">المعلق غير موجود</p>
        <Link href="/artists" className="text-red-600 font-black hover:underline">← العودة للمعلقين</Link>
      </div>
    );
  }

  const samples = (artist.audioSamples || []).filter((s: any) =>
    typeof s === 'string' || !s.pendingApproval
  );

  const voiceTypes = Array.isArray(artist.voiceType)
    ? artist.voiceType
    : artist.voiceType ? [artist.voiceType] : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        * { font-family: 'Cairo', sans-serif; }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
        .glow { box-shadow: 0 0 60px rgba(220,38,38,0.15); }
        .wave-bar { animation: wave 1.2s ease-in-out infinite; }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/5 h-20 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl" style={{boxShadow:'0 0 20px rgba(220,38,38,0.4)'}}>
              <Mic2 className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white">Vox<span className="text-red-500">Dub</span></span>
          </Link>
          <Link href="/artists" className="flex items-center gap-2 text-gray-400 font-bold hover:text-white transition text-sm">
            <ArrowRight size={16} /> العودة للمعلقين
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-8 glow">
          {/* خلفية gradient */}
          <div className="absolute inset-0 bg-gradient-to-bl from-red-900/30 via-gray-900 to-[#0f0f0f]" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-2xl" />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

              {/* الصورة */}
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-2 border-red-600/40"
                  style={{boxShadow:'0 0 40px rgba(220,38,38,0.2)'}}>
                  {artist.profilePicture ? (
                    <img src={artist.profilePicture} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl font-black text-red-500">
                      {artist.name?.[0] || '?'}
                    </div>
                  )}
                </div>
                {/* نقطة نشط */}
                <div className="absolute -bottom-2 -left-2 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#0a0a0a]" />
              </div>

              {/* المعلومات */}
              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-row-reverse md:flex-row">
                  <span className="bg-red-600/20 text-red-400 text-xs font-black px-3 py-1 rounded-full border border-red-600/30">
                    معلق صوتي
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-white">{artist.name}</h1>
                </div>

                {artist.tagline && (
                  <p className="text-red-400 font-black text-base mb-4 italic">"{artist.tagline}"</p>
                )}

                {/* التقييم */}
                {artist.rating && (
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mb-5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(artist.rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
                    ))}
                    <span className="text-amber-400 font-black text-sm mr-1">{artist.rating}</span>
                  </div>
                )}

                {/* التاغات */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  {artist.gender && (
                    <span className="glass text-gray-300 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {artist.gender}
                    </span>
                  )}
                  {voiceTypes.map((vt, i) => (
                    <span key={i} className="glass text-gray-300 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5">
                      <Mic size={11} className="text-red-400" />
                      {vt}
                    </span>
                  ))}
                  {artist.language && (
                    <span className="glass text-gray-300 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5">
                      <Globe size={11} className="text-emerald-400" />
                      {artist.language}
                    </span>
                  )}
                  {artist.experience && (
                    <span className="glass text-gray-300 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5">
                      <Clock size={11} className="text-amber-400" />
                      {artist.experience}
                    </span>
                  )}
                </div>

                {/* إحصائيات */}
                <div className="flex gap-4 justify-center md:justify-start">
                  <div className="glass rounded-2xl px-5 py-3 text-center">
                    <p className="text-2xl font-black text-white">{samples.length}</p>
                    <p className="text-gray-500 text-xs font-bold">عينة صوتية</p>
                  </div>
                  {artist.rating && (
                    <div className="glass rounded-2xl px-5 py-3 text-center">
                      <p className="text-2xl font-black text-amber-400">{artist.rating}</p>
                      <p className="text-gray-500 text-xs font-bold">التقييم</p>
                    </div>
                  )}
                </div>
              </div>

              {/* زر الطلب — desktop */}
              <div className="hidden md:block flex-shrink-0">
                <Link href="/register"
                  className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
                  style={{boxShadow:'0 0 30px rgba(220,38,38,0.3)'}}>
                  اطلب هذا الصوت
                  <ChevronLeft size={16} />
                </Link>
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* العينات الصوتية */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <Headphones size={16} className="text-red-400" />
                </div>
                <h2 className="text-white font-black text-lg">العينات الصوتية</h2>
                <span className="bg-red-600/20 text-red-400 text-xs font-black px-2 py-0.5 rounded-full mr-auto">{samples.length}</span>
              </div>

              {samples.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {samples.map((sample, index) => {
                    const url = getSampleUrl(sample as AudioSample | string);
                    const name = getSampleName(sample as AudioSample | string, index);
                    const isPlaying = playingIndex === index;
                    const pct = progress[index] || 0;

                    return (
                      <div key={index} className={`px-6 py-4 transition-all ${isPlaying ? 'bg-red-600/5' : 'hover:bg-white/3'}`}>
                        <div className="flex items-center gap-4">
                          {/* زر التشغيل */}
                          <button onClick={() => toggleAudio(index, url)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-red-600' : 'glass hover:bg-red-600/20'}`}
                            style={isPlaying ? {boxShadow:'0 0 20px rgba(220,38,38,0.4)'} : {}}>
                            {isPlaying
                              ? <Pause size={18} className="text-white" />
                              : <Play size={18} className="text-gray-300 fill-gray-300" />}
                          </button>

                          <div className="flex-1">
                            <p className="text-white font-black text-sm mb-2">{name}</p>
                            {/* شريط التقدم */}
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full transition-all duration-300"
                                style={{width: `${pct}%`}} />
                            </div>
                          </div>

                          {/* موجات صوتية */}
                          {isPlaying && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {[1,2,3,4,5].map(b => (
                                <div key={b} className="wave-bar w-1 bg-red-500 rounded-full"
                                  style={{
                                    height: `${12 + b * 3}px`,
                                    animationDelay: `${b * 0.1}s`
                                  }} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <Headphones size={48} className="text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-black text-lg">لا توجد عينات صوتية بعد</p>
                </div>
              )}
            </div>
          </div>

          {/* الجانب الأيمن */}
          <div className="space-y-4">

            {/* نبذة */}
            {artist.bio && (
              <div className="glass rounded-3xl p-6">
                <h3 className="text-white font-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-500 rounded-full" />
                  نبذة عن المعلق
                </h3>
                <p className="text-gray-400 font-bold text-sm leading-relaxed">{artist.bio}</p>
              </div>
            )}

            {/* تخصصات */}
            {voiceTypes.length > 0 && (
              <div className="glass rounded-3xl p-6">
                <h3 className="text-white font-black mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-500 rounded-full" />
                  الأداءات الصوتية
                </h3>
                <div className="space-y-2">
                  {voiceTypes.map((vt, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-gray-300 font-bold text-sm">{vt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* زر الطلب — mobile */}
            <Link href="/register"
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-center block hover:bg-red-700 transition-all md:hidden"
              style={{boxShadow:'0 0 30px rgba(220,38,38,0.3)'}}>
              اطلب هذا الصوت الآن ←
            </Link>

            {/* زر الطلب — desktop */}
            <Link href="/register"
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-center hidden md:block hover:bg-red-700 transition-all"
              style={{boxShadow:'0 0 30px rgba(220,38,38,0.3)'}}>
              اطلب هذا الصوت الآن ←
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
