'use client';

import { useState, useEffect } from 'react';

export default function WidgetTab() {
  const [copySuccess, setCopySuccess] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [config, setConfig] = useState({
    agentId: 'ai-advisor',
    theme: 'light',
    position: 'bottom-right',
    title: 'AI Assistant',
    placeholder: 'Type your message...',
    primaryColor: '#007bff',
    apiUrl: 'http://localhost:3001',
    widgetUrl: 'http://localhost:5173'
  });

  // Load available agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/public/agents`);
        if (response.ok) {
          const agentsData = await response.json();
          setAgents(agentsData);
          
          // Set first agent as default if current agentId is not valid
          if (agentsData.length > 0 && !agentsData.find((agent: any) => agent.id === config.agentId)) {
            setConfig(prev => ({ ...prev, agentId: agentsData[0].id }));
          }
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
      }
    };

    loadAgents();
  }, [config.apiUrl]);

  const generateWidgetCode = () => {
    return `<script>
(function() {
  var config = {
    agentId: '${config.agentId}',
    theme: '${config.theme}',
    position: '${config.position}',
    title: '${config.title}',
    placeholder: '${config.placeholder}',
    primaryColor: '${config.primaryColor}',
    apiUrl: '${config.apiUrl}'
  };
  
  var iframe = document.createElement('iframe');
  var params = new URLSearchParams(config);
  iframe.src = '${config.widgetUrl}/widget.html?' + params.toString();
  iframe.width = '400';
  iframe.height = '600';
  iframe.frameBorder = '0';
  iframe.title = config.title;
  iframe.allow = 'microphone';
  iframe.style.cssText = 'position: fixed; ' + 
    (config.position.includes('bottom') ? 'bottom' : 'top') + ': 20px; ' +
    (config.position.includes('right') ? 'right' : 'left') + ': 20px; ' +
    'z-index: 9999; border-radius: 12px; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);';
  
  document.body.appendChild(iframe);
})();
</script>`;
  };

  const widgetCode = generateWidgetCode();
  const wordpressCode = `[sdh_ai_assistant agentId="${config.agentId}" theme="${config.theme}" position="${config.position}"]`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(`${type} скопирован!`);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🪟 Виджет для вашего сайта
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Встройте AI ассистента на свой сайт с помощью готового виджета. 
          Ваши посетители смогут получать мгновенную помощь от AI.
        </p>
      </div>

      {copySuccess && (
        <div className="alert alert-success">
          ✅ {copySuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* WordPress плагин */}
        <div className="card card-hover">
          <div className="card-header">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
                📦
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">WordPress плагин</h3>
                <p className="text-gray-600">Простая установка для WordPress сайтов</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📋 Инструкция:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Скачайте плагин по кнопке ниже</li>
                  <li>2. Загрузите в WordPress через "Плагины → Добавить новый → Загрузить плагин"</li>
                  <li>3. Активируйте плагин</li>
                  <li>4. Используйте шорткод <code className="bg-gray-200 px-2 py-1 rounded">[sdh_ai_assistant]</code></li>
                </ol>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Шорткод для вставки:</h5>
                <div className="mb-3">
                  <textarea 
                    className="w-full h-20 bg-white px-3 py-2 rounded border text-sm font-mono resize-none"
                    value={wordpressCode}
                    readOnly
                  />
                </div>
                <button 
                  onClick={() => copyToClipboard(wordpressCode, 'Шорткод')}
                  className="btn btn-primary text-sm w-full"
                >
                  📋 Копировать шорткод
                </button>
              </div>

              <div className="flex space-x-3">
                <a 
                  href="/sdh-ai-assistant-wordpress-plugin.zip" 
                  className="btn btn-primary flex-1 text-center"
                  download
                >
                  📦 Скачать плагин
                </a>
                <a 
                  href="https://wordpress.org/support/article/managing-plugins/" 
                  target="_blank"
                  className="btn btn-outline"
                >
                  📚 Помощь
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* HTML виджет */}
        <div className="card card-hover">
          <div className="card-header">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
                🌐
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">HTML виджет</h3>
                <p className="text-gray-600">Для любого сайта или CMS</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📋 Инструкция:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Скопируйте код ниже</li>
                  <li>2. Вставьте перед закрывающим тегом <code>&lt;/body&gt;</code></li>
                  <li>3. Убедитесь, что сервер API доступен</li>
                  <li>4. Виджет появится на всех страницах</li>
                </ol>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-green-900 mb-2">HTML код для вставки:</h5>
                <div className="mb-3">
                  <textarea 
                    className="w-full h-32 bg-white px-3 py-2 rounded border text-xs font-mono resize-none"
                    value={widgetCode}
                    readOnly
                  />
                </div>
                <button 
                  onClick={() => copyToClipboard(widgetCode, 'HTML код')}
                  className="btn btn-success text-sm w-full"
                >
                  📋 Копировать код
                </button>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    const widgetUrl = `${config.widgetUrl}/widget.html?agentId=${config.agentId}&theme=${config.theme}&position=${config.position}&title=${encodeURIComponent(config.title)}&placeholder=${encodeURIComponent(config.placeholder)}&primaryColor=${encodeURIComponent(config.primaryColor)}&apiUrl=${encodeURIComponent(config.apiUrl)}`;
                    window.open(widgetUrl, '_blank', 'width=420,height=620,scrollbars=no,resizable=yes');
                  }}
                  className="btn btn-success flex-1 text-center"
                >
                  👁️ Посмотреть демо
                </button>
                <button 
                  onClick={() => {
                    const widgetJsUrl = `${config.apiUrl}/widget.js`;
                    window.open(widgetJsUrl, '_blank');
                  }}
                  className="btn btn-outline"
                >
                  📄 widget.js
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Настройки виджета */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg mr-3">
              ⚙️
            </div>
            <h3 className="text-xl font-bold text-gray-900">Настройки виджета</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🎨 Внешний вид</h4>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Позиция виджета</label>
                  <select 
                    className="form-select"
                    value={config.position}
                    onChange={(e) => setConfig({...config, position: e.target.value})}
                  >
                    <option value="bottom-right">Справа снизу</option>
                    <option value="bottom-left">Слева снизу</option>
                    <option value="top-right">Справа сверху</option>
                    <option value="top-left">Слева сверху</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Тема</label>
                  <select 
                    className="form-select"
                    value={config.theme}
                    onChange={(e) => setConfig({...config, theme: e.target.value})}
                  >
                    <option value="light">Светлая</option>
                    <option value="dark">Темная</option>
                    <option value="auto">Автоматическая</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Основной цвет</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="color" 
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                    />
                    <input 
                      type="text" 
                      className="form-input flex-1" 
                      value={config.primaryColor}
                      onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                      placeholder="#007bff"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚡ Поведение</h4>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">AI Агент</label>
                  <select 
                    className="form-select"
                    value={config.agentId}
                    onChange={(e) => setConfig({...config, agentId: e.target.value})}
                  >
                    {agents.length > 0 ? (
                      agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} - {agent.personality.substring(0, 50)}...
                        </option>
                      ))
                    ) : (
                      <option value="ai-advisor">Загрузка агентов...</option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Выберите AI агента, который будет отвечать в виджете
                  </p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Заголовок виджета</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.title}
                    onChange={(e) => setConfig({...config, title: e.target.value})}
                    placeholder="AI Assistant"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Текст заполнителя</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.placeholder}
                    onChange={(e) => setConfig({...config, placeholder: e.target.value})}
                    placeholder="Type your message..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">🔗 API URL (Backend)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={config.apiUrl}
                  onChange={(e) => setConfig({...config, apiUrl: e.target.value})}
                  placeholder="http://localhost:3001"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">🌐 Widget URL (Frontend)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={config.widgetUrl}
                  onChange={(e) => setConfig({...config, widgetUrl: e.target.value})}
                  placeholder="http://localhost:5173"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Превью виджета */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-lg mr-3">
                👁️
              </div>
              <h3 className="text-xl font-bold text-gray-900">Предварительный просмотр</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="status-active">Виджет активен</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="bg-gray-100 rounded-xl p-8 min-h-[400px] relative border-2 border-dashed border-gray-300">
            <div className="text-center mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ваш сайт</h4>
              <p className="text-gray-600">Так будет выглядеть виджет на вашем сайте</p>
            </div>

            {/* Симуляция виджета */}
            <div className={`absolute ${config.position.includes('bottom') ? 'bottom-6' : 'top-6'} ${config.position.includes('right') ? 'right-6' : 'left-6'}`}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-80 h-96 overflow-hidden">
                <div style={{background: `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryColor}dd)`}} className="text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        🤖
                      </div>
                      <div>
                        <h5 className="font-semibold">{agents.find(a => a.id === config.agentId)?.name || config.title}</h5>
                        <p className="text-xs opacity-90">Онлайн</p>
                      </div>
                    </div>
                    <button className="text-white/80 hover:text-white">✕</button>
                  </div>
                </div>
                <div className={`p-4 h-64 ${config.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-center`}>
                  <div className="text-center">
                    <div style={{backgroundColor: `${config.primaryColor}20`}} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👋</span>
                    </div>
                    <p className={`text-sm mb-4 ${config.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Привет! Чем могу помочь?
                    </p>
                    <div className="space-y-2">
                      <button className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        config.theme === 'dark' 
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}>
                        💡 Расскажи о компании
                      </button>
                      <button className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        config.theme === 'dark' 
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}>
                        📞 Как с вами связаться?
                      </button>
                      <button className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        config.theme === 'dark' 
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}>
                        🛍️ Какие у вас услуги?
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`p-3 border-t ${config.theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder={config.placeholder}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                        config.theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      disabled
                    />
                    <button 
                      style={{backgroundColor: config.primaryColor}}
                      className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`absolute ${config.position.includes('bottom') ? 'top-6' : 'bottom-6'} ${config.position.includes('right') ? 'left-6' : 'right-6'}`}>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm shadow-lg">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">ℹ️</span>
                  <div>
                    <h5 className="font-medium text-gray-900">Текущие настройки</h5>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li><strong>Позиция:</strong> {config.position}</li>
                      <li><strong>Тема:</strong> {config.theme}</li>
                      <li><strong>Цвет:</strong> {config.primaryColor}</li>
                      <li><strong>Агент:</strong> {agents.find(a => a.id === config.agentId)?.name || config.agentId}</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Изменения сразу отражаются в превью и коде виджета
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
