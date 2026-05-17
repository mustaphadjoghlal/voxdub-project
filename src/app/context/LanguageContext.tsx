'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'ar' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    /* nav */
    'nav.home': 'الرئيسية', 'nav.artists': 'المعلقون', 'nav.services': 'الخدمات',
    'nav.pricing': 'الباقات', 'nav.about': 'من نحن', 'nav.login': 'دخول',
    'nav.register': 'انضم إلينا', 'nav.dashboard': 'لوحة التحكم', 'nav.logout': 'خروج',
    'nav.myAccount': 'حسابي', 'nav.profile': 'ملفي الشخصي',
    /* hero */
    'hero.badge': '🎙️ منصة المعلقين الصوتيين الأولى في الجزائر',
    'hero.title': 'اجعل لمشروعك\nصوتاً لا يُنسى',
    'hero.subtitle': 'نخبة من المعلقين الصوتيين المحترفين بجودة استوديو عالمية.',
    'hero.cta1': 'اكتشف المعلقين',
    'hero.cta2': 'انضم إلينا',
    'hero.stat1': '+50', 'hero.stat1.label': 'معلق محترف',
    'hero.stat2': '+500', 'hero.stat2.label': 'مشروع منجز',
    'hero.stat3': '100%', 'hero.stat3.label': 'رضا العملاء',
    /* why */
    'why.title': 'لماذا VoxDub؟',
    'why.f1.title': 'أصوات متنوعة', 'why.f1.desc': 'أكثر من 50 معلق صوتي محترف',
    'why.f2.title': 'جودة عالية', 'why.f2.desc': 'تسجيلات بجودة استوديو احترافية',
    'why.f3.title': 'خدمات شاملة', 'why.f3.desc': 'باقات متكاملة تشمل الكتابة والتدقيق',
    /* artists */
    'artists.title': 'معلقونا الصوتيون',
    'artists.subtitle': 'اضغط على اسم المعلق لسماع عينته الصوتية',
    'artists.search': 'ابحث عن معلق...',
    'artists.filterAll': 'الكل', 'artists.filterMale': 'ذكر', 'artists.filterFemale': 'أنثى',
    'artists.noResults': 'لا توجد نتائج', 'artists.loadMore': 'عرض المزيد',
    'artists.profile': 'الملف الشخصي', 'artists.listen': 'اضغط للاستماع',
    'artists.voiceType': 'النوع', 'artists.experience': 'الخبرة',
    /* how */
    'how.title': 'كيف نعمل؟',
    'how.s1.title': 'اكتشف', 'how.s1.desc': 'اختر الصوت المناسب',
    'how.s2.title': 'تواصل', 'how.s2.desc': 'أرسل تفاصيل مشروعك',
    'how.s3.title': 'تنفيذ', 'how.s3.desc': 'نسجل بأحدث التقنيات',
    'how.s4.title': 'استلام', 'how.s4.desc': 'استلم ملفك باحترافية',
    /* services */
    'services.title': 'خدماتنا للمعلقين', 'services.subtitle': 'نوفر كل ما يحتاجه المعلق الصوتي الاحترافي',
    'services.rental.title': 'استئجار معدات التعليق الصوتي',
    'services.rental.desc': 'احصل على أفضل المعدات الصوتية الاحترافية بأسعار تنافسية.',
    'services.rental.f1': 'ميكروفونات احترافية', 'services.rental.f2': 'مرشحات وإكسسوارات التسجيل',
    'services.rental.f3': 'أسعار يومية وأسبوعية وشهرية', 'services.rental.f4': 'توصيل مجاني داخل المدينة',
    'services.studio.title': 'التسجيل في الاستوديو',
    'services.studio.desc': 'استوديوهات مجهزة بأحدث التقنيات لتسجيل صوتي احترافي في بيئة مُعزولة صوتياً.',
    'services.studio.f1': 'غرف عازلة للصوت', 'services.studio.f2': 'مهندس صوت متخصص',
    'services.studio.f3': 'حجز بالساعة أو اليوم', 'services.studio.f4': 'مراجعة وتحرير فوري',
    'services.cta': 'احجز الآن',
    /* partners */
    'partners.title': 'شركاؤنا',
    /* pricing */
    'pricing.title': 'باقاتنا', 'pricing.popular': 'الأكثر طلباً',
    'pricing.unit': 'دينار', 'pricing.cta': 'ابدأ الآن',
    /* contact */
    'contact.title': 'تواصل معنا', 'contact.subtitle': 'نحن هنا للإجابة على جميع استفساراتك',
    'contact.name': 'الاسم الكامل', 'contact.email': 'البريد الإلكتروني',
    'contact.message': 'رسالتك', 'contact.send': 'إرسال الرسالة',
    'contact.success': 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.',
    /* cta */
    'cta.title': 'هل أنت مستعد؟',
    'cta.subtitle': 'انضم إلى VoxDub اليوم',
    'cta.btn1': 'انضم إلينا', 'cta.btn2': 'تسجيل الدخول',
    'cta.dashboard': 'اذهب إلى لوحة التحكم',
    /* footer */
    'footer.rights': 'إدارة وتأسيس: لميس حميمي © 2026 — جميع الحقوق محفوظة',
  },
  en: {
    /* nav */
    'nav.home': 'Home', 'nav.artists': 'Artists', 'nav.services': 'Services',
    'nav.pricing': 'Pricing', 'nav.about': 'About Us', 'nav.login': 'Login',
    'nav.register': 'Join Us', 'nav.dashboard': 'Dashboard', 'nav.logout': 'Logout',
    'nav.myAccount': 'My Account', 'nav.profile': 'My Profile',
    /* hero */
    'hero.badge': '🎙️ Algeria\'s #1 Voice Artist Platform',
    'hero.title': 'Give Your Project\nan Unforgettable Voice',
    'hero.subtitle': 'A curated selection of professional voice artists with world-class studio quality.',
    'hero.cta1': 'Discover Artists',
    'hero.cta2': 'Join Us',
    'hero.stat1': '50+', 'hero.stat1.label': 'Pro Artists',
    'hero.stat2': '500+', 'hero.stat2.label': 'Projects Done',
    'hero.stat3': '100%', 'hero.stat3.label': 'Client Satisfaction',
    /* why */
    'why.title': 'Why VoxDub?',
    'why.f1.title': 'Diverse Voices', 'why.f1.desc': 'Over 50 professional voice artists',
    'why.f2.title': 'Studio Quality', 'why.f2.desc': 'Professional-grade recordings',
    'why.f3.title': 'Full Service', 'why.f3.desc': 'Packages that include writing & editing',
    /* artists */
    'artists.title': 'Our Voice Artists',
    'artists.subtitle': 'Click an artist\'s name to hear their voice sample',
    'artists.search': 'Search for an artist...',
    'artists.filterAll': 'All', 'artists.filterMale': 'Male', 'artists.filterFemale': 'Female',
    'artists.noResults': 'No results found', 'artists.loadMore': 'Load More',
    'artists.profile': 'View Profile', 'artists.listen': 'Click to listen',
    'artists.voiceType': 'Type', 'artists.experience': 'Experience',
    /* how */
    'how.title': 'How We Work',
    'how.s1.title': 'Discover', 'how.s1.desc': 'Choose the right voice',
    'how.s2.title': 'Connect', 'how.s2.desc': 'Send your project details',
    'how.s3.title': 'Record', 'how.s3.desc': 'We record with latest tech',
    'how.s4.title': 'Deliver', 'how.s4.desc': 'Receive your file professionally',
    /* services */
    'services.title': 'Our Services', 'services.subtitle': 'Everything a professional voice artist needs',
    'services.rental.title': 'Voice-Over Equipment Rental',
    'services.rental.desc': 'Access professional audio equipment at competitive prices.',
    'services.rental.f1': 'Professional microphones', 'services.rental.f2': 'Filters & recording accessories',
    'services.rental.f3': 'Daily, weekly & monthly rates', 'services.rental.f4': 'Free delivery within the city',
    'services.studio.title': 'Studio Recording',
    'services.studio.desc': 'Studios equipped with the latest technology for professional recording in a soundproof environment.',
    'services.studio.f1': 'Soundproof recording rooms', 'services.studio.f2': 'Dedicated sound engineer',
    'services.studio.f3': 'Hourly or daily booking', 'services.studio.f4': 'Instant review & editing',
    'services.cta': 'Book Now',
    /* partners */
    'partners.title': 'Our Partners',
    /* pricing */
    'pricing.title': 'Our Packages', 'pricing.popular': 'Most Popular',
    'pricing.unit': 'DA', 'pricing.cta': 'Get Started',
    /* contact */
    'contact.title': 'Contact Us', 'contact.subtitle': 'We are here to answer all your questions',
    'contact.name': 'Full Name', 'contact.email': 'Email Address',
    'contact.message': 'Your Message', 'contact.send': 'Send Message',
    'contact.success': 'Your message was sent successfully! We will contact you soon.',
    /* cta */
    'cta.title': 'Are You Ready?',
    'cta.subtitle': 'Join VoxDub Today',
    'cta.btn1': 'Join Us', 'cta.btn2': 'Login',
    'cta.dashboard': 'Go to Dashboard',
    /* footer */
    'footer.rights': 'Founded by Lamis Hamimi © 2026 — All rights reserved',
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
