# 🚀 SDH Global AI Assistant - Backend

## Обзор

Backend сервер для SDH Global AI Assistant - интеллектуальной системы с поддержкой Gemini API, управления настройками и REST API для интеграций.

## 🏗️ Архитектура

```
backend/
├── src/
│   ├── server.ts           # Основной сервер Express
│   ├── database/
│   │   └── init.ts         # Инициализация SQLite
│   └── routes/
│       ├── auth.ts         # Аутентификация
│       ├── settings.ts     # Управление настройками
│       ├── agents.ts       # Управление агентами
│       └── test.ts         # Тестирование API
├── docs/                   # 📚 Документация и примеры
│   ├── README.md
│   ├── API-DOCUMENTATION.md
│   ├── TELEPHONY-INTEGRATION.md
│   └── examples/
│       ├── javascript/
│       ├── python/
│       ├── php/
│       └── powershell/
├── database.sqlite         # База данных SQLite
├── package.json
└── tsconfig.json
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Запуск сервера

```bash
# Режим разработки
npm run dev

# Продакшен
npm start
```

### 3. Проверка работы

```bash
curl http://localhost:3001/api/health
```

## 📡 API Endpoints

| Метод | Endpoint | Описание | Авторизация |
|-------|----------|----------|-------------|
| GET | `/health` | Проверка состояния | ❌ |
| POST | `/auth/login` | Авторизация | ❌ |
| GET | `/settings` | Все настройки | ✅ |
| GET | `/settings/:key` | Конкретная настройка | ✅ |
| PUT | `/settings/:key` | Обновление настройки | ✅ |
| POST | `/settings` | Создание настройки | ✅ |
| DELETE | `/settings/:key` | Удаление настройки | ✅ |
| GET | `/test/gemini` | Тест Gemini API | ✅ |
| GET | `/public/apikey` | Публичный API ключ | ❌ |
| GET | `/public/agents` | Список агентов | ❌ |

## 🔐 Аутентификация

Система использует JWT токены:

```bash
# Получение токена
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Использование токена
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/settings
```

## ⚙️ Настройки

Система поддерживает следующие настройки:

- `default_model` - Модель Gemini по умолчанию
- `enable_audio` - Включение аудио функций
- `gemini_api_key` - API ключ Google Gemini
- `max_conversation_length` - Макс. длина истории диалога

## 🧪 Тестирование

### Автоматические тесты

```bash
npm test
```

### Ручное тестирование API

```bash
# Проверка здоровья
curl http://localhost:3001/api/health

# Авторизация
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Тест Gemini API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/test/gemini
```

## 📚 Документация

Полная документация доступна в папке `docs/`:

- **[📖 API Documentation](./docs/API-DOCUMENTATION.md)** - Полное описание API
- **[📞 Telephony Integration](./docs/TELEPHONY-INTEGRATION.md)** - Интеграция с IP телефонией  
- **[💻 Code Examples](./docs/examples/)** - Примеры кода для разных языков

### Примеры интеграции

#### JavaScript/Node.js
```javascript
const { SDHAIClient } = require('./docs/examples/javascript/client.js');

const client = new SDHAIClient();
await client.login('admin', 'admin123');
const settings = await client.getSettings();
```

#### Python
```python
from docs.examples.python.client import SDHAIClient

client = SDHAIClient()
client.login("admin", "admin123")
settings = client.get_settings()
```

#### PowerShell
```powershell
. ./docs/examples/powershell/client.ps1
$client = [SDHAIClient]::new()
$client.Login("admin", "admin123")
$settings = $client.GetSettings()
```

## 🔧 Конфигурация

### Переменные окружения

```bash
# .env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Настройка CORS

```javascript
// server.ts
app.use(cors({
  origin: [
    'http://localhost:5173', // Frontend
    'http://localhost:3000'  // Admin Panel
  ],
  credentials: true
}));
```

## 📊 Мониторинг

### Логирование

Логи сохраняются в файлы:
- `logs/error.log` - Ошибки
- `logs/combined.log` - Все события

### Метрики

Доступные метрики:
- Время ответа API
- Количество запросов
- Статус Gemini API
- Использование памяти

## 🚀 Развертывание

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2

```json
{
  "name": "sdh-ai-backend",
  "script": "dist/server.js",
  "instances": 2,
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3001
  }
}
```

## 🛠️ Разработка

### Структура базы данных

```sql
-- Пользователи
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user'
);

-- Настройки
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  type TEXT DEFAULT 'string',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Агенты
CREATE TABLE agents (
  id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  model TEXT,
  system_prompt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Добавление нового API endpoint

1. Создайте роут в `src/routes/`
2. Добавьте middleware если нужно
3. Подключите в `server.ts`
4. Обновите документацию
5. Добавьте тесты

## 🔒 Безопасность

- JWT токены с истечением
- Валидация входных данных
- Rate limiting
- CORS настройки
- Хеширование паролей (bcrypt)
- SQL injection защита

## 📈 Производительность

- Кэширование настроек
- Connection pooling
- Gzip сжатие
- Оптимизация SQL запросов

## 🆘 Troubleshooting

### Частые проблемы

1. **Сервер не запускается**
   - Проверьте порт 3001
   - Убедитесь что SQLite доступен

2. **Ошибки аутентификации**
   - Проверьте JWT_SECRET
   - Убедитесь что пользователь существует

3. **Gemini API не работает**
   - Проверьте GEMINI_API_KEY
   - Убедитесь в интернет-соединении

### Логи и отладка

```bash
# Просмотр логов
tail -f logs/combined.log

# Отладка в dev режиме
DEBUG=* npm run dev
```

## 📞 Поддержка

- **Email**: support@sdhglobal.com
- **Telegram**: @sdh_support  
- **GitHub**: [Issues](https://github.com/sdh-global/ai-assistant/issues)

---

**🎯 Backend готов к работе! Для получения полной документации API смотрите [docs/API-DOCUMENTATION.md](./docs/API-DOCUMENTATION.md)**
