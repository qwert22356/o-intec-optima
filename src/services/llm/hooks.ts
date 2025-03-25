import { useState, useCallback, useEffect } from 'react';
import { Message, ModelConfig, LLMResponse } from './types';
import { llmService } from './api';
import { DEFAULT_MODELS } from './config';

interface UseLLMOptions {
  initialModel?: string;
  onError?: (error: Error) => void;
}

export function useLLM(options: UseLLMOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>(options.initialModel || 'Phi-1.5');
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>(DEFAULT_MODELS);
  const [error, setError] = useState<Error | null>(null);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await llmService.processQuery(content, currentModel);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);

      const errorMessage: Message = {
        role: 'assistant',
        content: `错误: ${error.message}`,
        timestamp: new Date().toISOString(),
        model: currentModel
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [currentModel, options.onError]);

  // 更新模型配置
  const updateModelConfig = useCallback((name: string, field: 'enabled' | 'apiKey', value: boolean | string) => {
    setModelConfigs(prev => prev.map(config => {
      if (config.name === name) {
        if (field === 'enabled' && value === true) {
          setCurrentModel(name);
          return { ...config, enabled: true };
        }
        return { ...config, [field]: value };
      }
      if (field === 'enabled' && value === true) {
        return { ...config, enabled: false };
      }
      return config;
    }));

    if (field === 'apiKey') {
      llmService.setApiKey(name, value as string);
    }
  }, []);

  // 清空消息历史
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // 重试上一条消息
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isProcessing,
    currentModel,
    modelConfigs,
    error,
    sendMessage,
    updateModelConfig,
    clearMessages,
    retryLastMessage
  };
} 