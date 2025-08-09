const axios = require('axios');

/**
 * SDH Global AI Assistant API Client для Node.js
 * Версия: 1.0.0
 * 
 * Использование:
 * const client = new SDHAIClient();
 * await client.login('admin', 'admin123');
 * const settings = await client.getSettings();
 */
class SDHAIClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = null;
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Автоматическое добавление токена авторизации
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Обработка ошибок
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null; // Сбрасываем токен при 401
        }
        throw new APIError(
          error.response?.data?.error || error.message,
          error.response?.status || 500,
          error.response?.data
        );
      }
    );
  }

  /**
   * Авторизация в системе
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль
   * @returns {Promise<Object>} Результат авторизации
   */
  async login(username, password) {
    try {
      const response = await this.api.post('/auth/login', {
        username,
        password
      });
      
      if (response.data.success) {
        this.token = response.data.token;
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  /**
   * Проверка состояния сервера
   * @returns {Promise<Object>} Статус сервера
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error.message);
      throw error;
    }
  }

  /**
   * Получение всех настроек
   * @returns {Promise<Array>} Массив настроек
   */
  async getSettings() {
    try {
      const response = await this.api.get('/settings');
      return response.data.settings || [];
    } catch (error) {
      console.error('Failed to get settings:', error.message);
      throw error;
    }
  }

  /**
   * Получение конкретной настройки
   * @param {string} key - Ключ настройки
   * @returns {Promise<Object>} Настройка
   */
  async getSetting(key) {
    try {
      const response = await this.api.get(`/settings/${key}`);
      return response.data.setting;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Обновление настройки
   * @param {string} key - Ключ настройки
   * @param {string} value - Новое значение
   * @returns {Promise<Object>} Результат обновления
   */
  async updateSetting(key, value) {
    try {
      const response = await this.api.put(`/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Создание новой настройки
   * @param {string} key - Ключ настройки
   * @param {string} value - Значение
   * @param {string} description - Описание
   * @param {string} type - Тип (string, boolean, number, password)
   * @returns {Promise<Object>} Результат создания
   */
  async createSetting(key, value, description = '', type = 'string') {
    try {
      const response = await this.api.post('/settings', {
        key,
        value,
        description,
        type
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to create setting ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Удаление настройки
   * @param {string} key - Ключ настройки
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteSetting(key) {
    try {
      const response = await this.api.delete(`/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete setting ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Тестирование Gemini API
   * @returns {Promise<Object>} Результат теста
   */
  async testGeminiAPI() {
    try {
      const response = await this.api.get('/test/gemini');
      return response.data;
    } catch (error) {
      console.error('Gemini API test failed:', error.message);
      throw error;
    }
  }

  /**
   * Получение публичного API ключа
   * @returns {Promise<string>} API ключ
   */
  async getPublicAPIKey() {
    try {
      const response = await this.api.get('/public/apikey');
      return response.data.apiKey;
    } catch (error) {
      console.error('Failed to get public API key:', error.message);
      throw error;
    }
  }

  /**
   * Получение списка агентов
   * @returns {Promise<Array>} Массив агентов
   */
  async getAgents() {
    try {
      const response = await this.api.get('/public/agents');
      return response.data.agents || [];
    } catch (error) {
      console.error('Failed to get agents:', error.message);
      throw error;
    }
  }

  /**
   * Проверка авторизации
   * @returns {boolean} Авторизован ли пользователь
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Выход из системы
   */
  logout() {
    this.token = null;
  }
}

/**
 * Класс для обработки ошибок API
 */
class APIError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Экспорт для использования в других модулях
module.exports = { SDHAIClient, APIError };

// Пример использования
async function example() {
  const client = new SDHAIClient();
  
  try {
    console.log('🔐 Авторизация...');
    await client.login('admin', 'admin123');
    console.log('✅ Авторизация успешна');
    
    console.log('🏥 Проверка состояния сервера...');
    const health = await client.healthCheck();
    console.log('✅ Сервер работает:', health.message);
    
    console.log('⚙️ Получение настроек...');
    const settings = await client.getSettings();
    console.log('✅ Найдено настроек:', settings.length);
    
    settings.forEach(setting => {
      console.log(`   - ${setting.key}: ${setting.value} (${setting.type})`);
    });
    
    console.log('🔍 Получение модели по умолчанию...');
    const defaultModel = await client.getSetting('default_model');
    console.log('✅ Модель по умолчанию:', defaultModel.value);
    
    console.log('🧪 Тестирование Gemini API...');
    const geminiTest = await client.testGeminiAPI();
    if (geminiTest.success) {
      console.log('✅ Gemini API работает');
      console.log('📊 Время ответа:', geminiTest.response_time || 0, 'мс');
      console.log('🤖 Количество моделей:', geminiTest.modelsCount || 0);
    }
    
    console.log('📝 Обновление настройки...');
    await client.updateSetting('enable_audio', 'true');
    console.log('✅ Настройка обновлена');
    
    console.log('🤖 Получение агентов...');
    const agents = await client.getAgents();
    console.log('✅ Найдено агентов:', agents.length);
    
  } catch (error) {
    if (error instanceof APIError) {
      console.error(`❌ API Ошибка [${error.status}]:`, error.message);
      if (error.data) {
        console.error('   Детали:', error.data);
      }
    } else {
      console.error('❌ Неожиданная ошибка:', error.message);
    }
  }
}

// Запуск примера, если файл выполняется напрямую
if (require.main === module) {
  example();
}
