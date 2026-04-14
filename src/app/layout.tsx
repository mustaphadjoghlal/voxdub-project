// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './context/AuthContext'   // ← تأكد من المسار صحيح

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
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
