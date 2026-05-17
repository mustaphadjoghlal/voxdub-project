'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../components/firebase'
import Link from 'next/link'

const DEFAULT_AR = `VoxDub هي منصة الجزائر الأولى للتعليق الصوتي الاحترافي.

نجمع بين نخبة من المعلقين الصوتيين المحترفين وأصحاب المشاريع، لنوفر تجربة سلسة وعالية الجودة في عالم التعليق الصوتي.

نؤمن بأن الصوت هو روح كل مشروع — سواء كان إعلاناً تجارياً، وثائقياً، كتاباً صوتياً، أو محتوى رقمياً.

رؤيتنا أن يكون لكل مشروع جزائري صوت لا يُنسى.`

const DEFAULT_EN = `VoxDub is Algeria's first professional voice-over platform.

We connect elite voice artists with project owners, delivering a seamless, high-quality voice-over experience.

We believe that voice is the soul of every project — whether it's a commercial, documentary, audiobook, or digital content.

Our vision: every Algerian project deserves an unforgettable voice.`

export default function AboutPage() {
  const [contentAr, setContentAr] = useState(DEFAULT_AR)
  const [contentEn, setContentEn] = useState(DEFAULT_EN)
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#dc2626')
  const [aboutImages, setAboutImages] = useState<string[]>([])

  useEffect(() => {
    const savedLang = (localStorage.getItem('voxdub-lang') || 'ar') as 'ar' | 'en'
    setLang(savedLang)
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = savedLang
    getDoc(doc(db, 'settings', 'main')).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        if (d.aboutUsAr) setContentAr(d.aboutUsAr)
        if (d.aboutUsEn) setContentEn(d.aboutUsEn)
        if (d.logoUrl) setLogoUrl(d.logoUrl)
        if (d.primaryColor) { setPrimaryColor(d.primaryColor); document.documentElement.style.setProperty('--primary-color', d.primaryColor) }
        if (Array.isArray(d.aboutImages)) setAboutImages(d.aboutImages)
      }
    }).catch(() => {})
  }, [])

  const isRTL = lang === 'ar'
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Cairo', sans-serif" }} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>
      <nav style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            {logoUrl ? <img src={logoUrl} alt="Logo" style={{ height: 40, objectFit: 'contain' }} /> : <span style={{ fontWeight: 900, fontSize: 22, color: primaryColor }}>VoxDub</span>}
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={() => { const n = lang === 'ar' ? 'en' : 'ar'; setLang(n); localStorage.setItem('voxdub-lang', n); document.documentElement.dir = n === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = n; }}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${primaryColor}`, background: 'white', color: primaryColor, cursor: 'pointer', fontWeight: 600 }}>
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <Link href="/" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 600 }}>{isRTL ? '← العودة' : '← Back'}</Link>
          </div>
        </div>
      </nav>

      <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #1f2937 100%)`, color: 'white', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16 }}>{isRTL ? 'من نحن' : 'About Us'}</h1>
        <p style={{ fontSize: 18, opacity: 0.85 }}>{isRTL ? 'تعرف على منصة VoxDub وقصتنا' : 'Learn about VoxDub and our story'}</p>
      </div>

      <div style={{ maxWidth: 860, margin: '60px auto', padding: '0 24px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 48, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 2, fontSize: 17, color: '#374151' }}>
            {lang === 'ar' ? contentAr : contentEn}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {aboutImages[i]
                ? <img src={aboutImages[i]} alt={`about-${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ color: '#d1d5db', fontSize: 48, lineHeight: 1 }}>&#128444;</div>
              }
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: '#111827', color: '#9ca3af', padding: '32px 24px', textAlign: 'center', marginTop: 80 }}>
        <p>{isRTL ? '© 2026 VoxDub. جميع الحقوق محفوظة.' : '© 2026 VoxDub. All rights reserved.'}</p>
      </footer>
    </div>
  )
}
