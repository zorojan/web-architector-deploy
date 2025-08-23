"use client"

import React from 'react'

// prevent static prerendering of this client error page
export const dynamic = 'force-dynamic'

export default function GlobalError({ error }: { error: Error }) {
  // keep logging on the server
  // avoid client-only hooks or html/body wrappers here so Next can prerender safely
  console.error('Global error page:', error)
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Ошибка сервера</h1>
      <p>Произошла ошибка при рендеринге страницы.</p>
    </div>
  )
}
