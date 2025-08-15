/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import Modal from './Modal';
import { useUI, useUser } from '@/lib/state';
import { ModeSelector, InteractionMode } from './ModeSelector';
import { useState } from 'react';

interface UserSettingsProps {
  selectedMode?: InteractionMode;
  onModeChange?: (mode: InteractionMode) => void;
  isFirstTime?: boolean;
}

export default function UserSettings({ selectedMode = 'audio', onModeChange, isFirstTime = false }: UserSettingsProps) {
  const { name, info, setName, setInfo } = useUser();
  const { setShowUserConfig, setIsFirstTime } = useUI();
  const [currentMode, setCurrentMode] = useState<InteractionMode>(selectedMode);

  function handleSubmit(e: any) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const userName = formData.get('name') as string;
    const userInfo = formData.get('info') as string;
    
    // Update state
    setName(userName || 'Гость');
    setInfo(userInfo || 'Пользователь SDH Global AI Assistant');
    
    // Update mode if provided
    if (onModeChange) {
      onModeChange(currentMode);
    }
    
    // Mark as not first time if this is initial setup
    if (isFirstTime) {
      setIsFirstTime(false);
    }
    
    // Close modal
    setShowUserConfig(false);
  }

  function handleModeChange(mode: InteractionMode) {
    setCurrentMode(mode);
  }

  return (
    <Modal onClose={() => setShowUserConfig(false)}>
      <div className="userSettings">
        <p>
          Welcome to the <strong>SDH Global AI Assistant</strong>. We are a
          global community of software engineers, dedicated to helping startups
          and product companies succeed.
        </p>

        <form onSubmit={handleSubmit}>
          <p>
            Adding this optional info makes the experience more personalized:
          </p>

          <div>
            <p>Your name</p>
            <input
              type="text"
              name="name"
              defaultValue={name}
              placeholder="e.g., Jane Doe, CEO of Starlight Inc."
              style={{
                width: '100%',
                padding: '8px',
                margin: '5px 0',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <p>Your info</p>
            <textarea
              rows={3}
              name="info"
              defaultValue={info}
              placeholder="e.g., We're a fintech startup looking to build an MVP. Our team uses React and Node.js."
              style={{
                width: '100%',
                padding: '8px',
                margin: '5px 0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Mode Selection */}
          <div style={{ margin: '20px 0' }}>
            <ModeSelector 
              mode={currentMode} 
              onModeChange={handleModeChange} 
            />
          </div>

          <button type="submit" className="button primary">
            Let's go! 🚀
          </button>
        </form>
      </div>
    </Modal>
  );
}
