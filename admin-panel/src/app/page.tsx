"use client";

import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import Providers from './providers';
import LoginForm from '../components/LoginForm';
import AgentsTab from '../components/AgentsTab';
import SettingsTab from '../components/SettingsTab';
import WidgetTab from '../components/WidgetTab';

type TabType = 'agents' | 'settings' | 'widget';

export default function AdminPanel() {
  return (
    <Providers>
      <InnerAdminPanel />
    </Providers>
  )
}

// Avoid static prerender of this page which may reference client-only hooks
export const dynamic = 'force-dynamic'

function InnerAdminPanel() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('agents');

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const tabs = [
    { 
      id: 'agents' as TabType, 
      name: '🤖 Агенты', 
      description: 'Управление AI агентами',
      icon: '🤖'
    },
    { 
      id: 'settings' as TabType, 
      name: '⚙️ Настройки', 
      description: 'Конфигурация системы',
      icon: '⚙️'
    },
    { 
      id: 'widget' as TabType, 
      name: '🪟 Виджет', 
      description: 'Настройки виджета для сайта',
      icon: '🪟'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Красивый заголовок */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                🚀
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SDH Global AI Assistant
                </h1>
                <p className="text-gray-600 font-medium">Панель управления</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Добро пожаловать</p>
                <p className="font-semibold text-gray-900">{user?.username}</p>
              </div>
              <button 
                onClick={logout}
                className="btn btn-danger hover:shadow-lg transition-all duration-200"
              >
                <span className="mr-2">👋</span>
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Красивые карточки статуса */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                  ⚛️
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">Frontend</h3>
                  <p className="text-sm text-gray-600">React + Vite</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Порт 5173 • Активен</p>
              <a 
                href="http://localhost:5173" 
                target="_blank"
                className="btn btn-primary w-full text-center hover:shadow-lg transition-all duration-200"
              >
                <span className="mr-2">🌐</span>
                Открыть приложение
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                  🔧
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">Backend API</h3>
                  <p className="text-sm text-gray-600">Express + SQLite</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Порт 3001 • Готов к работе</p>
              <a 
                href="http://localhost:3001/api/health" 
                target="_blank"
                className="btn btn-success w-full text-center hover:shadow-lg transition-all duration-200"
              >
                <span className="mr-2">❤️</span>
                Проверить здоровье
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                  ⚙️
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-600">Next.js</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Порт 3000 • Вы здесь</p>
              <div className="w-full">
                <div className="status-active text-center py-2 rounded-lg">
                  <span className="mr-2">✅</span>
                  Активна и работает
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          {/* Красивая навигация по табам */}
          <div className="border-b border-gray-200 px-6 py-4">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name.replace(/^[🤖⚙️🪟]\s*/, '')}
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Контент табов */}
          <div className="p-6">
            {/* Вкладка Агенты */}
            {activeTab === 'agents' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 Управление AI Агентами</h2>
                  <p className="text-gray-600">Создавайте и настраивайте AI агентов для вашего приложения</p>
                </div>
                <AgentsTab />
              </div>
            )}
            
            {/* Вкладка Настройки */}
            {activeTab === 'settings' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Настройки системы</h2>
                  <p className="text-gray-600">Конфигурация API ключей и системных параметров</p>
                </div>
                <SettingsTab />
              </div>
            )}

            {/* Вкладка Виджет */}
            {activeTab === 'widget' && (
              <div>
                <WidgetTab />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
