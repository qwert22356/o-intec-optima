import { LLMServiceConfig, ModelConfig } from './types';

export const DEFAULT_MODELS: ModelConfig[] = [
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

export const DEFAULT_CONFIG: LLMServiceConfig = {
  endpoint: import.meta.env.VITE_LLM_API_URL || 'http://localhost:8000',
  modelConfigs: DEFAULT_MODELS,
  defaultModel: 'Phi-1.5',
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

// 模型能力配置
export const MODEL_CAPABILITIES = {
  'Phi-1.5': {
    maxTokens: 2048,
    supportedTasks: ['text-generation', 'question-answering'] as const,
    contextWindow: 2048,
  },
  'TinyLLaMA-1.1B': {
    maxTokens: 2048,
    supportedTasks: ['text-generation', 'question-answering'] as const,
    contextWindow: 2048,
  },
  'GPT-4': {
    maxTokens: 8192,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 8192,
  },
  'GPT-4 Turbo': {
    maxTokens: 128000,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 128000,
  },
  'Claude-3 Sonnet': {
    maxTokens: 200000,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 200000,
  },
  'Claude-3.7': {
    maxTokens: 200000,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 200000,
  },
  'DeepSeek-R1': {
    maxTokens: 32768,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 32768,
  },
  'DeepSeek-V3': {
    maxTokens: 32768,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 32768,
  },
  'Gemini 2.0': {
    maxTokens: 32768,
    supportedTasks: ['text-generation', 'question-answering', 'analysis'] as const,
    contextWindow: 32768,
  },
} as const;

// API 端点配置
export const API_ENDPOINTS = {
  local: {
    inference: '/api/llm/inference',
    health: '/api/llm/health',
    models: '/api/llm/models'
  },
  remote: {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    deepseek: 'https://api.deepseek.com/v1',
    gemini: 'https://generativelanguage.googleapis.com/v1',
  },
} as const;

// 系统提示词模板
export const SYSTEM_PROMPTS = {
  default: `你是一个专业的光模块运维助手，擅长分析光模块状态、日志和告警信息。
你的回答应该：
1. 准确、专业，使用标准的光通信术语
2. 简洁明了，重点突出
3. 在适当的时候给出具体的建议
4. 对于不确定的情况，说明可能的原因和验证方法`,
  
  statusAnalysis: `分析光模块状态时，请关注以下方面：
1. 温度是否在正常范围内（通常0-70°C）
2. 收发光功率是否在模块规格范围内
3. 是否有错误计数增加
4. 是否存在链路抖动
5. 与历史数据相比是否有异常变化`,
  
  logAnalysis: `分析日志时，请：
1. 按时间顺序组织信息
2. 对告警进行分类（错误、警告、信息）
3. 识别可能的根本原因
4. 关联分析多个告警之间的关系
5. 提供具体的处理建议`,
  
  troubleshooting: `故障诊断时，请遵循以下步骤：
1. 确认故障现象和影响范围
2. 收集相关的状态和日志信息
3. 分析可能的原因，从最常见到最罕见
4. 提供排查步骤，从简单到复杂
5. 建议预防措施`,
} as const; 