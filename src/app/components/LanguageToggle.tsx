'use client'
import { useLang } from '../context/LanguageContext'

export default function LanguageToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      style={{
        padding: '6px 16px',
        borderRadius: 8,
        border: '1px solid var(--primary-color, #dc2626)',
        background: 'white',
        color: 'var(--primary-color, #dc2626)',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 14,
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-color, #dc2626)'
        ;(e.currentTarget as HTMLButtonElement).style.color = 'white'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'white'
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-color, #dc2626)'
      }}
    >
      {lang === 'ar' ? 'EN' : 'عربي'}
    </button>
  )
}
