/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import Modal from './Modal';
import { useUI, useUser } from '@/lib/state';

export default function UserSettings() {
  const { name, info, setName, setInfo } = useUser();
  const { setShowUserConfig } = useUI();

  function handleSubmit(e: any) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const userName = formData.get('name') as string;
    const userInfo = formData.get('info') as string;
    
    // Update state
    setName(userName);
    setInfo(userInfo);
    
  // alert удалён по требованию
    
    // Close modal
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

  {/* Debug Info удалён по требованию */}

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

          <button type="submit" className="button primary">
            Let's go! 🚀
          </button>
        </form>
      </div>
    </Modal>
  );
}
