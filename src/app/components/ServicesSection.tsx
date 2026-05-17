'use client'
import { useLang } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'

export default function ServicesSection() {
  const { t } = useLang()
  const { settings } = useSettings()
  const color = settings.primaryColor || '#dc2626'

  const services = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill={`${color}15`}/>
          <path d="M24 14C24 14 16 18 16 26C16 30.4 19.6 34 24 34C28.4 34 32 30.4 32 26C32 18 24 14Z" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="24" cy="26" r="3" fill={color}/>
          <path d="M18 22L14 18M30 22L34 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 34L18 38M28 34L30 38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <rect x="14" y="36" width="8" height="3" rx="1.5" fill={color}/>
          <rect x="26" y="36" width="8" height="3" rx="1.5" fill={color}/>
        </svg>
      ),
      titleKey: 'services.rental.title',
      descKey: 'services.rental.desc',
      features: ['services.rental.f1','services.rental.f2','services.rental.f3','services.rental.f4'],
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill={`${color}15`}/>
          <rect x="18" y="12" width="12" height="18" rx="6" stroke={color} strokeWidth="2" fill="none"/>
          <path d="M14 26C14 32.627 18.477 38 24 38C29.523 38 34 32.627 34 26" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <line x1="24" y1="38" x2="24" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <line x1="18" y1="42" x2="30" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      titleKey: 'services.studio.title',
      descKey: 'services.studio.desc',
      features: ['services.studio.f1','services.studio.f2','services.studio.f3','services.studio.f4'],
    },
  ]

  return (
    <section style={{ padding: '80px 24px', background: '#f8fafc' }} id="services">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111827', marginBottom: 12 }}>{t('services.title')}</h2>
          <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>{t('services.subtitle')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {services.map((svc, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${color}20`, transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 12px 40px ${color}25` }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.07)' }}>
              <div style={{ marginBottom: 20 }}>{svc.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{t(svc.titleKey)}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: 24, fontSize: 15 }}>{t(svc.descKey)}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                {svc.features.map((fk, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#374151', fontSize: 15 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {t(fk)}
                  </li>
                ))}
              </ul>
              <a href="/register" style={{ display: 'inline-block', padding: '12px 28px', background: color, color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                {t('services.cta')}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
