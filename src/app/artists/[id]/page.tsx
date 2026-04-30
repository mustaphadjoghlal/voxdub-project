'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Mic2, Play, Pause, ArrowRight, Star, Award } from 'lucide-react';

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
      setCurrentAudio(newAudio);
      setPlayingIndex(index);
      newAudio.onended = () => setPlayingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-xl font-black text-red-600 animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <p className="text-2xl font-black text-gray-400">المعلق غير موجود</p>
        <Link href="/artists" className="text-red-600 font-black hover:underline">← العودة للمعلقين</Link>
      </div>
    );
  }

  // العينات المعتمدة فقط
  const samples = (artist.audioSamples || []).filter((s: any) =>
    typeof s === 'string' || !s.pendingApproval
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-20 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl"><Mic2 className="text-white w-5 h-5" /></div>
            <span className="text-2xl font-black">Vox<span className="text-red-600">Dub</span></span>
          </Link>
          <Link href="/artists" className="flex items-center gap-2 text-gray-600 font-bold hover:text-red-600 transition">
            <ArrowRight size={18} /> العودة للمعلقين
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* بطاقة المعلق الرئيسية */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0 border-4 border-white/10">
            {artist.profilePicture ? (
              <img src={artist.profilePicture} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-black text-gray-400">
                {artist.name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-3 mb-1">
              <Award size={20} className="text-red-400" />
              <h1 className="text-3xl font-black">{artist.name}</h1>
            </div>
            {artist.tagline && (
              <p className="text-red-400 font-black text-sm mb-3 italic">"{artist.tagline}"</p>
            )}
            <p className="text-gray-400 font-bold mb-4">{artist.role || artist.style || ''}</p>
            {artist.rating && (
              <div className="flex items-center justify-center md:justify-end gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={18} className={s <= Math.round(artist.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
                ))}
                <span className="font-black mr-2">{artist.rating}</span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {artist.gender && (
                <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/10">
                  <p className="text-gray-400 text-xs font-bold mb-1">الجنس</p>
                  <p className="font-black text-sm">{artist.gender}</p>
                </div>
              )}
              {artist.voiceType && (
                <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/10">
                  <p className="text-gray-400 text-xs font-bold mb-1">نوع الصوت</p>
                  <p className="font-black text-sm">{Array.isArray(artist.voiceType) ? (artist.voiceType as string[]).join('، ') : artist.voiceType}</p>
                </div>
              )}
              {artist.experience && (
                <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/10">
                  <p className="text-gray-400 text-xs font-bold mb-1">الخبرة</p>
                  <p className="font-black text-sm">{artist.experience}</p>
                </div>
              )}
              {artist.language && (
                <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/10">
                  <p className="text-gray-400 text-xs font-bold mb-1">اللغة</p>
                  <p className="font-black text-sm">{artist.language}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">نبذة عن المعلق</h2>
            <p className="text-gray-600 font-bold leading-relaxed">{artist.bio}</p>
          </div>
        )}

        {/* العينات الصوتية المعتمدة فقط */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">العينات الصوتية</h2>
          {samples.length > 0 ? (
            <div className="space-y-4">
              {samples.map((sample, index) => {
                const url = getSampleUrl(sample as AudioSample | string);
                const name = getSampleName(sample as AudioSample | string, index);
                const isPlaying = playingIndex === index;
                return (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <button onClick={() => toggleAudio(index, url)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-red-600 text-white' : 'bg-gray-900 text-white hover:bg-red-600'}`}>
                      {isPlaying ? <Pause size={20} /> : <Play size={20} fill="white" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-sm mb-1">{name}</p>
                      {isPlaying && <p className="text-red-600 text-xs font-bold animate-pulse">▶ جاري التشغيل...</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 font-bold text-center py-8">لا توجد عينات صوتية بعد</p>
          )}
        </div>

        <div className="text-center">
          <Link href="/register" className="bg-red-600 text-white px-12 py-4 rounded-full font-black text-lg hover:bg-gray-900 transition-all inline-block shadow-lg">
            اطلب هذا الصوت الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
