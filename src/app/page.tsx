'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './components/firebase';
import { useAuth } from './context/AuthContext';
import {
  Mic2, Play, Pause, Award, Star, Mic,
  Search, MessageSquare, Headphones, FileCheck,
  CheckCircle2, User, LogOut, LayoutDashboard, Building2
} from 'lucide-react';
import ServicesSection from './components/ServicesSection';
import LanguageToggle from './components/LanguageToggle';
import { useLang } from './context/LanguageContext';
import { useSettings } from './context/SettingsContext';

interface AudioSample { name: string; url: string; pendingApproval?: boolean; }
interface Artist {
  id: string; name: string; rating?: number; experience?: string;
  image?: string; profilePicture?: string;
  audioSamples?: AudioSample[] | string[]; audio?: string;
  voiceType?: string; gender?: string;
}
interface Partner { id: string; name: string; logo?: string; }
interface PackageItem {
  id: string;
  name: string; nameEn?: string;
  price: string;
  desc: string; descEn?: string;
  features: string[]; featuresEn?: string[];
  popular: boolean;
}

export default function Home() {
  const { userRole, mounted, logout } = useAuth();
  const { settings } = useSettings();
  const { t, lang, isRTL } = useLang();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [loggedInArtist, setLoggedInArtist] = useState<Artist | null>(null);
  const [loggedInArtistDocId, setLoggedInArtistDocId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [visibleCount, setVisibleCount] = useState(6);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const getAudioUrl = (artist: Artist): string | null => {
    if (!artist.audioSamples?.length) return artist.audio || null;
    const approved = artist.audioSamples.find((s: any) => typeof s === 'object' && 'url' in s && !s.pendingApproval);
    if (approved && typeof approved === 'object' && 'url' in approved) return (approved as AudioSample).url;
    const first = artist.audioSamples[0];
    return typeof first === 'string' ? first : artist.audio || null;
  };

  useEffect(() => {
    getDocs(collection(db, 'artists'))
      .then(snap => setArtists(
        snap.docs.map(d => ({ id: d.id, ...d.data() } as Artist))
          .filter(a => a.name && (a as any).audioSamples?.some((s: any) => !s.pendingApproval))
      ))
      .catch(console.error)
      .finally(() => setLoadingArtists(false));
    getDocs(collection(db, 'partners')).then(s => setPartners(s.docs.map(d => ({ id: d.id, ...d.data() } as Partner)))).catch(() => {});
    getDocs(collection(db, 'packages')).then(s => setPackages(s.docs.map(d => ({ id: d.id, ...d.data() } as PackageItem)))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted || userRole !== 'artist') { setLoggedInArtist(null); return; }
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    getDoc(doc(db, 'artists', userId)).then(snap => {
      if (snap.exists()) { setLoggedInArtist({ id: snap.id, ...snap.data() } as Artist); setLoggedInArtistDocId(snap.id); }
    }).catch(() => {});
  }, [userRole, mounted]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const toggleAudio = (artist: Artist) => {
    const audioUrl = getAudioUrl(artist);
    if (!audioUrl) return;
    if (playingId === artist.id) {
      currentAudioRef.current?.pause();
      setPlayingId(null); setAudioProgress(0); setAudioDuration(0); return;
    }
    currentAudioRef.current?.pause();
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {});
    audio.addEventListener('timeupdate', () => setAudioProgress(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setAudioDuration(audio.duration));
    currentAudioRef.current = audio;
    setPlayingId(artist.id); setAudioProgress(0); setAudioDuration(0);
    audio.onended = () => { setPlayingId(null); setAudioProgress(0); setAudioDuration(0); };
  };

  const handleLogout = () => { logout(); setShowUserMenu(false); setLoggedInArtist(null); };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setContactLoading(true);
    try {
      await addDoc(collection(db, 'contacts'), { name: contactName, email: contactEmail, message: contactMessage, createdAt: serverTimestamp() });
      setContactSent(true); setContactName(''); setContactEmail(''); setContactMessage('');
    } catch { alert(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again'); }
    setContactLoading(false);
  };

  const filteredArtists = artists.filter(a =>
    (!searchQuery || a.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (genderFilter === 'all' ||
     (genderFilter === 'male' && (a.gender === 'ذكر' || a.gender === 'male')) ||
     (genderFilter === 'female' && (a.gender === 'أنثى' || a.gender === 'female')))
  );
  const visibleArtists = filteredArtists.slice(0, visibleCount);
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-white font-sans" dir={dir} style={{ textAlign: isRTL ? 'right' : 'left' }}>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            {settings.logoUrl
              ? <img src={settings.logoUrl} alt="VoxDub" className="h-10 w-auto object-contain" />
              : <><div className="p-2 rounded-xl" style={{ backgroundColor: settings.primaryColor || '#dc2626' }}><Mic2 className="text-white w-5 h-5" /></div>
                 <span className="text-2xl font-black">Vox<span style={{ color: settings.primaryColor || '#dc2626' }}>Dub</span></span></>
            }
          </div>
          <div className="flex items-center gap-3">
            <a href="#services" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">{t('nav.services')}</a>
            <Link href="/about" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">{t('nav.about')}</Link>
            <a href="#artists" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">{t('nav.artists')}</a>
            <a href="#pricing" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">{t('nav.pricing')}</a>
            <a href="#contact" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">{t('contact.title')}</a>
            <LanguageToggle />
            {!mounted ? <div className="w-32 h-10 bg-gray-100 rounded-full animate-pulse" /> : (
              <>
                {userRole === 'visitor' && (
                  <><Link href="/login" className="text-gray-600 font-bold hover:text-red-600 transition hidden md:block">{t('nav.login')}</Link>
                    <Link href="/register" className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition">{t('nav.register')}</Link></>
                )}
                {userRole === 'artist' && loggedInArtist && (
                  <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-full font-black text-sm hover:bg-red-600 transition">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                        {loggedInArtist.profilePicture ? <img src={loggedInArtist.profilePicture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black">{loggedInArtist.name?.[0]}</div>}
                      </div>
                      {t('nav.myAccount')}
                    </button>
                    {showUserMenu && (
                      <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-14 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden z-50`}>
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50"><p className="font-black text-gray-900 text-sm">{loggedInArtist.name}</p></div>
                        <Link href={`/artists/${loggedInArtistDocId}`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-bold text-sm"><User size={16} className="text-red-600" /> {t('nav.profile')}</Link>
                        <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-bold text-sm"><LayoutDashboard size={16} className="text-red-600" /> {t('nav.dashboard')}</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 font-bold text-sm border-t border-gray-100"><LogOut size={16} /> {t('nav.logout')}</button>
                      </div>
                    )}
                  </div>
                )}
                {userRole === 'client' && (
                  <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-full font-black text-sm hover:bg-red-600 transition"><User size={16} /> {t('nav.myAccount')}</button>
                    {showUserMenu && (
                      <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-14 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 overflow-hidden z-50`}>
                        <Link href="/client-dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-bold text-sm"><LayoutDashboard size={16} className="text-red-600" /> {t('nav.dashboard')}</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 font-bold text-sm border-t border-gray-100"><LogOut size={16} /> {t('nav.logout')}</button>
                      </div>
                    )}
                  </div>
                )}
                {userRole === 'admin' && (
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="bg-gray-900 text-white font-bold py-2 px-5 rounded-full hover:bg-red-600 transition text-sm flex items-center gap-2"><LayoutDashboard size={16} /> {t('nav.dashboard')}</Link>
                    <button onClick={handleLogout} className="text-gray-500 font-bold text-sm hover:text-red-600 transition flex items-center gap-1"><LogOut size={16} /> {t('nav.logout')}</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}

      {/* Hero */}
      <section className="pt-10 md:pt-24 pb-20 md:pb-40 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-red-50 text-red-600 font-black px-5 py-2 rounded-full text-sm mb-8 border border-red-100">{t('hero.badge')}</div>
          <h1 className="font-black text-gray-900 mb-8 leading-tight" style={{ fontSize: 'clamp(2.5rem, 11vw, 5rem)' }}>
            {t('hero.title1')}<br /><span className="text-red-600">{t('hero.title2')}</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-bold">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#artists" className="bg-gray-900 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-600 transition-all">{t('hero.cta1')}</a>
            {mounted && userRole === 'visitor' && <Link href="/register" className="bg-white text-gray-900 border-2 border-gray-200 px-10 py-4 rounded-full font-black text-lg hover:border-red-600 hover:text-red-600 transition-all">{t('hero.cta2')}</Link>}
          </div>
          <div className="mt-16 flex justify-center gap-12 text-center">
            {[
              [t('hero.stat1'), t('hero.stat1.label')],
              [t('hero.stat2'), t('hero.stat2.label')],
              [t('hero.stat3'), t('hero.stat3.label')],
            ].map(([num, label]) => (
              <div key={label}><div className="text-3xl font-black text-gray-900">{num}</div><div className="text-gray-500 font-bold text-sm">{label}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VoxDub */}
      <section className="py-24 bg-gray-950 rounded-[3rem] mx-4 text-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-16">
            {t('why.pre')} <span className="text-red-500">VoxDub</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ icon: Mic, k: 'why.f1' }, { icon: Headphones, k: 'why.f2' }, { icon: FileCheck, k: 'why.f3' }].map(({ icon: Icon, k }) => (
              <div key={k} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6"><Icon size={32} className="text-red-500" /></div>
                <h3 className="text-2xl font-black mb-3">{t(`${k}.title`)}</h3>
                <p className="text-gray-400 font-bold leading-relaxed">{t(`${k}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artists */}
      <section id="artists" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('artists.title')}</h2>
            <p className="text-gray-500 font-bold text-lg">{t('artists.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-10 justify-center">
            <div className="relative">
              <Search size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
              <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setVisibleCount(6); }}
                placeholder={t('artists.search')}
                className={`${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-3 rounded-2xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition w-64`} />
            </div>
            <div className="flex gap-2">
              {(['all', 'male', 'female'] as const).map(g => (
                <button key={g} onClick={() => { setGenderFilter(g); setVisibleCount(6); }}
                  className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all ${genderFilter === g ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}>
                  {t(`artists.filter${g === 'all' ? 'All' : g === 'male' ? 'Male' : 'Female'}`)}
                </button>
              ))}
            </div>
          </div>
          {loadingArtists ? (
            <div className="text-center py-20 text-gray-400 font-bold">{lang === 'ar' ? 'جاري تحميل المعلقين...' : 'Loading artists...'}</div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold">{t('artists.noResults')}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleArtists.map(artist => {
                  const hasAudio = !!getAudioUrl(artist);
                  const isPlaying = playingId === artist.id;
                  const isMine = loggedInArtistDocId === artist.id;
                  const pct = audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0;
                  return (
                    <div key={artist.id} className={`rounded-3xl p-8 text-white hover:-translate-y-2 transition-transform duration-300 relative ${isMine ? 'bg-red-700 ring-4 ring-red-400' : 'bg-gray-900'}`}>
                      {isMine && <div className={`absolute -top-3 ${isRTL ? '-right-3' : '-left-3'} bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-white shadow-lg`}>{lang === 'ar' ? 'ملفك ✨' : 'Your Profile ✨'}</div>}
                      <div className="flex justify-between items-start mb-6">
                        <Award size={22} className={`${isMine ? 'text-yellow-300' : 'text-red-400'} opacity-60 flex-shrink-0`} />
                        <div className={`flex-1 ${isRTL ? 'mr-3 text-right' : 'ml-3 text-left'}`}>
                          <button onClick={() => toggleAudio(artist)} disabled={!hasAudio} className={`w-full group ${hasAudio ? 'cursor-pointer' : 'cursor-default'}`}>
                            <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-start'} gap-2`}>
                              {hasAudio && (
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-red-600' : 'bg-white/10 group-hover:bg-red-600'}`}>
                                  {isPlaying ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white fill-white" />}
                                </span>
                              )}
                              <h3 className={`text-2xl font-black ${isPlaying ? 'text-red-400' : 'text-white'}`}>{artist.name}</h3>
                            </div>
                          </button>
                          {isPlaying && (
                            <div className="mt-3">
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1 font-bold">
                                <span>{formatTime(audioProgress)}</span>
                                {audioDuration > 0 && <span>{formatTime(audioDuration)}</span>}
                              </div>
                            </div>
                          )}
                          {!isPlaying && hasAudio && <p className="text-xs text-gray-500 mt-1 font-bold">{t('artists.listen')}</p>}
                          {artist.rating && (
                            <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-start'} gap-1 mt-2`}>
                              {[1,2,3,4,5].map(s => <Star key={s} size={13} className={s <= Math.round(artist.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />)}
                              <span className="font-black text-sm mx-1">{artist.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl mb-6 border border-white/10">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                          {(artist.profilePicture || artist.image)
                            ? <img src={artist.profilePicture || artist.image} alt={artist.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-400">{artist.name?.[0]}</div>}
                        </div>
                        <div className={`text-sm font-bold text-gray-300 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {artist.voiceType && <p>{t('artists.voiceType')}: <span className="text-white">{Array.isArray(artist.voiceType) ? artist.voiceType.join(' · ') : artist.voiceType}</span></p>}
                          {artist.experience && <p>{t('artists.experience')}: <span className="text-white">{artist.experience}</span></p>}
                        </div>
                      </div>
                      <Link href={`/artists/${artist.id}`}
                        className={`w-full py-3 rounded-2xl font-bold text-center block transition-all text-sm ${isMine ? 'bg-white text-red-700 hover:bg-red-50' : 'border border-white/20 text-gray-300 hover:bg-white hover:text-gray-900'}`}>
                        {t('artists.profile')}
                      </Link>
                    </div>
                  );
                })}
              </div>
              {visibleCount < filteredArtists.length && (
                <div className="text-center mt-10">
                  <button onClick={() => setVisibleCount(v => v + 6)}
                    className="bg-gray-900 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-600 transition-all">
                    {t('artists.loadMore')} ({filteredArtists.length - visibleCount})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-gray-900 mb-16">{t('how.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[{ icon: Search, k: 'how.s1' }, { icon: MessageSquare, k: 'how.s2' }, { icon: Headphones, k: 'how.s3' }, { icon: FileCheck, k: 'how.s4' }].map(({ icon: Icon, k }, i) => (
              <div key={k} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform"><Icon className="text-white" size={24} /></div>
                <h3 className="text-lg font-black mb-2 text-gray-900">{i + 1}. {t(`${k}.title`)}</h3>
                <p className="text-gray-500 font-bold text-sm">{t(`${k}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />

      {/* Partners */}
      {partners.length > 0 && (
        <section id="partners" className="py-20 bg-gray-50 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4"><Building2 size={28} className="text-red-600" /><h2 className="text-4xl font-black text-gray-900">{t('partners.title')}</h2></div>
          </div>
          <div className="relative">
            <div className="flex animate-marquee gap-8 w-max">
              {[...partners, ...partners].map((p, i) => (
                <div key={i} className="flex-shrink-0 bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100 flex flex-col items-center gap-3 min-w-[180px]">
                  {p.logo ? <img src={p.logo} alt={p.name} className="w-16 h-16 object-contain rounded-xl" /> : <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center"><Building2 size={28} className="text-red-400" /></div>}
                  <p className="font-black text-gray-800 text-sm text-center">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-16">{t('pricing.title')}</h2>
          {packages.length === 0
            ? <p className="text-gray-400 font-bold py-12">{lang === 'ar' ? 'جاري تحميل الباقات...' : 'Loading packages...'}</p>
            : (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                {((): typeof packages => {
                  const popular = packages.find(p => p.popular);
                  const others = packages.filter(p => !p.popular);
                  return popular && others.length >= 2 ? [others[0], popular, ...others.slice(1)] : packages;
                })().map(plan => {
                  const planName = lang === 'en' ? (plan.nameEn || plan.name) : plan.name;
                  const planDesc = lang === 'en' ? (plan.descEn || plan.desc) : plan.desc;
                  const planFeatures = lang === 'en' && plan.featuresEn?.length ? plan.featuresEn : plan.features;
                  return (
                    <div key={plan.id} className={`p-8 rounded-3xl border-2 bg-white transition-all relative ${plan.popular ? 'border-red-600 shadow-2xl scale-105' : 'border-gray-100'}`}>
                      {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full font-black text-sm">{t('pricing.popular')}</div>}
                      <h3 className="text-xl font-black text-gray-900 mb-1">{planName}</h3>
                      <p className="text-gray-400 font-bold text-sm mb-6">{planDesc}</p>
                      <div className="mb-8"><span className="text-4xl font-black text-red-600">{plan.price}</span><span className="text-gray-400 font-bold text-xs mx-2">{t('pricing.unit')}</span></div>
                      <ul className="space-y-3 mb-8">{planFeatures?.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm font-bold text-gray-600"><CheckCircle2 size={16} className="text-red-600 flex-shrink-0" />{f}</li>)}</ul>
                      <Link href={mounted && userRole !== 'visitor' ? '/client-dashboard' : '/register'}
                        className={`w-full py-3 rounded-2xl block text-center font-black transition-all ${plan.popular ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                        {t('pricing.cta')}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-gray-500 font-bold">{t('contact.subtitle')}</p>
          </div>
          {contactSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-emerald-700 font-black text-lg">{t('contact.success')}</p>
              <button onClick={() => setContactSent(false)} className="mt-6 text-emerald-600 font-bold underline">{lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}</button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 space-y-5">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">{t('contact.name')} *</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">{t('contact.email')} *</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">{t('contact.message')} *</label>
                <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-red-400 transition resize-none" />
              </div>
              <button type="submit" disabled={contactLoading}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-base hover:bg-red-700 disabled:opacity-50 transition">
                {contactLoading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('contact.send')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900 mx-4 rounded-3xl text-center text-white mb-8">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-6">{t('cta.title')}</h2>
          <p className="text-gray-400 font-bold mb-10 text-lg">{t('cta.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {mounted && userRole !== 'visitor'
              ? <Link href={userRole === 'client' ? '/client-dashboard' : '/dashboard'} className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-700 transition-all">{t('cta.dashboard')}</Link>
              : <><Link href="/register" className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-red-700 transition-all">{t('cta.btn1')}</Link>
                  <Link href="/login" className="bg-white text-gray-900 px-10 py-4 rounded-full font-black text-lg hover:bg-gray-100 transition-all">{t('cta.btn2')}</Link></>
            }
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16 text-center rounded-t-3xl">
        <div className="text-3xl font-black mb-4">Vox<span className="text-red-500">Dub</span></div>
        <p className="text-gray-500 font-bold text-sm">{t('footer.rights')}</p>
        <div className="flex justify-center gap-8 mt-8 flex-wrap">
          <a href="#artists" className="text-gray-400 hover:text-white font-bold text-sm transition">{t('nav.artists')}</a>
          <a href="#services" className="text-gray-400 hover:text-white font-bold text-sm transition">{t('nav.services')}</a>
          <a href="#contact" className="text-gray-400 hover:text-white font-bold text-sm transition">{t('contact.title')}</a>
          <Link href="/about" className="text-gray-400 hover:text-white font-bold text-sm transition">{t('nav.about')}</Link>
          {mounted && userRole !== 'visitor'
            ? <Link href={userRole === 'client' ? '/client-dashboard' : '/dashboard'} className="text-gray-400 hover:text-white font-bold text-sm transition">{t('nav.dashboard')}</Link>
            : <><Link href="/login" className="text-gray-400 hover:text-white font-bold text-sm transition">{t('nav.login')}</Link>
                <Link href="/register" className="text-gray-400 hover:text-white font-bold text-sm transition">{t('nav.register')}</Link></>
          }
        </div>
      </footer>
    </div>
  );
}
