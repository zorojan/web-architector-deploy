'use client'

import { useAuth } from '@/lib/auth-context'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="admin-container">
      {isAuthenticated ? <Dashboard /> : <LoginForm />}
    </main>
  )
}
