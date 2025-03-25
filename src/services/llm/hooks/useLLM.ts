import { useState, useEffect, useCallback } from 'react';
import type { Message, ModelConfig, LLMResponse } from '../types';
import { DEFAULT_CONFIG, API_ENDPOINTS, SYSTEM_PROMPTS } from '../config';

interface UseLLMOptions {
  onError?: (error: Error) => void;
}

interface UseLLMReturn {
  messages: Message[];
  isProcessing: boolean;
  currentModel: string;
  modelConfigs: ModelConfig[];
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  updateModelConfig: (name: string, field: 'enabled' | 'apiKey', value: boolean | string) => void;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

const DEFAULT_MODEL_CONFIGS: ModelConfig[] = [
  { type: 'local', name: 'Phi-1.5', enabled: true },
  { type: 'local', name: 'TinyLLaMA-1.1B', enabled: false },
  { type: 'remote', name: 'GPT-4', apiKey: '', enabled: false },
  { type: 'remote', name: 'GPT-4 Turbo', apiKey: '', enabled: false },
  { type: 'remote', name: 'Claude-3 Sonnet', apiKey: '', enabled: false },
  { type: 'remote', name: 'Claude-3.7', apiKey: '', enabled: false },
  { type: 'remote', name: 'DeepSeek-R1', apiKey: '', enabled: false },
  { type: 'remote', name: 'DeepSeek-V3', apiKey: '', enabled: false },
  { type: 'remote', name: 'Gemini 2.0', apiKey: '', enabled: false },
];

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: '你好！我是OptiSmart助手。我可以帮助你：\n- 分析模块状态和日志\n- 解释告警信息\n- 提供运维建议\n\n示例问题：\n1. "Ethernet48最近怎么样？"\n2. "汇总一下昨天所有模块异常日志"\n3. "Rx功率下降一般是什么原因？"',
  timestamp: new Date().toISOString(),
  model: 'Phi-1.5'
};

export function useLLM({ onError }: UseLLMOptions = {}): UseLLMReturn {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModel, setCurrentModel] = useState(DEFAULT_CONFIG.defaultModel);
  const [modelConfigs, setModelConfigs] = useState(DEFAULT_CONFIG.modelConfigs);
  const [error, setError] = useState<Error | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load saved model configs from localStorage
    const savedConfigs = localStorage.getItem('modelConfigs');
    if (savedConfigs) {
      try {
        const configs = JSON.parse(savedConfigs);
        setModelConfigs(configs);
        // Set current model to the first enabled model
        const enabledModel = configs.find((config: ModelConfig) => config.enabled);
        if (enabledModel) {
          setCurrentModel(enabledModel.name);
        }
      } catch (e) {
        console.error('Failed to load model configs:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save model configs to localStorage
    localStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
  }, [modelConfigs]);

  const updateModelConfig = useCallback((name: string, field: 'enabled' | 'apiKey', value: boolean | string) => {
    setModelConfigs(prev => prev.map(config => {
      if (config.name === name) {
        if (field === 'enabled' && value === true) {
          setCurrentModel(name);
        }
        return { ...config, [field]: value };
      }
      if (field === 'enabled' && value === true) {
        return { ...config, enabled: false };
      }
      return config;
    }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setError(null);
    setLastUserMessage(content);

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    let retryCount = 0;
    const maxRetries = DEFAULT_CONFIG.maxRetries;

    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);

        const response = await fetch(`${DEFAULT_CONFIG.endpoint}${API_ENDPOINTS.local.inference}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            model: currentModel,
            systemPrompt: SYSTEM_PROMPTS.default
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP error! status: ${response.status}${
              errorData.error ? ` - ${errorData.error}` : ''
            }`
          );
        }

        const data: LLMResponse = await response.json();
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content,
          timestamp: data.timestamp,
          model: data.model
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        break; // 成功后退出重试循环
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Unknown error occurred');
        
        if (retryCount === maxRetries) {
          setError(error);
          onError?.(error);
          // 添加错误消息到对话中
          const errorMessage: Message = {
            role: 'system',
            content: `发生错误: ${error.message}\n您可以:\n1. 检查网络连接\n2. 确认服务器是否正常运行\n3. 点击"重试"按钮重新发送消息`,
            timestamp: new Date().toISOString(),
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          console.warn(`Attempt ${retryCount + 1} failed, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // 指数退避
        }
        retryCount++;
      }
    }

    setIsProcessing(false);
  }, [currentModel, onError]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setLastUserMessage(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  return {
    messages,
    isProcessing,
    currentModel,
    modelConfigs,
    error,
    sendMessage,
    updateModelConfig,
    clearMessages,
    retryLastMessage,
  };
} 