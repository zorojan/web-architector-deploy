"use client"

import React from 'react'
import { AuthProvider } from '../lib/auth-context'
import ReactQueryProvider from '../lib/react-query-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReactQueryProvider>
  )
}
