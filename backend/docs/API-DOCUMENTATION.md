# 🚀 SDH Global AI Assistant - API Documentation

## 📋 Содержание

- [Обзор API](#обзор-api)
- [Аутентификация](#аутентификация)
- [Health Check](#health-check)
- [Управление настройками](#управление-настройками)
- [Тестирование](#тестирование)
- [Примеры использования](#примеры-использования)
- [Обработка ошибок](#обработка-ошибок)
- [Rate Limiting](#rate-limiting)

---

## 🌐 Обзор API

SDH Global AI Assistant предоставляет REST API для интеграции с внешними системами.

**Base URL**: `http://localhost:3001/api`  
**Версия**: `1.0.0`  
**Формат данных**: JSON  
**Аутентификация**: JWT Bearer Token  

---

## 🔐 Аутентификация

### Логин

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Успешный ответ (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Ошибка (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Использование токена

Добавляйте токен в заголовок `Authorization`:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🏥 Health Check

### Проверка состояния сервера

```http
GET /health
```

**Ответ (200):**
```json
{
  "status": "OK",
  "message": "Backend server is running",
  "timestamp": "2025-08-08T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

## ⚙️ Управление настройками

### Получение всех настроек

```http
GET /settings
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "success": true,
  "settings": [
    {
      "key": "default_model",
      "value": "gemini-2.5-flash-preview-native-audio-dialog",
      "type": "string",
      "description": "Default Gemini model for conversations",
      "created_at": "2025-08-08T10:00:00.000Z",
      "updated_at": "2025-08-08T10:00:00.000Z"
    },
    {
      "key": "enable_audio",
      "value": "true",
      "type": "boolean",
      "description": "Enable audio functionality",
      "created_at": "2025-08-08T10:00:00.000Z",
      "updated_at": "2025-08-08T10:00:00.000Z"
    },
    {
      "key": "gemini_api_key",
      "value": "***hidden***",
      "type": "password",
      "description": "Google Gemini API Key",
      "created_at": "2025-08-08T10:00:00.000Z",
      "updated_at": "2025-08-08T10:30:00.000Z"
    }
  ]
}
```

### Получение конкретной настройки

```http
GET /settings/:key
Authorization: Bearer <token>
```

**Пример запроса:**
```http
GET /settings/default_model
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "success": true,
  "setting": {
    "key": "default_model",
    "value": "gemini-2.5-flash-preview-native-audio-dialog",
    "type": "string",
    "description": "Default Gemini model for conversations",
    "created_at": "2025-08-08T10:00:00.000Z",
    "updated_at": "2025-08-08T10:00:00.000Z"
  }
}
```

**Ошибка (404):**
```json
{
  "success": false,
  "error": "Setting not found"
}
```

### Обновление настройки

```http
PUT /settings/:key
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "новое_значение"
}
```

**Пример запроса:**
```http
PUT /settings/default_model
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "gemini-2.0-flash-thinking-exp-1219"
}
```

**Ответ (200):**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "setting": {
    "key": "default_model",
    "value": "gemini-2.0-flash-thinking-exp-1219",
    "type": "string",
    "description": "Default Gemini model for conversations",
    "updated_at": "2025-08-08T10:35:00.000Z"
  }
}
```

### Создание новой настройки

```http
POST /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "новый_ключ",
  "value": "значение",
  "description": "Описание настройки",
  "type": "string"
}
```

**Ответ (201):**
```json
{
  "success": true,
  "message": "Setting created successfully",
  "setting": {
    "key": "новый_ключ",
    "value": "значение",
    "type": "string",
    "description": "Описание настройки",
    "created_at": "2025-08-08T10:40:00.000Z",
    "updated_at": "2025-08-08T10:40:00.000Z"
  }
}
```

### Удаление настройки

```http
DELETE /settings/:key
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

---

## 🧪 Тестирование

### Тест Gemini API

```http
GET /test/gemini
Authorization: Bearer <token>
```

**Успешный ответ (200):**
```json
{
  "success": true,
  "message": "Gemini API working correctly",
  "modelsCount": 15,
  "apiKeyPreview": "AIzaSyAscn...hQmQ",
  "response_time": 245
}
```

**Ошибка (400/500):**
```json
{
  "success": false,
  "error": "GEMINI_API_KEY не задан в настройках админ-панели"
}
```

```json
{
  "success": false,
  "error": "Gemini API ошибка: 400 - API key not valid"
}
```

---

## 📊 Публичные методы

### Получение API ключа (для frontend)

```http
GET /public/apikey
```

**Ответ (200):**
```json
{
  "apiKey": "AIzaSyAscnWh6-p0v-v2Uoktbd2cjFhaAE_hQmQ"
}
```

**Ошибка (404):**
```json
{
  "error": "API key not configured"
}
```

### Получение агентов (для frontend)

```http
GET /public/agents
```

**Ответ (200):**
```json
{
  "success": true,
  "agents": [
    {
      "id": 1,
      "name": "SDH Assistant",
      "description": "Помощник по разработке ПО",
      "model": "gemini-2.5-flash-preview-native-audio-dialog",
      "system_prompt": "Вы - AI-ассистент компании SDH Global...",
      "created_at": "2025-08-08T10:00:00.000Z",
      "updated_at": "2025-08-08T10:00:00.000Z"
    }
  ]
}
```

---

## ❌ Обработка ошибок

### Стандартные HTTP коды

| Код | Название | Описание |
|-----|----------|----------|
| 200 | OK | Запрос выполнен успешно |
| 201 | Created | Ресурс создан |
| 400 | Bad Request | Неверный запрос |
| 401 | Unauthorized | Не авторизован |
| 403 | Forbidden | Доступ запрещен |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт (например, ключ уже существует) |
| 429 | Too Many Requests | Превышен лимит запросов |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

### Формат ошибок

```json
{
  "success": false,
  "error": "Описание ошибки",
  "details": "Дополнительная информация (опционально)",
  "code": "ERROR_CODE (опционально)"
}
```

### Примеры ошибок

**401 - Не авторизован:**
```json
{
  "success": false,
  "error": "Access denied. Please provide a valid token.",
  "code": "UNAUTHORIZED"
}
```

**400 - Неверный запрос:**
```json
{
  "success": false,
  "error": "Value is required",
  "details": "Field 'value' cannot be empty"
}
```

**404 - Не найдено:**
```json
{
  "success": false,
  "error": "Setting not found",
  "details": "Setting with key 'nonexistent_key' does not exist"
}
```

**500 - Внутренняя ошибка:**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

---

## 🚦 Rate Limiting

API применяет ограничения на количество запросов:

- **Общие запросы**: 1000 запросов в час на IP
- **Аутентификация**: 10 попыток в минуту на IP
- **Настройки**: 100 запросов в час на пользователя
- **Тестирование**: 60 запросов в час на пользователя

### Заголовки ответа

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641998400
```

### Превышение лимита (429)

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "details": "Try again in 60 seconds",
  "retry_after": 60
}
```

---

## 🔒 Безопасность

### Заголовки безопасности

API автоматически добавляет заголовки безопасности:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### CORS

Разрешенные домены для CORS:
- `http://localhost:5173` (Frontend)
- `http://localhost:5174`
- `http://localhost:3000` (Admin Panel)

### Рекомендации

1. **Используйте HTTPS** в продакшене
2. **Храните токены безопасно** (не в localStorage)
3. **Обновляйте токены** регулярно
4. **Валидируйте данные** на клиенте и сервере
5. **Используйте rate limiting** на прокси-серверах

---

## 📝 Changelog

### v1.0.0 (2025-08-08)
- ✅ Базовая аутентификация
- ✅ CRUD операции с настройками
- ✅ Тестирование Gemini API
- ✅ Health check endpoint
- ✅ Rate limiting
- ✅ CORS support

---

## 🆘 Поддержка

При возникновении проблем:

1. **Проверьте логи сервера**: `backend/logs/`
2. **Убедитесь в правильности токена**: `/auth/login`
3. **Проверьте формат запроса**: Content-Type, JSON syntax
4. **Обратитесь в поддержку**: support@sdhglobal.com

---

**📚 Полные примеры кода доступны в папке [examples/](./examples/)**
