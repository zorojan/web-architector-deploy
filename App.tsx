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

import { useState, useEffect } from 'react';
import StateResetter from './components/StateResetter';
import ControlTray from './components/console/control-tray/ControlTray';
import ErrorScreen from './components/demo/ErrorSreen';
import KeynoteCompanion from './components/demo/keynote-companion/KeynoteCompanion';
import Header from './components/Header';
import UserSettings from './components/UserSettings';
import DataInitializer from './components/DataInitializer';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useUI } from './lib/state';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Main application component that provides a streaming interface for Live API.
 * Manages video streaming state and provides controls for webcam/screen capture.
 */
function App() {
  const { showUserConfig } = useUI();
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем API ключ при старте
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/apikey`);
        if (!response.ok) {
          throw new Error('Failed to fetch API key from server');
        }
        const data = await response.json();
        if (!data.apiKey) {
          throw new Error('API key not configured on server');
        }
        setApiKey(data.apiKey);
      } catch (err) {
        console.error('Error fetching API key:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKey();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column' 
        }}>
          <h2>Loading...</h2>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (error || !apiKey) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Configuration Required</h2>
          <p>{error || 'API key not available'}</p>
          <p>Please configure the API key in the admin panel at:</p>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
            http://localhost:3000
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="App">
      <StateResetter />
      <DataInitializer>
        <LiveAPIProvider apiKey={apiKey}>
          <ErrorScreen />
          <Header />

          {showUserConfig && <UserSettings />}
          
          {/* Debug Panel */}
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 1000
          }}>
            <div>API Key: {apiKey ? '✅' : '❌'}</div>
            <div>UserConfig: {showUserConfig ? '✅' : '❌'}</div>
          </div>
          
          <div className="streaming-console">
            <main>
              <div className="main-app-area">
                <KeynoteCompanion />
              </div>

              <ControlTray></ControlTray>
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