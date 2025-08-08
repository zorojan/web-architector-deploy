// Тест подключения к Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai'

async function testGeminiConnection() {
  try {
    const response = await fetch('http://localhost:3001/api/public/apikey')
    const data = await response.json()
    const apiKey = data.apiKey
    
    console.log('API Key получен:', apiKey ? 'Да' : 'Нет')
    
    if (!apiKey) {
      console.error('API ключ не найден')
      return
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent('Скажи "Привет" на русском языке')
    const response_text = await result.response.text()
    
    console.log('Ответ от Gemini:', response_text)
    
  } catch (error) {
    console.error('Ошибка тестирования:', error)
  }
}

// Экспортируем для использования в консоли браузера
(window as any).testGeminiConnection = testGeminiConnection
