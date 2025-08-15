import React from 'react';
import './ModeSelector.css';

export type InteractionMode = 'audio' | 'text';

interface ModeSelectorProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h3>Choose Interaction Mode</h3>
      <div className="mode-options">
        <button
          className={`mode-button ${mode === 'audio' ? 'active' : ''}`}
          onClick={() => onModeChange('audio')}
        >
          <div className="mode-icon">🎤</div>
          <div className="mode-label">Voice Chat</div>
          <div className="mode-description">Talk with AI using voice</div>
        </button>
        
        <button
          className={`mode-button ${mode === 'text' ? 'active' : ''}`}
          onClick={() => onModeChange('text')}
        >
          <div className="mode-icon">💬</div>
          <div className="mode-label">Text Chat</div>
          <div className="mode-description">Chat with AI using text messages</div>
        </button>
      </div>
    </div>
  );
}
