import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { LanguageProvider } from './context/LanguageContext'

export const metadata: Metadata = {
  title: 'VoxDub - منصة المعلقين الصوتيين',
  description: 'منصة احترافية للمعلقين الصوتيين في العالم العربي',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" />
        <style>{`* { font-family: 'Cairo', sans-serif; }`}</style>
      </head>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
