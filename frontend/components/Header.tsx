/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { Agent, createNewAgent } from '@/lib/presets/agents';
import { useAgent, useUI, useUser } from '@/lib/state';
import c from 'classnames';
import { useEffect, useState } from 'react';

export default function Header() {
  const { showUserConfig, setShowUserConfig, setShowAgentEdit, setIsFirstTime } = useUI();
  const { name } = useUser();
  const { current, setCurrent, availablePresets, availablePersonal, addAgent } =
    useAgent();
  const { disconnect } = useLiveAPIContext();

  let [showRoomList, setShowRoomList] = useState(false);

  useEffect(() => {
    addEventListener('click', () => setShowRoomList(false));
    return () => removeEventListener('click', () => setShowRoomList(false));
  }, []);

  function changeAgent(agent: Agent | string) {
    disconnect();
    setCurrent(agent);
  }

  function addNewAssistant() {
    disconnect();
    addAgent(createNewAgent());
    setShowAgentEdit(true);
  }

  return (
    <header>
      <div className="roomInfo">
        <div className="roomName">
          <button
            onClick={e => {
              e.stopPropagation();
              setShowRoomList(!showRoomList);
            }}
          >
            {current.avatarUrl && (
              <img
                src={current.avatarUrl}
                alt={current.name}
                className="current-agent-avatar"
              />
            )}
            <h1 className={c({ active: showRoomList })}>
              {current.name}
              <span className="icon">arrow_drop_down</span>
            </h1>
          </button>

          {/* Кнопка edit удалена по требованию */}
        </div>

        <div className={c('roomList', { active: showRoomList })}>
          <div>
            <h3>Your Assistants</h3>
            {/* Show database agents (stored in availablePresets) */}
            {availablePresets.length > 0 ? (
              <ul>
                {availablePresets.map(agent => (
                  <li
                    key={agent.id}
                    className={c({ active: agent.id === current.id })}
                  >
                    <button onClick={() => changeAgent(agent)}>
                      {agent.avatarUrl && (
                        <img
                          src={agent.avatarUrl}
                          alt={agent.name}
                          className="agent-list-avatar"
                        />
                      )}
                      {agent.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Loading agents from database...</p>
            )}
          </div>
        </div>
      </div>
      <div className="header-actions">
        <button
          onClick={() => {
            setIsFirstTime(true);
            setShowUserConfig(true);
          }}
          className="button secondary"
          style={{ marginRight: '1rem', fontSize: '0.8rem' }}
        >
          🔄 Setup
        </button>
        <a
          href="https://sdh.global/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="button primary"
        >
          Get in touch
        </a>
        <button
          className="userSettingsButton"
          onClick={() => setShowUserConfig(!showUserConfig)}
        >
          <p className="user-name">{name || 'Your Name'}</p>
          <span className="icon">tune</span>
        </button>
      </div>
    </header>
  );
}