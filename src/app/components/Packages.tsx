import { Check } from 'lucide-react';

export function Packages() {
  const packages = [
    { 
      name: "باقة التعليق الصوتي", 
      price: "15,000", 
      featured: false,
      isGold: false,
      description: "مثالية للمشاريع القصيرة والإعلانات السريعة",
      features: ["تسجيل صوتي احترافي (Raw)", "معدات تسجيل عالمية", "تعديل هندسي بسيط", "تسليم خلال 48 ساعة", "مراجعة مجانية واحدة"]
    },
    { 
      name: "باقة التعليق والتدقيق", 
      price: "25,000", 
      featured: true, 
      isGold: true,
      description: "الباقة الأكثر طلباً للمحتوى الوثائقي والتعليمي",
      features: ["كل مميزات الباقة الأساسية", "تدقيق لغوي وتشكيل كامل", "تصحيح الأخطاء النحوية", "تحسين الصياغة", "هندسة صوتية متقدمة (Mixing)"]
    },
    { 
      name: "باقة كاملة المحتوى", 
      price: "40,000", 
      featured: false,
      isGold: false,
      description: "حل متكامل من الفكرة وحتى النشر النهائي",
      features: ["كل مميزات الباقتين السابقتين", "كتابة النص من الصفر", "بحث وتطوير المحتوى", "كتابة إبداعية", "حقوق استخدام تجاري كاملة"]
    },
  ];

  return (
    <section className="py-24 bg-stone-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-stone-900 mb-4">باقاتنا المتنوعة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg) => (
            <div key={pkg.name} className={`bg-white p-8 rounded-[32px] transition-all duration-500 border-2 shadow-xl ${
              pkg.isGold 
              ? 'border-[#D4AF37] scale-105 relative z-10 shadow-[#D4AF37]/10'
              : 'border-vox-primary'
            }`}>
              
              {pkg.isGold && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white px-6 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase">
                  الباقة الماسية
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2 text-stone-800">{pkg.name}</h3>
              <p className="text-xs text-stone-400 mb-6 font-light">{pkg.description}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-black ${pkg.isGold ? 'text-[#D4AF37]' : 'text-vox-primary'}`}>
                  {pkg.price}
                </span>
                <span className="text-stone-500 text-sm">دينار جزائري</span>
              </div>
              
              <div className="h-px w-full bg-stone-100 mb-8"></div>

              <ul className="space-y-4 mb-10 text-right">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-[13px] text-stone-600 font-medium">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${pkg.isGold ? 'bg-amber-50' : 'bg-vox-light'}`}>
                      <Check className={`h-3 w-3 ${pkg.isGold ? 'text-[#D4AF37]' : 'text-vox-primary'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                pkg.isGold 
                ? 'bg-[#D4AF37] text-white border-[#D4AF37] hover:bg-[#B8860B] shadow-lg shadow-[#D4AF37]/20' 
                : 'bg-vox-primary text-white border-vox-primary hover:bg-stone-900 shadow-lg shadow-vox-primary/20'
              }`}>
                اختر هذه الباقة
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
