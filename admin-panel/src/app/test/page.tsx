'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
  duration?: number;
}

interface ConnectionLog {
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const addLog = (type: ConnectionLog['type'], message: string) => {
    const newLog: ConnectionLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Ограничиваем 100 записями
  };

  const runTest = async (name: string, testFn: () => Promise<any>): Promise<TestResult> => {
    const startTime = Date.now();
    addLog('info', `Запуск теста: ${name}`);
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      addLog('success', `✅ ${name} - успешно (${duration}ms)`);
      
      return {
        name,
        status: 'success',
        message: result.message || 'Тест пройден успешно',
        timestamp: new Date().toLocaleString(),
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      addLog('error', `❌ ${name} - ошибка: ${error.message}`);
      
      return {
        name,
        status: 'error',
        message: error.message || 'Неизвестная ошибка',
        timestamp: new Date().toLocaleString(),
        duration
      };
    }
  };

  // Тест Backend API
  const testBackendAPI = async () => {
    const response = await fetch('http://localhost:3001/api/health');
    
    if (!response.ok) {
      throw new Error(`Backend API недоступен (${response.status})`);
    }
    
    const data = await response.json();
    return { message: `Backend API работает: ${data.message}` };
  };

  // Тест Frontend доступности
  const testFrontendAPI = async () => {
    const response = await fetch('http://localhost:5173/');
    
    if (!response.ok) {
      throw new Error(`Frontend недоступен (${response.status})`);
    }
    
    return { message: 'Frontend доступен' };
  };

  // Тест Gemini API ключа
  const testGeminiAPI = async () => {
    const response = await fetch('/api/test/gemini');
    
    if (!response.ok) {
      throw new Error(`Ошибка проверки Gemini API (${response.status})`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Gemini API недоступен');
    }
    
    return { message: `Gemini API работает (${data.modelsCount} моделей доступно)` };
  };

  // Тест WebSocket соединения
  const testWebSocket = async () => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket('ws://localhost:3001');
        let resolved = false;
        
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            ws.close();
            reject(new Error('WebSocket таймаут подключения (5с)'));
          }
        }, 5000);
        
        ws.onopen = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            ws.close();
            resolve({ message: 'WebSocket соединение успешно' });
          }
        };
        
        ws.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            reject(new Error('WebSocket ошибка подключения'));
          }
        };
        
        ws.onclose = (event) => {
          addLog('warning', `WebSocket закрыт: код ${event.code}, причина: ${event.reason || 'неизвестно'}`);
        };
        
      } catch (error: any) {
        reject(new Error(`WebSocket ошибка: ${error.message}`));
      }
    });
  };

  // Длительный тест соединения с Gemini
  const testGeminiConnection = async () => {
    addLog('info', 'Начинаем длительный тест соединения с Gemini...');
    
    for (let i = 1; i <= 5; i++) {
      addLog('info', `Попытка подключения ${i}/5`);
      
      try {
        // Симуляция реального подключения к Gemini Live API
        const response = await fetch('/api/test/gemini-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attempt: i })
        });
        
        if (!response.ok) {
          throw new Error(`Попытка ${i} неудачна: ${response.status}`);
        }
        
        addLog('success', `Попытка ${i} успешна`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Ждем 2 секунды
        
      } catch (error: any) {
        addLog('error', `Попытка ${i} ошибка: ${error.message}`);
        
        if (i === 3) {
          throw new Error('Соединение начинает нестабильно работать с 3-й попытки');
        }
      }
    }
    
    return { message: 'Тест множественных подключений завершен' };
  };

  // Запуск всех тестов
  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    addLog('info', '🚀 Начинаем полное тестирование системы...');
    
    const testSuite = [
      { name: 'Backend API', fn: testBackendAPI },
      { name: 'Frontend доступность', fn: testFrontendAPI },
      { name: 'Gemini API ключ', fn: testGeminiAPI },
      { name: 'WebSocket соединение', fn: testWebSocket },
      { name: 'Тест стабильности Gemini', fn: testGeminiConnection }
    ];
    
    const results: TestResult[] = [];
    
    for (const test of testSuite) {
      const result = await runTest(test.name, test.fn);
      results.push(result);
      setTests([...results]);
      
      // Небольшая пауза между тестами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
    addLog('info', '✅ Полное тестирование завершено');
  };

  // Очистка логов
  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Логи очищены');
  };

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        runTest('Health Check', testBackendAPI);
      }, 10000); // Каждые 10 секунд
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLogColor = (type: ConnectionLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🧪 Диагностика системы</h1>
        <p className="text-gray-600 mt-2">
          Тестирование соединений и диагностика проблем с AI агентом
        </p>
      </div>

      {/* Управление */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <ClockIcon className="w-4 h-4 animate-spin" />
                Тестирование...
              </>
            ) : (
              '🚀 Запустить все тесты'
            )}
          </button>
          
          <button
            onClick={clearLogs}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            🗑️ Очистить логи
          </button>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Авто-обновление</span>
          </label>
        </div>
      </div>

      {/* Результаты тестов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статусы тестов */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">📊 Результаты тестов</h2>
          </div>
          <div className="p-4">
            {tests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Нет результатов. Запустите тестирование.
              </p>
            ) : (
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-gray-600">{test.message}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>{test.timestamp}</div>
                      {test.duration && <div>{test.duration}ms</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Логи */}
        <div className="bg-gray-900 rounded-lg text-white">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">📋 Логи в реальном времени</h2>
          </div>
          <div className="p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Логи пусты. Запустите тестирование.
              </p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-gray-500">[{log.timestamp}]</span>
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
