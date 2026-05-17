'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'ar' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    'nav.home': 'الرئيسية', 'nav.artists': 'المعلقون', 'nav.services': 'الخدمات',
    'nav.pricing': 'الباقات', 'nav.about': 'من نحن', 'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب', 'nav.dashboard': 'لوحة التحكم', 'nav.logout': 'تسجيل الخروج',
    'artists.search': 'ابحث عن معلق...', 'artists.filterAll': 'الكل',
    'artists.filterMale': 'ذكر', 'artists.filterFemale': 'أنثى',
    'artists.noResults': 'لا توجد نتائج', 'artists.loadMore': 'عرض المزيد',
    'services.title': 'خدماتنا للمعلقين', 'services.subtitle': 'نوفر كل ما يحتاجه المعلق الصوتي الاحترافي',
    'services.rental.title': 'استئجار معدات التعليق الصوتي',
    'services.rental.desc': 'احصل على أفضل المعدات الصوتية الاحترافية بأسعار تنافسية. ميكروفونات عالية الجودة، مرشحات صوتية، ومعدات التسجيل الكاملة.',
    'services.rental.f1': 'ميكروفونات احترافية', 'services.rental.f2': 'مرشحات وإكسسوارات التسجيل',
    'services.rental.f3': 'أسعار يومية وأسبوعية وشهرية', 'services.rental.f4': 'توصيل مجاني داخل المدينة',
    'services.studio.title': 'التسجيل في الاستوديو',
    'services.studio.desc': 'استوديوهات مجهزة بأحدث التقنيات لتسجيل صوتي احترافي في بيئة مُعزولة صوتياً تضمن جودة استثنائية.',
    'services.studio.f1': 'غرف عازلة للصوت', 'services.studio.f2': 'مهندس صوت متخصص',
    'services.studio.f3': 'حجز بالساعة أو اليوم', 'services.studio.f4': 'مراجعة وتحرير فوري',
    'services.cta': 'احجز الآن',
    'pricing.popular': 'الأكثر طلباً',
    'contact.title': 'تواصل معنا', 'contact.name': 'الاسم الكامل',
    'contact.email': 'البريد الإلكتروني', 'contact.message': 'رسالتك',
    'contact.send': 'إرسال الرسالة', 'contact.success': 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.',
  },
  en: {
    'nav.home': 'Home', 'nav.artists': 'Artists', 'nav.services': 'Services',
    'nav.pricing': 'Pricing', 'nav.about': 'About Us', 'nav.login': 'Login',
    'nav.register': 'Sign Up', 'nav.dashboard': 'Dashboard', 'nav.logout': 'Logout',
    'artists.search': 'Search for an artist...', 'artists.filterAll': 'All',
    'artists.filterMale': 'Male', 'artists.filterFemale': 'Female',
    'artists.noResults': 'No results found', 'artists.loadMore': 'Load More',
    'services.title': 'Our Services', 'services.subtitle': 'Everything a professional voice artist needs',
    'services.rental.title': 'Voice-Over Equipment Rental',
    'services.rental.desc': 'Get access to professional audio equipment at competitive prices. High-quality microphones, audio filters, and complete recording gear.',
    'services.rental.f1': 'Professional microphones', 'services.rental.f2': 'Filters & recording accessories',
    'services.rental.f3': 'Daily, weekly & monthly rates', 'services.rental.f4': 'Free delivery within the city',
    'services.studio.title': 'Studio Recording',
    'services.studio.desc': 'Studios equipped with the latest technology for professional recording in a soundproof environment.',
    'services.studio.f1': 'Soundproof recording rooms', 'services.studio.f2': 'Dedicated sound engineer',
    'services.studio.f3': 'Hourly or daily booking', 'services.studio.f4': 'Instant review & editing',
    'services.cta': 'Book Now',
    'pricing.popular': 'Most Popular',
    'contact.title': 'Contact Us', 'contact.name': 'Full Name',
    'contact.email': 'Email Address', 'contact.message': 'Your Message',
    'contact.send': 'Send Message', 'contact.success': 'Your message was sent successfully! We will contact you soon.',
  },
}

const LanguageContext = createContext<{
  lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; isRTL: boolean;
}>({ lang: 'ar', setLang: () => {}, t: (k) => k, isRTL: true })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('voxdub-lang') as Lang
      if (saved === 'ar' || saved === 'en') { setLangState(saved); applyLang(saved) }
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
