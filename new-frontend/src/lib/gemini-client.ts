import { GoogleGenerativeAI } from '@google/generative-ai'
import { AudioRecorder as AdvancedAudioRecorder } from './audio-recorder'
import { AudioStreamer } from './audio-streamer'

export interface ChatMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface Agent {
  id: number
  name: string
  description: string
  personality: string
  instructions: string
  model: string
  temperature: number
}

export interface UserProfile {
  name: string
  info: string
}

export class GeminiChatClient {
  private genAI: GoogleGenerativeAI
  private model: any
  private chat: any
  private agent: Agent | null = null
  private userProfile: UserProfile | null = null

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  setAgent(agent: Agent, userProfile: UserProfile) {
    this.agent = agent
    this.userProfile = userProfile
    
    // Создаем модель с настройками агента
    this.model = this.genAI.getGenerativeModel({
      model: agent.model || 'gemini-1.5-flash',
      generationConfig: {
        temperature: agent.temperature || 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    // Создаем системный промпт
    const systemPrompt = this.buildSystemPrompt(agent, userProfile)
    
    // Инициализируем чат с историей
    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: `Понял! Я ${agent.name}. ${agent.description} Готов к общению с ${userProfile.name}!` }],
        },
      ],
    })
  }

  private buildSystemPrompt(agent: Agent, userProfile: UserProfile): string {
    return `Ты ${agent.name}. ${agent.description}

ЛИЧНОСТЬ: ${agent.personality}

ИНСТРУКЦИИ: ${agent.instructions}

ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ:
- Имя: ${userProfile.name}
- Дополнительная информация: ${userProfile.info || 'Не указана'}

ПРАВИЛА:
1. Всегда отвечай от лица ${agent.name}
2. Используй дружелюбный и естественный тон
3. Помни контекст разговора
4. Отвечай на русском языке
5. Будь полезным и информативным
6. Обращайся к пользователю по имени ${userProfile.name}

Начни диалог с приветствия!`
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat || !this.agent) {
      throw new Error('Чат не инициализирован. Сначала выберите агента.')
    }

    try {
      const result = await this.chat.sendMessage(message)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      throw new Error('Не удалось отправить сообщение. Проверьте подключение к интернету.')
    }
  }

  async sendMessageStream(message: string, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.chat || !this.agent) {
      throw new Error('Чат не инициализирован. Сначала выберите агента.')
    }

    try {
      const result = await this.chat.sendMessageStream(message)
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        onChunk(chunkText)
      }
    } catch (error) {
      console.error('Ошибка стриминга:', error)
      throw new Error('Не удалось отправить сообщение. Проверьте подключение к интернету.')
    }
  }

  getWelcomeMessage(): string {
    if (!this.agent || !this.userProfile) {
      return 'Привет! Выберите агента для начала диалога.'
    }

    return `Привет, ${this.userProfile.name}! Я ${this.agent.name}. ${this.agent.description} Как дела?`
  }
}

// Аудио рекордер для голосового ввода
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error)
      throw new Error('Не удалось получить доступ к микрофону')
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null)
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}

// Преобразование аудио в текст (веб API)
export async function audioToText(_audioBlob: Blob): Promise<string> {
  // Это заглушка - в реальном проекте нужно использовать
  // Google Speech-to-Text API или другой сервис
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Привет, это тестовое сообщение от голосового ввода")
    }, 1000)
  })
}

// Экспорт продвинутых аудио классов для использования в компонентах
export { AdvancedAudioRecorder, AudioStreamer }
