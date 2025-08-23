import React from 'react'

// prevent static prerendering of not-found page
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404 — Страница не найдена</h1>
      <p>Запрошенная страница не найдена.</p>
    </div>
  )
}
