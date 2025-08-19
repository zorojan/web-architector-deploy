'use client';

import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import LoginForm from '../components/LoginForm';
import AgentsTab from '../components/AgentsTab';
import SettingsTab from '../components/SettingsTab';

type TabType = 'agents' | 'settings';

export default function AdminPanel() {
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
    { id: 'agents' as TabType, name: '🤖 Агенты', description: 'Управление AI агентами' },
    { id: 'settings' as TabType, name: '⚙️ Настройки', description: 'Конфигурация системы' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow">
        <div className="container mx-auto">
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
                className="btn btn-danger"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Статус сервисов */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-gray-600 mb-4">React + Vite (порт 5173)</p>
              <a 
                href="http://localhost:5173" 
                target="_blank"
                className="btn btn-primary w-full text-center"
              >
                Открыть →
              </a>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Backend API</h3>
              <p className="text-gray-600 mb-4">Express API (порт 3001)</p>
              <a 
                href="http://localhost:3001/api/health" 
                target="_blank"
                className="btn btn-success w-full text-center"
              >
                Health Check →
              </a>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Admin Panel</h3>
              <p className="text-gray-600 mb-4">Next.js (порт 3000)</p>
              <div className="status-active">
                ✅ Активна
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Боковая навигация */}
          <aside className="w-64">
            <div className="card">
              <div className="card-body">
                <h2 className="font-semibold mb-4">Навигация</h2>
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
            </div>
          </aside>

          {/* Основной контент */}
          <main className="flex-1">
            <div className="card">
              <div className="card-body">
                {/* Вкладка Агенты */}
                {activeTab === 'agents' && <AgentsTab />}
                
                {/* Вкладка Настройки */}
                {activeTab === 'settings' && <SettingsTab />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
