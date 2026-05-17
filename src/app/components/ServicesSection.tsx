'use client'
import { useLang } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'

export default function ServicesSection() {
  const { t } = useLang()
  const { settings } = useSettings()
  const color = settings.primaryColor || '#dc2626'

  const services = [
    { titleKey: 'services.rental.title', descKey: 'services.rental.desc', features: ['services.rental.f1','services.rental.f2','services.rental.f3','services.rental.f4'], emoji: '🎙️' },
    { titleKey: 'services.studio.title', descKey: 'services.studio.desc', features: ['services.studio.f1','services.studio.f2','services.studio.f3','services.studio.f4'], emoji: '🏢' },
  ]

  return (
    <section style={{ padding: '80px 24px', background: '#f8fafc' }} id="services">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111827', marginBottom: 12 }}>{t('services.title')}</h2>
          <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>{t('services.subtitle')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {services.map((svc, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${color}20` }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>{svc.emoji}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{t(svc.titleKey)}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: 24, fontSize: 15 }}>{t(svc.descKey)}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                {svc.features.map((fk, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#374151', fontSize: 15 }}>
                    <span style={{ color: color, fontSize: 18 }}>✓</span> {t(fk)}
                  </li>
                ))}
              </ul>
              <a href="/register" style={{ display: 'inline-block', padding: '12px 28px', background: color, color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>
                {t('services.cta')}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
