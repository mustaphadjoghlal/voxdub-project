'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../components/firebase'

export interface SiteSettings {
  primaryColor: string
  logoUrl: string
  aboutUsAr: string
  aboutUsEn: string
  heroTitleAr: string
  heroTitleEn: string
  heroSubtitleAr: string
  heroSubtitleEn: string
}

const defaultSettings: SiteSettings = {
  primaryColor: '#dc2626',
  logoUrl: '',
  aboutUsAr: 'VoxDub هي منصة احترافية تجمع بين أفضل المعلقين الصوتيين في العالم العربي والعملاء الباحثين عن جودة صوتية عالية. نحن نؤمن بأن الصوت هو روح المحتوى، ونسعى دائماً لتقديم أفضل التجارب الصوتية.',
  aboutUsEn: 'VoxDub is a professional platform connecting the best voice-over artists in the Arab world with clients seeking high-quality audio. We believe that voice is the soul of content, and we always strive to deliver the best audio experiences.',
  heroTitleAr: 'منصة المعلقين الصوتيين الاحترافية',
  heroTitleEn: 'Professional Voice-Over Platform',
  heroSubtitleAr: 'اكتشف أفضل المعلقين الصوتيين في العالم العربي',
  heroSubtitleEn: 'Discover the best voice-over artists in the Arab world',
}

const SettingsContext = createContext<{
  settings: SiteSettings
  updateSettings: (updates: Partial<SiteSettings>) => Promise<void>
  uploadLogo: (file: File) => Promise<string>
  loading: boolean
}>({
  settings: defaultSettings,
  updateSettings: async () => {},
  uploadLogo: async () => '',
  loading: true,
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'main'))
        if (snap.exists()) {
          const data = snap.data() as SiteSettings
          const merged = { ...defaultSettings, ...data }
          setSettings(merged)
          applyTheme(merged.primaryColor)
        } else {
          applyTheme(defaultSettings.primaryColor)
        }
      } catch {
        applyTheme(defaultSettings.primaryColor)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const applyTheme = (color: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-color', color)
    }
  }

  const updateSettings = async (updates: Partial<SiteSettings>) => {
    const newSettings = { ...settings, ...updates }
    await setDoc(doc(db, 'settings', 'main'), newSettings, { merge: true })
    setSettings(newSettings)
    if (updates.primaryColor) applyTheme(updates.primaryColor)
  }

  const uploadLogo = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `site/logo_${Date.now()}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    await updateSettings({ logoUrl: url })
    return url
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, uploadLogo, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
