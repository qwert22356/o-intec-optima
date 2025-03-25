export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  isError?: boolean;
}

export interface ModelConfig {
  type: 'local' | 'remote';
  name: string;
  enabled: boolean;
  apiKey?: string;
}

export interface ModelCapabilities {
  maxTokens: number;
  supportedTasks: readonly string[];
  contextWindow: number;
}

export interface ModelInfo {
  name: string;
  type: 'local' | 'remote';
  status: 'ready' | 'loading' | 'error';
  capabilities: ModelCapabilities;
  lastError?: string;
}

export interface InferenceRequest {
  message: string;
  model: string;
  systemPrompt?: string;
  context?: {
    status?: Record<string, any>;
    logs?: Array<{
      timestamp: string;
      type: string;
      message: string;
    }>;
  };
}

export interface InferenceResponse {
  content: string;
  model: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'error';
  models: Record<string, {
    status: 'ready' | 'loading' | 'error';
    lastError?: string;
  }>;
  lastCheck: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  timestamp: string;
}

export interface ModuleStatus {
  portName: string;
  temperature: number;
  rxPower: number;
  txPower: number;
  errors: {
    crc: number;
    linkFlaps: number;
  };
  lastUpdate: string;
}

export interface LogEntry {
  timestamp: string;
  portName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: Record<string, any>;
}

export interface LLMServiceConfig {
  endpoint: string;
  modelConfigs: ModelConfig[];
  defaultModel: string;
  maxRetries: number;
  timeout: number;
} 