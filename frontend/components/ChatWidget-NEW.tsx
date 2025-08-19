import React, { useState, useEffect, useRef } from 'react';
import { LiveAPIProviderWidget } from '../contexts/LiveAPIContextWidget';
import { useLiveAPIContextWidget } from '../contexts/LiveAPIContextWidget';
import BasicFaceWidget from './demo/basic-face/BasicFaceWidget';
import './ChatWidget.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  agentId: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
  placeholder?: string;
  primaryColor?: string;
  apiUrl?: string;
  geminiApiKey?: string;
}

type DialogMode = 'text' | 'voice' | null;

// Voice Chat Component
const VoiceChatWidget: React.FC<{ agent: any }> = ({ agent }) => {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    client,
    connected,
    connect,
    disconnect,
    setConfig,
    volume
  } = useLiveAPIContextWidget();

  useEffect(() => {
    if (agent && !connected) {
      console.log('🎤 Widget: Setting up voice config for agent:', agent.name);
      
      const voiceConfig = {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          candidateCount: 1,
          maxOutputTokens: 8192,
          temperature: 0.9,
          topK: 16,
          topP: 0.95,
        },
        systemInstruction: {
          role: 'user',
          parts: [
            {
              text: `${agent.personality || 'You are a helpful AI assistant.'}\n\nPLEASE KEEP RESPONSES VERY SHORT AND CONVERSATIONAL. This is a voice chat, so speak naturally and briefly like in a real conversation.`
            }
          ]
        },
        tools: [
          { googleSearch: {} }
        ],
      };
      
      setConfig(voiceConfig);
    }
  }, [agent, connected, setConfig]);

  const handleVoiceToggle = async () => {
    try {
      if (connected && isListening) {
        console.log('🔇 Widget: Stopping voice chat');
        setIsListening(false);
        await disconnect();
      } else if (!connected) {
        console.log('🎤 Widget: Starting voice chat');
        setIsConnecting(true);
        setIsListening(true);
        await connect();
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('❌ Widget: Voice error:', error);
      setIsConnecting(false);
      setIsListening(false);
    }
  };

  return (
    <div className="voice-chat-widget">
      <div className="voice-header">
        <h4>🎤 Voice Chat with {agent?.name || 'AI Assistant'}</h4>
        <p>Click the speaking emoji to start talking!</p>
      </div>
      
      <div className="voice-face-container">
        <BasicFaceWidget
          canvasRef={canvasRef}
          radius={50}
          color="#007bff"
          isActive={connected && volume > 0}
        />
      </div>
      
      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''} ${isConnecting ? 'connecting' : ''}`}
          onClick={handleVoiceToggle}
          disabled={isConnecting}
        >
          {isConnecting ? (
            '⏳'
          ) : connected && isListening ? (
            '🔇'
          ) : (
            '🎤'
          )}
        </button>
        <div className="voice-status">
          {isConnecting ? (
            'Connecting...'
          ) : connected && isListening ? (
            'Listening... Click to stop'
          ) : (
            'Click to start voice chat'
          )}
        </div>
      </div>
      
      {volume > 0 && (
        <div className="volume-indicator">
          <div 
            className="volume-bar" 
            style={{ width: `${Math.min(volume * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

const ChatWidget: React.FC<ChatWidgetProps> = ({
  agentId,
  theme = 'light',
  position = 'bottom-right',
  title = 'AI Assistant',
  placeholder = 'Type your message...',
  primaryColor = '#007bff',
  apiUrl = 'http://localhost:3001',
  geminiApiKey
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get Gemini API key from URL params if not provided
  const getGeminiApiKey = () => {
    if (geminiApiKey) return geminiApiKey;
    
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get('geminiApiKey');
    if (keyFromUrl) return keyFromUrl;
    
    // Try to get from parent window
    if (window.parent !== window) {
      try {
        const parentParams = new URLSearchParams(window.parent.location.search);
        return parentParams.get('geminiApiKey') || 'demo-key';
      } catch (e) {
        return 'demo-key';
      }
    }
    
    return 'demo-key';
  };

  // Load agent configuration
  useEffect(() => {
    const loadAgent = async () => {
      try {
        if (agentId) {
          // Try to load specific agent
          const response = await fetch(`${apiUrl}/api/agents/${agentId}`);
          if (response.ok) {
            const agentData = await response.json();
            setAgent(agentData);
            return;
          }
        }
        
        // Fallback: load first available agent
        const response = await fetch(`${apiUrl}/api/public/agents`);
        if (response.ok) {
          const agents = await response.json();
          if (agents && agents.length > 0) {
            setAgent(agents[0]); // Use first available agent
          } else {
            // Create default agent if none available
            setAgent({
              id: 'default',
              name: title || 'AI Assistant',
              personality: 'I am a helpful AI assistant.',
              description: 'How can I help you today?'
            });
          }
        }
      } catch (error) {
        console.error('Failed to load agent:', error);
        // Create default agent on error
        setAgent({
          id: 'default',
          name: title || 'AI Assistant',
          personality: 'I am a helpful AI assistant.',
          description: 'How can I help you today?'
        });
      }
    };

    loadAgent();
  }, [agentId, apiUrl, title]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  const startDialog = (mode: DialogMode) => {
    setDialogMode(mode);
    setShowIntroduction(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          agentId: agent?.id || agentId || 'default'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Widget UI
  const widgetContent = (
    <div className={`chat-widget ${theme} ${position}`}>
      {/* Toggle Button */}
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="agent-info">
            <div className="agent-avatar large">
              {agent?.name ? agent.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h3>{agent?.name || title}</h3>
              <div className="status">Online</div>
            </div>
          </div>
          <button 
            className="close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Introduction Screen */}
        {showIntroduction && (
          <div className="introduction-screen">
            <div className="agent-avatar large">
              {agent?.name ? agent.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <h4>Hi! I'm {agent?.name || title}</h4>
            <p>{agent?.description || 'I\'m here to help you. How would you like to communicate?'}</p>
            
            <div className="mode-selection">
              <h5>Choose communication mode:</h5>
              <div className="mode-buttons">
                <button
                  className="mode-button text-mode"
                  onClick={() => startDialog('text')}
                >
                  <div className="mode-icon">💬</div>
                  <div className="mode-info">
                    <strong>Text Chat</strong>
                    <span>Type your messages</span>
                  </div>
                </button>
                
                <button
                  className="mode-button voice-mode"
                  onClick={() => startDialog('voice')}
                >
                  <div className="mode-icon">🎤</div>
                  <div className="mode-info">
                    <strong>Voice Chat</strong>
                    <span>Speak naturally</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {!showIntroduction && dialogMode === 'text' && (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isUser ? 'user' : 'assistant'}`}
                >
                  {!message.isUser && (
                    <div className="message-avatar">
                      {agent?.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    {agent?.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!showIntroduction && dialogMode === 'voice' && (
            <VoiceChatWidget agent={agent} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!showIntroduction && dialogMode === 'text' && (
          <div className="chat-input">
            <div className="mode-indicator">
              <span className="mode-badge text">💬 Text Mode</span>
              <button 
                className="switch-mode"
                onClick={() => setShowIntroduction(true)}
                title="Switch mode"
              >
                🔄
              </button>
            </div>
            
            <div className="input-container">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
          </div>
        )}

        {!showIntroduction && dialogMode === 'voice' && (
          <div className="chat-input">
            <div className="mode-indicator">
              <span className="mode-badge voice">🎤 Voice Mode</span>
              <button 
                className="switch-mode"
                onClick={() => setShowIntroduction(true)}
                title="Switch mode"
              >
                🔄
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="chat-footer">
          <span>Powered by SDH AI Assistant</span>
        </div>
      </div>
    </div>
  );

  // Wrap with LiveAPI provider if voice is used
  const apiKey = getGeminiApiKey();
  
  return (
    <LiveAPIProviderWidget apiKey={apiKey}>
      {widgetContent}
    </LiveAPIProviderWidget>
  );
};

export default ChatWidget;
