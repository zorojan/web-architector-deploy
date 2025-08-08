import { useState, useEffect, useRef } from 'react'
import './index.css'
import { 
  GeminiChatClient, 
  AudioRecorder, 
  audioToText, 
  AdvancedAudioRecorder,
  AudioStreamer,
  type Agent, 
  type UserProfile 
} from './lib/gemini-client'

// Типы данных
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// API клиент
const API_BASE_URL = 'http://localhost:3001/api'

const apiClient = {
  // Получить API ключ
  async getApiKey(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/public/apikey`)
    if (!response.ok) throw new Error('API ключ не найден')
    const data = await response.json()
    return data.apiKey || ''
  },

  // Получить всех агентов (публичный endpoint)
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${API_BASE_URL}/public/agents`)
    if (!response.ok) throw new Error('Не удалось загрузить агентов')
    return response.json()
  }
}

function App() {
  // Состояние приложения
  const [step, setStep] = useState<'setup' | 'chat'>('setup')
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', info: '' })
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [audioVolume, setAudioVolume] = useState(0)
  
  // Gemini клиент и аудио рекордеры
  const [geminiClient, setGeminiClient] = useState<GeminiChatClient | null>(null)
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [advancedAudioRecorder] = useState(() => new AdvancedAudioRecorder())
  const [audioStreamer] = useState(() => new AudioStreamer())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Загрузка данных при запуске
  useEffect(() => {
    loadInitialData()
  }, [])

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Загружаем API ключ и агентов параллельно
      const [apiKeyResult, agentsResult] = await Promise.all([
        apiClient.getApiKey(),
        apiClient.getAgents()
      ])
      
      setAgents(agentsResult)
      
      if (!apiKeyResult) {
        setError('API ключ не настроен. Настройте его в админ панели.')
        return
      }
      
      if (agentsResult.length === 0) {
        setError('Агенты не найдены. Создайте агентов в админ панели.')
        return
      }

      // Инициализируем Gemini клиент
      const client = new GeminiChatClient(apiKeyResult)
      setGeminiClient(client)
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setError('Не удалось загрузить данные. Проверьте подключение к серверу.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = () => {
    if (!userProfile.name.trim()) {
      alert('Пожалуйста, введите ваше имя')
      return
    }
    if (!selectedAgent) {
      alert('Пожалуйста, выберите агента')
      return
    }
    if (!geminiClient) {
      alert('Gemini клиент не инициализирован')
      return
    }
    
    // Настраиваем клиент с выбранным агентом
    geminiClient.setAgent(selectedAgent, userProfile)
    
    setStep('chat')
    
    // Добавляем приветственное сообщение от агента
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: geminiClient.getWelcomeMessage(),
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || !geminiClient) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Создаем пустое сообщение ассистента для стриминга
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, assistantMessage])

    try {
      // Используем стриминг для получения ответа по частям
      await geminiClient.sendMessageStream(userMessage.content, (chunk) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        )
      })
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Извините, произошла ошибка. Попробуйте еще раз.' }
            : msg
        )
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleChangeAgent = () => {
    setStep('setup')
    setMessages([])
  }

  const toggleRecording = async () => {
    try {
      if (isAdvancedMode) {
        // Используем продвинутый аудио рекордер с Web Audio API
        if (!advancedAudioRecorder.recording) {
          // Начинаем запись
          await advancedAudioRecorder.start()
          
          // Подписываемся на события громкости
          advancedAudioRecorder.on('volume', (volume: number) => {
            setAudioVolume(volume)
          })
          
          // Подписываемся на данные аудио
          advancedAudioRecorder.on('data', (base64Data: string) => {
            console.log('Получены аудио данные:', base64Data.length, 'байт')
          })
          
          setIsRecording(true)
          console.log('Начинаем продвинутую запись голоса...')
        } else {
          // Останавливаем запись
          advancedAudioRecorder.stop()
          setIsRecording(false)
          setAudioVolume(0)
          console.log('Останавливаем продвинутую запись...')
          
          // Здесь можно добавить обработку записанного аудио
          setInputMessage('Голосовое сообщение записано (продвинутый режим)')
        }
      } else {
        // Используем простой аудио рекордер
        if (!audioRecorder.isRecording()) {
          // Начинаем запись
          await audioRecorder.startRecording()
          setIsRecording(true)
          console.log('Начинаем запись голоса...')
        } else {
          // Останавливаем запись и обрабатываем аудио
          setIsRecording(false)
          console.log('Останавливаем запись...')
          
          const audioBlob = await audioRecorder.stopRecording()
          if (audioBlob) {
            console.log('Аудио записано, конвертируем в текст...')
            try {
              const text = await audioToText(audioBlob)
              if (text.trim()) {
                setInputMessage(text)
              }
            } catch (error) {
              console.error('Ошибка конвертации аудио в текст:', error)
              alert('Не удалось распознать речь. Попробуйте еще раз.')
            }
          }
        }
      }
    } catch (error) {
      console.error('Ошибка записи голоса:', error)
      setIsRecording(false)
      setAudioVolume(0)
      alert('Не удалось получить доступ к микрофону')
    }
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="main-content">
          <div className="loading">
            <h2>Загрузка...</h2>
            <p>Подключаемся к серверу и загружаем данные</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="main-content">
          <div className="chat-container">
            <div className="error">
              <h3>Ошибка подключения</h3>
              <p>{error}</p>
              <br />
              <p>Убедитесь что:</p>
              <ul style={{textAlign: 'left', marginTop: '1rem'}}>
                <li>Backend сервер запущен (http://localhost:3001)</li>
                <li>API ключ настроен в <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">админ панели</a></li>
                <li>Созданы агенты в админ панели</li>
              </ul>
              <button className="btn" onClick={loadInitialData} style={{marginTop: '1rem'}}>
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">SDH AI Chat Assistant</div>
        <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="admin-link">
          Админ панель
        </a>
      </header>

      <main className="main-content">
        <div className="chat-container">
          {step === 'setup' ? (
            <div className="setup-form">
              <h2>Настройка профиля и выбор агента</h2>
              
              <div className="form-group">
                <label htmlFor="userName">Ваше имя:</label>
                <input
                  id="userName"
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите ваше имя"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userInfo">Дополнительная информация о вас (необязательно):</label>
                <input
                  id="userInfo"
                  type="text"
                  value={userProfile.info}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, info: e.target.value }))}
                  placeholder="Расскажите о себе, ваших интересах..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="agentSelect">Выберите AI агента:</label>
                <select
                  id="agentSelect"
                  value={selectedAgent?.id || ''}
                  onChange={(e) => {
                    const agent = agents.find(a => a.id === parseInt(e.target.value))
                    setSelectedAgent(agent || null)
                  }}
                >
                  <option value="">-- Выберите агента --</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.description}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="btn" 
                onClick={handleStartChat}
                disabled={!userProfile.name.trim() || !selectedAgent}
              >
                Начать диалог
              </button>
            </div>
          ) : (
            <div className="chat-interface">
              <div className="chat-header">
                <div className="chat-title">
                  Диалог с {selectedAgent?.name} | Пользователь: {userProfile.name}
                </div>
                <button className="change-agent-btn" onClick={handleChangeAgent}>
                  Сменить агента
                </button>
              </div>

              <div className="messages">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.role}`}>
                    {message.content}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="typing-indicator">
                    <span>{selectedAgent?.name} печатает</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                <div className="audio-controls">
                  <label className="audio-mode-switch">
                    <input
                      type="checkbox"
                      checked={isAdvancedMode}
                      onChange={(e) => setIsAdvancedMode(e.target.checked)}
                    />
                    Продвинутый аудио режим
                  </label>
                  {isAdvancedMode && audioVolume > 0 && (
                    <div className="volume-meter">
                      <div className="volume-bar">
                        <div 
                          className="volume-fill"
                          style={{ width: `${Math.min(audioVolume * 100, 100)}%` }}
                        />
                      </div>
                      <span className="volume-text">{Math.round(audioVolume * 100)}%</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  className="message-input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите сообщение..."
                  disabled={isTyping}
                />
                <button
                  className={`voice-btn ${isRecording ? 'recording' : ''} ${isAdvancedMode ? 'advanced' : ''}`}
                  onClick={toggleRecording}
                  title={isRecording ? 'Остановить запись' : `Начать запись голоса${isAdvancedMode ? ' (продвинутый режим)' : ''}`}
                >
                  🎤
                </button>
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  Отправить
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
