'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../components/firebase';
import Link from 'next/link';
import { Mic2, ArrowRight } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  gender: string;
  voiceType: string;
  profilePicture?: string;
  audioSamples?: any[];
}

const Artists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterVoiceType, setFilterVoiceType] = useState<string>('all');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'artists'));
        const artistsData: Artist[] = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            gender: doc.data().gender || '',
            voiceType: doc.data().voiceType || '',
            profilePicture: doc.data().profilePicture,
            audioSamples: doc.data().audioSamples || [],
          }))
          // يظهر فقط المعلقون الذين عندهم عينة معتمدة
          .filter(a => a.name !== '' && a.audioSamples?.some((s: any) => !s.pendingApproval));
        setArtists(artistsData);
        setFilteredArtists(artistsData);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError('فشل في جلب قائمة المعلقين.');
      }
      setLoading(false);
    };
    fetchArtists();
  }, []);

  useEffect(() => {
    let currentArtists = artists;
    if (filterGender !== 'all') currentArtists = currentArtists.filter(a => a.gender === filterGender);
    if (filterVoiceType !== 'all') currentArtists = currentArtists.filter(a => a.voiceType === filterVoiceType);
    setFilteredArtists(currentArtists);
  }, [filterGender, filterVoiceType, artists]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-20 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl"><Mic2 className="text-white w-5 h-5" /></div>
            <span className="text-2xl font-black">Vox<span className="text-red-600">Dub</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-600 font-bold hover:text-red-600 transition">
            <ArrowRight size={18} /> العودة للرئيسية
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-black text-gray-900 mb-8 text-center">مكتبة المعلقين الصوتيين</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-black text-sm">الجنس:</label>
            <select className="bg-white border border-gray-200 rounded-xl py-2 px-4 text-gray-700 font-bold text-sm outline-none"
              value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              <option value="all">الكل</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-black text-sm">نوع الصوت:</label>
            <select className="bg-white border border-gray-200 rounded-xl py-2 px-4 text-gray-700 font-bold text-sm outline-none"
              value={filterVoiceType} onChange={e => setFilterVoiceType(e.target.value)}>
              <option value="all">الكل</option>
              <option value="رخيم">رخيم</option>
              <option value="ناعم">ناعم</option>
              <option value="إعلاني">إعلاني</option>
              <option value="وثائقي">وثائقي</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">جاري تحميل المعلقين...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold">{error}</div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => {
              const approvedCount = artist.audioSamples?.filter((s: any) => !s.pendingApproval).length || 0;
              return (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <div className="bg-white rounded-3xl shadow-sm p-6 text-center border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                    {artist.profilePicture ? (
                      <img src={artist.profilePicture} alt={artist.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-red-100" />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-100 flex items-center justify-center text-3xl font-black text-gray-300">
                        {artist.name?.[0] || '?'}
                      </div>
                    )}
                    <h3 className="text-xl font-black text-gray-900 mb-2">{artist.name}</h3>
                    <p className="text-gray-500 font-bold text-sm mb-1">{artist.gender}</p>
                    <p className="text-gray-500 font-bold text-sm mb-4">{artist.voiceType}</p>
                    <span className="bg-red-50 text-red-600 font-black text-xs px-4 py-2 rounded-full">
                      {approvedCount} عينة صوتية
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 font-bold text-lg py-20">لا يوجد معلقون مطابقون</p>
        )}
      </div>
    </div>
  );
};

export default Artists;
