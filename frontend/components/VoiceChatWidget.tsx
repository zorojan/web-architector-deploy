import React, { useState, useEffect, useRef } from 'react';
import { Modality } from '@google/genai';
import { AudioRecorder } from '../lib/audio-recorder';
import { LiveAPIProviderWidget } from '../contexts/LiveAPIContextWidget';
import { useLiveAPIContextWidget } from '../contexts/LiveAPIContextWidget';
import BasicFaceWidget from './demo/basic-face/BasicFaceWidget';

interface VoiceChatWidgetProps {
  agent: any;
  geminiApiKey: string;
}

// Voice Chat Component (внутри провайдера)
const VoiceChatWidgetInner: React.FC<{ agent: any }> = ({ agent }) => {
  const [muted, setMuted] = useState(true); // Start muted
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    client,
    connected,
    connect,
    disconnect,
    setConfig,
    volume,
    lastError: apiError
  } = useLiveAPIContextWidget();

  useEffect(() => {
    if (agent && !connected) {
      console.log('🎤 Widget: Setting up voice config for agent:', agent.name);
      
      const voiceConfig = {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: agent.voice || 'Orus' },
          },
        },
        systemInstruction: {
          parts: [
            {
              text: `${agent.personality || 'You are a helpful AI assistant.'}\n\nPLEASE KEEP RESPONSES VERY SHORT AND CONVERSATIONAL. This is a voice chat, so speak naturally and briefly like in a real conversation.`
            }
          ]
        }
      };
      
      setConfig(voiceConfig);
    }
  }, [agent, connected, setConfig]);

  // Handle audio recording
  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    
    if (connected && !muted && audioRecorder) {
      console.log('🎤 Widget: Starting audio recording');
      audioRecorder.on('data', onData).start();
    } else {
      console.log('🎤 Widget: Stopping audio recording');
      audioRecorder.stop();
    }
    
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  // Main voice toggle function like in frontend
  const handleVoiceToggle = async () => {
    try {
      if (connected && isListening) {
        console.log('🔇 Widget: Stopping voice chat');
        setIsListening(false);
        setMuted(true);
        await disconnect();
      } else if (!connected) {
        console.log('🎤 Widget: Starting voice chat');
        setIsConnecting(true);
        setIsListening(true);
        await connect();
        // Auto-start voice recording after connection
        setTimeout(() => {
          setMuted(false);
          console.log('🎤 Widget: Voice chat started - ready to listen');
        }, 1000);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('❌ Widget: Voice error:', error);
      setIsConnecting(false);
      setIsListening(false);
      setLastError('Connection failed. Please try again.');
    }
  };

  return (
    <div className="voice-chat-widget">
      <div className="voice-header">
        <h4>🎤 Voice Chat with {agent?.name || 'AI Assistant'}</h4>
        <p>Click the speaking emoji to start talking!</p>
      </div>
      
      {lastError && (
        <div className="voice-error">
          <p>⚠️ {lastError}</p>
        </div>
      )}
      
      <div className="voice-face-container">
        <BasicFaceWidget
          canvasRef={canvasRef}
          radius={80} 
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
