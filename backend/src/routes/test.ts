import express from 'express';
import { getDatabase } from '../database/init';
import { promisify } from 'util';

const router = express.Router();

// Test Gemini API
router.get('/gemini', async (req: express.Request, res: express.Response) => {
  try {
    const db = getDatabase();
    const get = promisify(db.get.bind(db)) as any;

    // Получаем API ключ из базы данных
    const setting = await get('SELECT value FROM settings WHERE key = ?', ['gemini_api_key']) as any;

    if (!setting || !setting.value) {
      return res.status(400).json({
        success: false,
        error: 'GEMINI_API_KEY не задан в настройках админ-панели'
      });
    }

    const apiKey = setting.value;

    // Тестируем подключение к Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Gemini API ошибка: ${response.status} - ${errorText}`
      });
    }

    const data = await response.json() as any;
    const modelsCount = data.models ? data.models.length : 0;

    res.json({
      success: true,
      message: 'Gemini API работает корректно',
      modelsCount,
      apiKeyPreview: `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`
    });

  } catch (error: any) {
    console.error('Gemini API test error:', error);
    res.status(500).json({
      success: false,
      error: `Ошибка подключения: ${error.message}`
    });
  }
});

export default router;
