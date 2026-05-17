'use client'
import { useLang } from '../context/LanguageContext'

export default function LanguageToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--primary-color, #dc2626)', background: 'white', color: 'var(--primary-color, #dc2626)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s', ...style }}
    >
      {lang === 'ar' ? 'EN' : 'عربي'}
    </button>
  )
}
