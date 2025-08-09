import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { AuthProvider } from '../lib/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SDH Global AI Assistant - Admin Panel',
  description: 'Административная панель для управления AI ассистентом',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Навигация */}
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">
                        SDH AI Admin
                      </h1>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <Link
                        href="/"
                        className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                      >
                        🚀 SDH AI Assistant
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-2 text-sm text-gray-500">
                      <a href="http://localhost:5173" target="_blank" className="hover:text-gray-700">
                        Frontend
                      </a>
                      <span>•</span>
                      <a href="http://localhost:3001/api/health" target="_blank" className="hover:text-gray-700">
                        Backend
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Основной контент */}
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
