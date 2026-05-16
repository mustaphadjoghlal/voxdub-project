'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'ar' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.artists': 'المعلقون',
    'nav.services': 'الخدمات',
    'nav.pricing': 'الباقات',
    'nav.about': 'من نحن',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.dashboard': 'لوحة التحكم',
    'nav.logout': 'تسجيل الخروج',
    'hero.cta': 'ابدأ الآن',
    'hero.explore': 'استكشف المعلقين',
    'stats.artists': 'معلق صوتي',
    'stats.projects': 'مشروع منجز',
    'stats.satisfaction': 'رضا العملاء',
    'why.title': 'لماذا VoxDub؟',
    'artists.title': 'معلقونا المميزون',
    'artists.listen': 'استمع',
    'artists.book': 'احجز الآن',
    'artists.noSamples': 'لا توجد مقاطع صوتية',
    'services.title': 'خدماتنا للمعلقين',
    'services.subtitle': 'نوفر كل ما يحتاجه المعلق الصوتي الاحترافي',
    'services.rental.title': 'استئجار معدات التعليق الصوتي',
    'services.rental.desc': 'احصل على أفضل المعدات الصوتية الاحترافية بأسعار تنافسية. ميكروفونات عالية الجودة، مرشحات صوتية، ومعدات التسجيل الكاملة.',
    'services.rental.f1': 'ميكروفونات احترافية',
    'services.rental.f2': 'مرشحات وإكسسوارات التسجيل',
    'services.rental.f3': 'أسعار يومية وأسبوعية وشهرية',
    'services.rental.f4': 'توصيل مجاني داخل المدينة',
    'services.studio.title': 'التسجيل في الاستوديو',
    'services.studio.desc': 'استوديوهات مجهزة بأحدث التقنيات لتسجيل صوتي احترافي في بيئة مُعزولة صوتياً تضمن جودة استثنائية.',
    'services.studio.f1': 'غرف عازلة للصوت',
    'services.studio.f2': 'مهندس صوت متخصص',
    'services.studio.f3': 'حجز بالساعة أو اليوم',
    'services.studio.f4': 'مراجعة وتحرير فوري',
    'services.cta': 'احجز الآن',
    'howitworks.title': 'كيف يعمل؟',
    'pricing.title': 'الباقات والأسعار',
    'pricing.popular': 'الأكثر طلباً',
    'pricing.cta': 'اشترك الآن',
    'pricing.sar': 'ر.س',
    'partners.title': 'شركاؤنا',
    'cta.title': 'هل أنت معلق صوتي محترف؟',
    'cta.subtitle': 'انضم إلى منصتنا واعرض مهاراتك لآلاف العملاء',
    'cta.btn': 'انضم الآن',
    'footer.rights': '© 2024 VoxDub. جميع الحقوق محفوظة.',
    'about.title': 'من نحن',
    'about.back': 'العودة للرئيسية',
    'admin.settings': 'إعدادات الموقع',
    'admin.services': 'الخدمات',
  },
  en: {
    'nav.home': 'Home',
    'nav.artists': 'Artists',
    'nav.services': 'Services',
    'nav.pricing': 'Pricing',
    'nav.about': 'About Us',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'hero.cta': 'Get Started',
    'hero.explore': 'Explore Artists',
    'stats.artists': 'Voice Artists',
    'stats.projects': 'Completed Projects',
    'stats.satisfaction': 'Client Satisfaction',
    'why.title': 'Why VoxDub?',
    'artists.title': 'Featured Artists',
    'artists.listen': 'Listen',
    'artists.book': 'Book Now',
    'artists.noSamples': 'No audio samples',
    'services.title': 'Our Services',
    'services.subtitle': 'Everything a professional voice artist needs',
    'services.rental.title': 'Voice-Over Equipment Rental',
    'services.rental.desc': 'Get access to professional audio equipment at competitive prices. High-quality microphones, audio filters, and complete recording gear.',
    'services.rental.f1': 'Professional microphones',
    'services.rental.f2': 'Filters & recording accessories',
    'services.rental.f3': 'Daily, weekly & monthly rates',
    'services.rental.f4': 'Free delivery within the city',
    'services.studio.title': 'Studio Recording',
    'services.studio.desc': 'Studios equipped with the latest technology for professional recording in a soundproof environment that guarantees exceptional quality.',
    'services.studio.f1': 'Soundproof recording rooms',
    'services.studio.f2': 'Dedicated sound engineer',
    'services.studio.f3': 'Hourly or daily booking',
    'services.studio.f4': 'Instant review & editing',
    'services.cta': 'Book Now',
    'howitworks.title': 'How It Works',
    'pricing.title': 'Pricing Plans',
    'pricing.popular': 'Most Popular',
    'pricing.cta': 'Subscribe Now',
    'pricing.sar': 'SAR',
    'partners.title': 'Our Partners',
    'cta.title': 'Are you a professional voice artist?',
    'cta.subtitle': 'Join our platform and showcase your skills to thousands of clients',
    'cta.btn': 'Join Now',
    'footer.rights': '© 2024 VoxDub. All rights reserved.',
    'about.title': 'About Us',
    'about.back': 'Back to Home',
    'admin.settings': 'Site Settings',
    'admin.services': 'Services',
  },
}

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  isRTL: boolean
}>({
  lang: 'ar',
  setLang: () => {},
  t: (k) => k,
  isRTL: true,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('voxdub-lang') as Lang
      if (saved === 'ar' || saved === 'en') {
        setLangState(saved)
        applyLang(saved)
      }
    } catch {}
  }, [])

  const applyLang = (l: Lang) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    }
  }

  const setLang = (l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('voxdub-lang', l) } catch {}
    applyLang(l)
  }

  const t = (key: string) => translations[lang][key] ?? translations['ar'][key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
