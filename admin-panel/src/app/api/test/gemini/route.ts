import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Вызываем backend для тестирования Gemini API
  const backendBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:3001/api'
  const response = await fetch(`${backendBase}/test/gemini`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `Backend ошибка: ${response.status} - ${errorText}`
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Ошибка подключения к backend: ${error.message}`
    }, { status: 500 })
  }
}
