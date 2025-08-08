import { useState, useEffect, useRef } from 'react'
import './index.css'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface Agent {
  id: string
  name: string
  personality: string
  description?: string
  is_active: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UserProfile {
  name: string
  info: string
}

function App() {
  const [step, setStep] = useState<'setup' | 'chat'>('setup')
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', info: '' })
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null)
  const [model, setModel] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Загружаем данные...')

      // Загружаем API ключ
      console.log('📡 Запрашиваем API ключ...')
      const keyResponse = await fetch('http://localhost:3001/api/public/apikey')
      console.log('📡 Ответ API ключа:', keyResponse.status, keyResponse.statusText)
      
      if (!keyResponse.ok) {
        const errorText = await keyResponse.text()
        console.error('❌ Ошибка API ключа:', errorText)
        throw new Error(`API ключ не найден: ${keyResponse.status} ${errorText}`)
      }
      
      const keyData = await keyResponse.json()
      console.log('✅ API ключ получен:', keyData.apiKey ? 'Да' : 'Нет')
      setApiKey(keyData.apiKey)

      // Загружаем агентов
      console.log('📡 Запрашиваем агентов...')
      const agentsResponse = await fetch('http://localhost:3001/api/public/agents')
      console.log('📡 Ответ агентов:', agentsResponse.status, agentsResponse.statusText)
      
      if (!agentsResponse.ok) {
        const errorText = await agentsResponse.text()
        console.error('❌ Ошибка агентов:', errorText)
        throw new Error(`Агенты не найдены: ${agentsResponse.status} ${errorText}`)
      }
      
      const agentsData = await agentsResponse.json()
      console.log('✅ Агенты получены:', agentsData.length, 'штук')
      
      const activeAgents = agentsData.filter((agent: Agent) => agent.is_active === 1)
      console.log('✅ Активные агенты:', activeAgents.length, 'штук')
      setAgents(activeAgents)

      // Инициализируем Gemini
      console.log('🤖 Инициализируем Gemini AI...')
      const ai = new GoogleGenerativeAI(keyData.apiKey)
      setGenAI(ai)
      console.log('✅ Gemini AI инициализирован')

    } catch (err) {
      console.error('💥 Ошибка загрузки:', err)
      setError(`Не удалось загрузить данные: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (!userProfile.name.trim()) {
      alert('Введите ваше имя')
      return
    }
    if (!selectedAgent) {
      alert('Выберите агента')
      return
    }
    if (!genAI) {
      alert('AI не инициализирован')
      return
    }

    // Создаем модель
    const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    setModel(aiModel)

    setStep('chat')

    // Добавляем приветственное сообщение
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Привет, ${userProfile.name}! Я ${selectedAgent.name}. ${selectedAgent.personality} Как дела?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !model) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const systemPrompt = `Ты ${selectedAgent?.name}. ${selectedAgent?.personality}. Отвечай дружелюбно на русском языке.`
      
      const prompt = `${systemPrompt}\n\nПользователь ${userProfile.name} спрашивает: ${userMessage.content}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Ошибка отправки:', err)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Загрузка данных при запуске
  useEffect(() => {
    loadData()
  }, [])

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

  if (isLoading) {
    return (
      <div className="app">
        <div className="main-content">
          <div className="chat-container">
            <div className="loading">
              <h2>Загрузка...</h2>
              <p>Подключаемся к AI системе</p>
            </div>
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
              <button className="btn" onClick={loadData} style={{marginTop: '1rem'}}>
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
                    const agent = agents.find(a => a.id === e.target.value)
                    setSelectedAgent(agent || null)
                  }}
                >
                  <option value="">-- Выберите агента --</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.description || agent.personality}
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
