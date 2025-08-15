import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './TextChat.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface TextChatProps {
  agentId: string;
  agentName: string;
  onSendMessage: (message: string, agentId: string) => Promise<string>;
}

export function TextChat({ agentId, agentName, onSendMessage }: TextChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage.text, agentId);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('503')) {
          errorText = '🚫 API service temporarily unavailable. This usually means the API quota has been exceeded. Please try again later.';
        } else if (error.message.includes('429')) {
          errorText = '⏰ Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('401')) {
          errorText = '🔑 Invalid API key. Please check the configuration in admin panel.';
        } else if (error.message.includes('400')) {
          errorText = '⚠️ Invalid request. Please check your message and try again.';
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-chat">
      <div className="chat-header">
        <h3>💬 Chat with {agentName}</h3>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Hello! I'm {agentName}. How can I help you today?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'agent-message'}`}
          >
            <div className="message-content">
              <div className="message-text">
                {message.sender === 'agent' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message agent-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type your message to ${agentName}...`}
          disabled={isLoading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}
