import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { agentsAPI } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  description?: string;
  personality?: string;
}

interface WidgetConfig {
  agentId: string;
  theme: 'light' | 'dark';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title: string;
  placeholder: string;
  primaryColor: string;
  apiUrl: string;
}

const WidgetGenerator: React.FC = () => {
  // Ensure the query function returns Promise<any[]> so `agents` is typed as an array
  const { data: agents = [], isLoading } = useQuery<any[], Error>(
    ['agents'],
    () => agentsAPI.getAll() as Promise<any[]>
  );
  const [config, setConfig] = useState<WidgetConfig>({
    agentId: '',
    theme: 'light',
    position: 'bottom-right',
    title: 'AI Assistant',
    placeholder: 'Type your message...',
    primaryColor: '#007bff',
    apiUrl: process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:3001'
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-select first agent when agents are loaded
  useEffect(() => {
    if (Array.isArray(agents) && agents.length > 0 && !config.agentId) {
      setConfig(prev => ({ ...prev, agentId: (agents[0] as any).id }));
    }
  }, [agents, config.agentId]);

  const generateWidgetCode = () => {
    const selectedAgent = agents.find((agent: Agent) => agent.id === config.agentId);
    const title = config.title || selectedAgent?.name || 'AI Assistant';
    
    const params = new URLSearchParams({
      agentId: config.agentId,
      theme: config.theme,
      position: config.position,
      title: title,
      placeholder: config.placeholder,
      primaryColor: config.primaryColor,
      apiUrl: config.apiUrl
    });

  const widgetBase = process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:5173'
  const iframeUrl = `${widgetBase.replace(/\/$/, '')}/widget.html?${params.toString()}`;
    
    const code = `<!-- SDH AI Assistant Widget -->
<iframe
  src="${(process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:5173').replace(/\/$/, '')}/widget.html?${params.toString()}"
  width="400"
  height="600"
  frameborder="0"
  style="position: fixed; ${config.position.includes('bottom') ? 'bottom' : 'top'}: 20px; ${config.position.includes('right') ? 'right' : 'left'}: 20px; z-index: 9999; border-radius: 12px; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);"
  title="${title}"
  allow="microphone">
</iframe>`;

    setGeneratedCode(code);
  };

  const generateScriptCode = () => {
    const selectedAgent = agents.find((agent: Agent) => agent.id === config.agentId);
    const title = config.title || selectedAgent?.name || 'AI Assistant';
    
  const code = `<!-- SDH AI Assistant Widget Script -->
<script>
(function() {
  var config = {
    agentId: '${config.agentId}',
    theme: '${config.theme}',
    position: '${config.position}',
    title: '${title}',
    placeholder: '${config.placeholder}',
    primaryColor: '${config.primaryColor}',
  apiUrl: '${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : config.apiUrl}'
  };
  
  var iframe = document.createElement('iframe');
  var params = new URLSearchParams(config);
  iframe.src = '${(process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:5173').replace(/\/$/, '')}/widget.html?' + params.toString();
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

    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const updateConfig = (key: keyof WidgetConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const previewWidget = () => {
    const selectedAgent = agents.find((agent: Agent) => agent.id === config.agentId);
    const title = config.title || selectedAgent?.name || 'AI Assistant';
    
    const params = new URLSearchParams({
      agentId: config.agentId,
      theme: config.theme,
      position: config.position,
      title: title,
      placeholder: config.placeholder,
      primaryColor: config.primaryColor,
      apiUrl: config.apiUrl
    });

  const previewUrl = `${(process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:5173').replace(/\/$/, '')}/widget.html?${params.toString()}`;
    window.open(previewUrl, '_blank', 'width=400,height=600');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Widget Generator</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Configuration</h3>
            
            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={config.agentId}
                onChange={(e) => updateConfig('agentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an agent...</option>
                {agents.map((agent: Agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={config.theme}
                onChange={(e) => updateConfig('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={config.position}
                onChange={(e) => updateConfig('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="AI Assistant"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Placeholder
              </label>
              <input
                type="text"
                value={config.placeholder}
                onChange={(e) => updateConfig('placeholder', e.target.value)}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => updateConfig('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => updateConfig('primaryColor', e.target.value)}
                  placeholder="#007bff"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* API URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="text"
                value={config.apiUrl}
                onChange={(e) => updateConfig('apiUrl', e.target.value)}
                placeholder="http://localhost:3001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={previewWidget}
                disabled={!config.agentId}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Preview
              </button>
              <button
                onClick={generateWidgetCode}
                disabled={!config.agentId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Generate Iframe
              </button>
              <button
                onClick={generateScriptCode}
                disabled={!config.agentId}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Generate Script
              </button>
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Generated Code</h3>
            
            {generatedCode ? (
              <div className="relative">
                <textarea
                  value={generatedCode}
                  readOnly
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="h-96 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center text-gray-500">
                Select an agent and click "Generate" to see the code
              </div>
            )}

            {generatedCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Installation Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Copy the generated code above</li>
                  <li>2. Paste it into your website's HTML</li>
                  <li>3. The widget will appear in the selected position</li>
                  <li>4. Users can interact with your AI agent</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default WidgetGenerator;
