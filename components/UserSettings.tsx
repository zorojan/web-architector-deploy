/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import Modal from './Modal';
import { useUI, useUser } from '@/lib/state';

export default function UserSettings() {
  const { name, info, setName, setInfo } = useUser();
  const { setShowUserConfig } = useUI();

  function updateClient() {
    setShowUserConfig(false);
  }

  return (
    <Modal onClose={() => setShowUserConfig(false)}>
      <div className="userSettings">
        <p>
          Welcome to the <strong>SDH Global AI Assistant</strong>. We are a
          global community of software engineers, dedicated to helping startups
          and product companies succeed.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            setShowUserConfig(false);
            updateClient();
          }}
        >
          <p>
            Adding this optional info makes the experience more personalized:
          </p>

          <div>
            <p>Your name</p>
            <input
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Jane Doe, CEO of Starlight Inc."
            />
          </div>

          <div>
            <p>Your info</p>
            <textarea
              rows={3}
              name="info"
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder="e.g., We're a fintech startup looking to build an MVP. Our team uses React and Node.js."
            />
          </div>

          <button className="button primary">Let’s go!</button>
        </form>
      </div>
    </Modal>
  );
}
