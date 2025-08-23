/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ControlTray from './components/console/control-tray/ControlTray';
import ErrorScreen from './components/demo/ErrorSreen';
import KeynoteCompanion from './components/demo/keynote-companion/KeynoteCompanion';
import Header from './components/Header';
import UserSettings from './components/UserSettings';
import DataInitializer from './components/DataInitializer';
import { ModeSelector, InteractionMode } from './components/ModeSelector';
import { TextChat } from './components/TextChat';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useUI, useAgent } from './lib/state';
import { api } from './lib/api-client';
import { useState, useEffect } from 'react';

// API client (uses Vite env var at build/runtime, falls back to localhost for dev)
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

// Функция для получения настроек
async function fetchApiKey() {
  try {
    const response = await fetch(`${API_BASE_URL}/public/apikey`);
    if (!response.ok) throw new Error('Failed to fetch API key');
    const data = await response.json();
    return data.apiKey || '';
  } catch (error) {
    console.error('Error fetching API key:', error);
    return '';
  }
}

/**
 * Main application component that provides a streaming interface for Live API.
 * Manages video streaming state and provides controls for webcam/screen capture.
 */
function App() {
  const { showUserConfig, isFirstTime, setShowUserConfig, setIsFirstTime } = useUI();
  const { current, setCurrent, setAvailableAgents } = useAgent();
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('audio');

  // Show user settings modal on first time
  useEffect(() => {
    if (isFirstTime && !loading && !error) {
      setShowUserConfig(true);
    }
  }, [isFirstTime, loading, error, setShowUserConfig]);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setLoading(true);
        setError(null);
        const key = await fetchApiKey();
        
        if (!key) {
          setError('API ключ не настроен в админ панели');
        } else {
          setApiKey(key);
        }
      } catch (err) {
        console.error('Failed to load API key:', err);
        setError('Не удалось загрузить настройки');
      } finally {
        setLoading(false);
      }
    };

    loadApiKey();
  }, []);

  // Load agents from database when API key is available
  useEffect(() => {
    const loadAgentsFromDatabase = async () => {
      try {
        const agentsList = await api.getAgents();
        
        // Convert database agents to frontend agent format
        const formattedAgents = agentsList.map(dbAgent => ({
          id: dbAgent.id,
          name: dbAgent.name,
          personality: dbAgent.personality,
          bodyColor: dbAgent.body_color || '#9CCF31',
          voice: (dbAgent.voice as any) || 'Orus',
          avatarUrl: dbAgent.avatar_url
        }));
        
        // Set agents in state
        setAvailableAgents(formattedAgents);
        
      } catch (err) {
        console.error('Failed to load agents from database:', err);
      }
    };

    if (apiKey) {
      loadAgentsFromDatabase();
    }
  }, [apiKey, setAvailableAgents]);

  const handleSendMessage = async (message: string, agentId: string) => {
    return await api.sendMessage(agentId, message);
  };

  // Show loading state while fetching API key
  if (loading) {
    return (
      <div className="App">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка конфигурации...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if API key couldn't be loaded
  if (error || !apiKey) {
    return (
      <div className="App">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Настройки не найдены</h2>
              <p className="text-red-600 mb-4">{error || 'API ключ не настроен'}</p>
              <p className="text-gray-600 mb-4">Настройте Gemini API ключ в админ панели:</p>
              <a 
                href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:3000'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Открыть админ панель
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <DataInitializer>
        <LiveAPIProvider apiKey={apiKey}>
          <ErrorScreen />
          <Header />
          {showUserConfig && (
            <UserSettings 
              selectedMode={interactionMode}
              onModeChange={setInteractionMode}
              isFirstTime={isFirstTime}
            />
          )}
          
          <div className="streaming-console">
            <main>
              <div className="main-app-area">
                {interactionMode === 'audio' ? (
                  <KeynoteCompanion />
                ) : (
                  <TextChat
                    agentId={current.id}
                    agentName={current.name}
                    onSendMessage={handleSendMessage}
                  />
                )}
              </div>
              {interactionMode === 'audio' && <ControlTray />}
            </main>
          </div>
        </LiveAPIProvider>
      </DataInitializer>
      <div className="app-footer">
        <a href="https://sdh.global" target="_blank" rel="noopener noreferrer">
          <img
            src="https://sdh.global/s/1-44-1/img/logo.svg"
            alt="SDH Global Logo"
            className="footer-logo"
          />
        </a>
        <p>
          SDH Global: A community of software engineers helping startups
          succeed. Learn more at{' '}
          <a
            href="https://sdh.global"
            target="_blank"
            rel="noopener noreferrer"
          >
            sdh.global
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default App;
