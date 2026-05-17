'use client'
import { useLang } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'

export default function ServicesSection() {
  const { t } = useLang()
  const { settings } = useSettings()
  const color = settings.primaryColor || '#dc2626'

  return (
    <section style={{ padding: '80px 24px', background: '#f8fafc' }} id="services">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111827', marginBottom: 12 }}>{t('services.title')}</h2>
          <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>{t('services.subtitle')}</p>
        </div>
        <div style={{
          background: 'white', borderRadius: 24, padding: 48,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `2px solid ${color}30`,
          maxWidth: 600, margin: '0 auto'
        }}>
          <div style={{ fontSize: 56, marginBottom: 20, textAlign: 'center' }}>🏢</div>
          <h3 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 12, textAlign: 'center' }}>{t('services.studio.title')}</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.9, marginBottom: 28, fontSize: 16, textAlign: 'center' }}>{t('services.studio.desc')}</p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 36 }}>
            {['services.studio.f1','services.studio.f2','services.studio.f3','services.studio.f4'].map((fk, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, color: '#374151', fontSize: 15 }}>
                <span style={{ color: color, fontSize: 20, fontWeight: 900 }}>✓</span> {t(fk)}
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'center' }}>
            <a href="/register" style={{
              display: 'inline-block', padding: '14px 40px',
              background: color, color: 'white', borderRadius: 14,
              textDecoration: 'none', fontWeight: 800, fontSize: 17
            }}>
              {t('services.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
