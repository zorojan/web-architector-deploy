import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SDH Global AI Assistant - Admin Panel',
  description: 'Административная панель для управления AI ассистентом',
}

// Force dynamic rendering to avoid static prerendering of error pages which
// can trigger client-only hooks during build-time prerender.
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
  {children}
      </body>
    </html>
  )
}
