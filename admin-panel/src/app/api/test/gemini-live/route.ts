import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { attempt } = await request.json();
    
    // Проверяем API ключ
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY отсутствует'
      }, { status: 500 });
    }

    // Симулируем проблему, которая появляется после 2-3 попыток
    if (attempt >= 3) {
      // Случайно выбираем тип ошибки, которая может происходить
      const errorTypes = [
        'quota_exceeded',
        'connection_timeout', 
        'websocket_closed',
        'authentication_failed'
      ];
      
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      
      switch (randomError) {
        case 'quota_exceeded':
          return NextResponse.json({
            success: false,
            error: 'Quota exceeded. Please try again later.',
            errorType: 'QUOTA_EXCEEDED'
          }, { status: 429 });
          
        case 'connection_timeout':
          // Симулируем долгий ответ и таймаут
          await new Promise(resolve => setTimeout(resolve, 5000));
          return NextResponse.json({
            success: false,
            error: 'Connection timeout after 5 seconds',
            errorType: 'TIMEOUT'
          }, { status: 408 });
          
        case 'websocket_closed':
          return NextResponse.json({
            success: false,
            error: 'WebSocket connection closed unexpectedly',
            errorType: 'WEBSOCKET_CLOSED'
          }, { status: 503 });
          
        case 'authentication_failed':
          return NextResponse.json({
            success: false,
            error: 'Authentication failed. API key may be invalid.',
            errorType: 'AUTH_FAILED'
          }, { status: 401 });
      }
    }

    // Для первых попыток возвращаем успех
    return NextResponse.json({
      success: true,
      attempt,
      message: `Попытка ${attempt} успешна`,
      timestamp: new Date().toISOString(),
      connectionInfo: {
        latency: Math.floor(Math.random() * 200) + 50, // 50-250ms
        region: 'us-central1',
        model: 'gemini-pro'
      }
    });

  } catch (error) {
    console.error('Gemini Live test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка тестирования'
    }, { status: 500 });
  }
}
