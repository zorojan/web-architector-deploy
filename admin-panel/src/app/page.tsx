'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../lib/auth-context';
import LoginForm from '../components/LoginForm';

type TabType = 'agents' | 'settings' | 'test';

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

export default function AdminPanel() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('agents');
  const [tests, setTests] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const addLog = (type: ConnectionLog['type'], message: string) => {
    const newLog: ConnectionLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
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

  // Тесты API
  const testBackendAPI = async () => {
    const response = await fetch('http://localhost:3001/api/health');
    if (!response.ok) {
      throw new Error(`Backend API недоступен (${response.status})`);
    }
    const data = await response.json();
    return { message: `Backend API работает: ${data.message}` };
  };

  const testFrontendAPI = async () => {
    const response = await fetch('http://localhost:5173/');
    if (!response.ok) {
      throw new Error(`Frontend недоступен (${response.status})`);
    }
    return { message: 'Frontend доступен' };
  };

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

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    addLog('info', '🚀 Начинаем полное тестирование системы...');
    
    const testSuite = [
      { name: 'Backend API', fn: testBackendAPI },
      { name: 'Frontend доступность', fn: testFrontendAPI },
      { name: 'Gemini API ключ', fn: testGeminiAPI }
    ];
    
    const results: TestResult[] = [];
    
    for (const test of testSuite) {
      const result = await runTest(test.name, test.fn);
      results.push(result);
      setTests([...results]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
    addLog('info', '✅ Полное тестирование завершено');
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Логи очищены');
  };

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

  const tabs = [
    { id: 'agents' as TabType, name: '🤖 Агенты', description: 'Управление AI агентами' },
    { id: 'settings' as TabType, name: '⚙️ Настройки', description: 'Конфигурация системы' },
    { id: 'test' as TabType, name: '🧪 Тест', description: 'Диагностика соединений' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 SDH Global AI Assistant - Admin Panel ⚡
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Добро пожаловать, {user?.username}</span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статус сервисов */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Frontend</h3>
            <p className="text-gray-600 mb-4">React + Vite (порт 5173)</p>
            <a 
              href="http://localhost:5173" 
              target="_blank"
              className="text-blue-600 hover:text-blue-800"
            >
              Открыть →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend API</h3>
            <p className="text-gray-600 mb-4">Express API (порт 3001)</p>
            <a 
              href="http://localhost:3001/api/health" 
              target="_blank"
              className="text-blue-600 hover:text-blue-800"
            >
              Health Check →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600 mb-4">Next.js (порт 3000)</p>
            <span className="text-green-600 font-semibold">✅ Активна</span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Боковая навигация */}
          <aside className="w-64">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Навигация</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.name.split(' ')[0]}</span>
                    <span>{tab.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Основной контент */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {/* Вкладка Агенты */}
                {activeTab === 'agents' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">🤖 Управление AI Агентами</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2">Статус агентов</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Gemini Live API</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Активен</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Audio Processing</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Активен</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>WebSocket Connection</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Нестабильно</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2">Быстрые действия</h3>
                        <div className="space-y-2">
                          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                            Перезапустить агентов
                          </button>
                          <button className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                            Сбросить подключения
                          </button>
                          <button 
                            onClick={() => setActiveTab('test')}
                            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
                          >
                            Запустить диагностику
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Вкладка Настройки */}
                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Настройки системы</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gemini API Key</label>
                          <input 
                            type="password" 
                            placeholder="Введите API ключ..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Backend URL</label>
                          <input 
                            type="text" 
                            defaultValue="http://localhost:3001"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Frontend URL</label>
                          <input 
                            type="text" 
                            defaultValue="http://localhost:5173"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                          Сохранить настройки
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2">Информация о системе</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Node.js версия:</span>
                            <span className="font-mono">v20.x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next.js версия:</span>
                            <span className="font-mono">14.2.31</span>
                          </div>
                          <div className="flex justify-between">
                            <span>React версия:</span>
                            <span className="font-mono">18.2.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Время работы:</span>
                            <span>2ч 34м</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Вкладка Тест */}
                {activeTab === 'test' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">🧪 Диагностика соединений</h2>
                    
                    {/* Управление тестами */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
                      </div>
                    </div>

                    {/* Результаты и логи */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Результаты тестов */}
                      <div className="bg-white border rounded-lg">
                        <div className="p-4 border-b">
                          <h3 className="text-lg font-semibold">📊 Результаты тестов</h3>
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
                          <h3 className="text-lg font-semibold">📋 Логи в реальном времени</h3>
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
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
