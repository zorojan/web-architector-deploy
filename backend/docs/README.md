# 📚 SDH Global AI Assistant - Backend Documentation

## Обзор

Данная папка содержит полную документацию по API и примеры интеграции для SDH Global AI Assistant.

## 📂 Структура документации

```
backend/docs/
├── README.md                    # Этот файл
├── API-DOCUMENTATION.md         # Полная API документация
├── TELEPHONY-INTEGRATION.md     # Интеграция с IP телефонией
├── examples/                    # Примеры использования
│   ├── javascript/              # Node.js примеры
│   ├── python/                  # Python примеры
│   ├── php/                     # PHP примеры
│   ├── powershell/              # PowerShell примеры
│   └── curl/                    # cURL примеры
└── integrations/                # Готовые интеграции
    ├── asterisk/                # Asterisk PBX
    ├── 3cx/                     # 3CX Phone System
    └── webhook-examples/        # Webhook примеры
```

## 🚀 Быстрый старт

### 1. API Endpoints

**Base URL**: `http://localhost:3001/api`

- **Health Check**: `GET /health`
- **Authentication**: `POST /auth/login`
- **Settings**: `GET/PUT /settings/:key`
- **Testing**: `GET /test/gemini`

### 2. Аутентификация

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Использование токена

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/settings
```

## 📖 Документация

- **[API Documentation](./API-DOCUMENTATION.md)** - Полное описание всех API методов
- **[Telephony Integration](./TELEPHONY-INTEGRATION.md)** - Интеграция с IP телефонией
- **[Examples](./examples/)** - Готовые примеры кода

## 🔧 Примеры интеграции

### JavaScript/Node.js
```javascript
const client = new SDHAIClient('http://localhost:3001/api');
await client.login('admin', 'admin123');
const settings = await client.getSettings();
```

### Python
```python
client = SDHAIClient()
client.login("admin", "admin123")
settings = client.get_settings()
```

### PowerShell
```powershell
$client = [SDHAIClient]::new()
$client.Login("admin", "admin123")
$settings = $client.GetSettings()
```

## 📞 IP Телефония

SDH AI Assistant поддерживает интеграцию с:

- ✅ **Asterisk/FreePBX**
- ✅ **3CX Phone System** 
- ✅ **Generic SIP/WebRTC**

Подробности в [TELEPHONY-INTEGRATION.md](./TELEPHONY-INTEGRATION.md)

## 🆘 Поддержка

- **Email**: support@sdhglobal.com
- **GitHub**: [Issues](https://github.com/sdh-global/ai-assistant/issues)
- **Telegram**: @sdh_support

---

**🎉 Добро пожаловать в экосистему SDH AI Assistant!**
