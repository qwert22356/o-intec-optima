import React, { useRef } from 'react';
import { Send, Settings, X, AlertCircle, Loader2, Bot, Brain, Key, RotateCcw, Trash2 } from 'lucide-react';
import { useLLM } from '../services/llm';

export default function LLMConsole() {
  const {
    messages,
    isProcessing,
    currentModel,
    modelConfigs,
    error,
    sendMessage,
    updateModelConfig,
    clearMessages,
    retryLastMessage
  } = useLLM({
    onError: (error) => {
      console.error('LLM Error:', error);
    }
  });

  const [input, setInput] = React.useState('');
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">LLM控制台</h2>
          <p className="text-sm text-gray-500">使用自然语言分析光模块状态和日志</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            <Bot className="w-4 h-4 mr-1" />
            {currentModel}
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'assistant' && message.model && (
                <div className="text-xs text-gray-500 mb-1 flex items-center">
                  <Bot className="w-3 h-3 mr-1" />
                  {message.model}
                </div>
              )}
              <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
              <div className="text-xs mt-1 opacity-50">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t space-y-4">
        {error && (
          <div className="flex items-center justify-between bg-red-50 text-red-700 px-4 py-2 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error.message}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={retryLastMessage}
                className="p-1 hover:bg-red-100 rounded"
                title="重试"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => clearMessages()}
                className="p-1 hover:bg-red-100 rounded"
                title="清除历史"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入问题，如：Ethernet48最近怎么样？"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg flex items-center justify-center min-w-[48px] ${
              isProcessing
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">模型设置</h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">本地轻量模型</h4>
                  <div className="space-y-3">
                    {modelConfigs.filter(config => config.type === 'local').map(model => (
                      <div key={model.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Brain className="w-5 h-5 text-gray-500 mr-2" />
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-gray-500">本地推理，无需API Key</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={model.enabled}
                            onChange={(e) => updateModelConfig(model.name, 'enabled', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">云端大模型</h4>
                  <div className="space-y-3">
                    {modelConfigs.filter(config => config.type === 'remote').map(model => (
                      <div key={model.name} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Key className="w-5 h-5 text-gray-500 mr-2" />
                            <div>
                              <div className="font-medium">{model.name}</div>
                              <div className="text-xs text-gray-500">需要API Key</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={model.enabled}
                              onChange={(e) => updateModelConfig(model.name, 'enabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            type="password"
                            placeholder="输入API Key"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            value={model.apiKey}
                            onChange={(e) => updateModelConfig(model.name, 'apiKey', e.target.value)}
                            disabled={!model.enabled}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}