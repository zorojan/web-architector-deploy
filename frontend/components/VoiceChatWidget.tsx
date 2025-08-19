import React, { useState, useEffect, useRef } from 'react';
import { LiveAPIProviderWidget } from '../contexts/LiveAPIContextWidget';
import { useLiveAPIContextWidget } from '../contexts/LiveAPIContextWidget';
import BasicFaceWidget from './demo/basic-face/BasicFaceWidget';

interface VoiceChatWidgetProps {
  agent: any;
  geminiApiKey: string;
}

// Voice Chat Component (внутри провайдера)
const VoiceChatWidgetInner: React.FC<{ agent: any }> = ({ agent }) => {
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

// Voice Chat с провайдером
export const VoiceChatWidget: React.FC<VoiceChatWidgetProps> = ({ agent, geminiApiKey }) => {
  console.log('🎤 VoiceChatWidget: Received API key:', geminiApiKey ? `${geminiApiKey.substring(0, 10)}...` : 'undefined');
  
  return (
    <LiveAPIProviderWidget apiKey={geminiApiKey}>
      <VoiceChatWidgetInner agent={agent} />
    </LiveAPIProviderWidget>
  );
};
