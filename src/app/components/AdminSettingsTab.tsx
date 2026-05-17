'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { Upload, Save, Palette, Image as ImageIcon, FileText, Check } from 'lucide-react'

interface SiteSettings {
  primaryColor: string
  logoUrl: string
  aboutUsAr: string
  aboutUsEn: string
  heroTitleAr: string
  heroTitleEn: string
  heroSubtitleAr: string
  heroSubtitleEn: string
}

const DEFAULT: SiteSettings = {
  primaryColor: '#dc2626',
  logoUrl: '',
  aboutUsAr: 'VoxDub هي منصة احترافية تجمع بين أفضل المعلقين الصوتيين في العالم العربي والعملاء الباحثين عن جودة صوتية عالية.',
  aboutUsEn: 'VoxDub is a professional platform connecting the best voice-over artists in the Arab world with clients seeking high-quality audio.',
  heroTitleAr: 'منصة المعلقين الصوتيين الاحترافية',
  heroTitleEn: 'Professional Voice-Over Platform',
  heroSubtitleAr: 'اكتشف أفضل المعلقين الصوتيين في العالم العربي',
  heroSubtitleEn: 'Discover the best voice-over artists in the Arab world',
}

const PRESET_COLORS = [
  { name: 'أحمر', value: '#dc2626' },
  { name: 'أزرق', value: '#2563eb' },
  { name: 'أخضر', value: '#16a34a' },
  { name: 'بنفسجي', value: '#7c3aed' },
  { name: 'برتقالي', value: '#ea580c' },
  { name: 'وردي', value: '#db2777' },
  { name: 'سماوي', value: '#0891b2' },
  { name: 'ذهبي', value: '#d97706' },
]

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'main'))
        if (snap.exists()) {
          const data = { ...DEFAULT, ...snap.data() } as SiteSettings
          setSettings(data)
          if (data.primaryColor) document.documentElement.style.setProperty('--primary-color', data.primaryColor)
          if (data.logoUrl) setLogoPreview(data.logoUrl)
        }
      } catch {}
    }
    fetch()
  }, [])

  const saveSettings = async (updates: Partial<SiteSettings> = {}) => {
    setSaving(true)
    try {
      const merged = { ...settings, ...updates }
      await setDoc(doc(db, 'settings', 'main'), merged, { merge: true })
      setSettings(merged)
      if (merged.primaryColor) document.documentElement.style.setProperty('--primary-color', merged.primaryColor)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { alert('فشل الحفظ') } finally { setSaving(false) }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `site/logo_${Date.now()}`)
      await uploadBytes(storageRef, logoFile)
      const url = await getDownloadURL(storageRef)
      setLogoPreview(url)
      await saveSettings({ logoUrl: url })
    } catch { alert('فشل رفع الشعار') } finally { setUploading(false) }
  }

  const applyColor = (color: string) => {
    setSettings(s => ({ ...s, primaryColor: color }))
    document.documentElement.style.setProperty('--primary-color', color)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl mb-1">إعدادات الموقع</h2>
          <p className="text-gray-400 font-bold text-sm">تحكم في مظهر الموقع ومحتواه للزوار</p>
        </div>
        <button
          onClick={() => saveSettings()}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-red-700 disabled:opacity-50 transition"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'تم الحفظ ✓' : saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Color Theme */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
            <Palette size={16} className="text-red-400" />
          </div>
          <h3 className="text-white font-black">لون الموقع الرئيسي</h3>
        </div>
        <div className="flex flex-wrap gap-3 mb-5">
          {PRESET_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => applyColor(c.value)}
              title={c.name}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="w-10 h-10 rounded-xl border-2 transition-all group-hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  borderColor: settings.primaryColor === c.value ? 'white' : 'transparent',
                  boxShadow: settings.primaryColor === c.value ? `0 0 0 3px ${c.value}60` : 'none',
                }}
              />
              <span className="text-gray-400 text-xs font-bold">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-gray-400 font-bold text-sm">لون مخصص:</label>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={e => applyColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
          />
          <span className="text-gray-300 font-mono text-sm">{settings.primaryColor}</span>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: `${settings.primaryColor}15`, border: `1px solid ${settings.primaryColor}30` }}>
          <p className="font-black text-sm" style={{ color: settings.primaryColor }}>معاينة اللون على العنوان</p>
          <div className="flex items-center gap-3 mt-2">
            <button className="px-4 py-2 rounded-lg text-white text-sm font-black" style={{ backgroundColor: settings.primaryColor }}>زر رئيسي</button>
            <span className="text-sm font-bold" style={{ color: settings.primaryColor }}>رابط ملون</span>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <ImageIcon size={16} className="text-blue-400" />
          </div>
          <h3 className="text-white font-black">شعار الموقع</h3>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-32 h-24 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
            {logoPreview
              ? <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
              : <span className="text-gray-600 font-bold text-xs text-center px-2">لا يوجد شعار</span>
            }
          </div>
          <div className="flex-1 min-w-48 space-y-3">
            <div
              className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-blue-500/50 cursor-pointer transition"
              onClick={() => logoInputRef.current?.click()}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
                }}
              />
              <ImageIcon size={20} className="text-gray-500 mx-auto mb-1" />
              <p className="text-gray-400 font-bold text-sm">{logoFile ? logoFile.name : 'اختر صورة الشعار (PNG/SVG)'}</p>
            </div>
            <button
              onClick={handleLogoUpload}
              disabled={!logoFile || uploading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-blue-700 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              <Upload size={15} />
              {uploading ? 'جاري الرفع...' : 'رفع الشعار'}
            </button>
          </div>
        </div>
      </div>

      {/* About Us Content */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-white font-black">محتوى صفحة "من نحن"</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 font-black text-sm mb-2 block">النص العربي</label>
            <textarea
              value={settings.aboutUsAr}
              onChange={e => setSettings(s => ({ ...s, aboutUsAr: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition resize-none"
              placeholder="اكتب محتوى الصفحة بالعربية..."
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-gray-400 font-black text-sm mb-2 block">English Text</label>
            <textarea
              value={settings.aboutUsEn}
              onChange={e => setSettings(s => ({ ...s, aboutUsEn: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition resize-none"
              placeholder="Write the About Us content in English..."
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Hero Text */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-amber-400" />
          </div>
          <h3 className="text-white font-black">نصوص الصفحة الرئيسية (Hero)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'العنوان الرئيسي (عربي)', key: 'heroTitleAr' as keyof SiteSettings, dir: 'rtl' },
            { label: 'Main Title (English)', key: 'heroTitleEn' as keyof SiteSettings, dir: 'ltr' },
            { label: 'النص الفرعي (عربي)', key: 'heroSubtitleAr' as keyof SiteSettings, dir: 'rtl' },
            { label: 'Subtitle (English)', key: 'heroSubtitleEn' as keyof SiteSettings, dir: 'ltr' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-gray-400 font-black text-xs mb-1.5 block">{f.label}</label>
              <input
                value={settings[f.key] as string}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm outline-none focus:border-red-500 transition"
                dir={f.dir}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save button at bottom */}
      <button
        onClick={() => saveSettings()}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-black text-base hover:bg-red-700 disabled:opacity-50 transition"
      >
        {saved ? <Check size={18} /> : <Save size={18} />}
        {saved ? 'تم حفظ الإعدادات بنجاح ✓' : saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
      </button>
    </div>
  )
}
