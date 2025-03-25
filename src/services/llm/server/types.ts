import { ModuleStatus, LogEntry } from '../types';

export interface InferenceRequest {
  message: string;
  model: string;
  context?: {
    status?: ModuleStatus;
    logs?: LogEntry[];
  };
  systemPrompt: string;
}

export interface InferenceResponse {
  content: string;
  model: string;
  timestamp: string;
}

export interface ModelInfo {
  name: string;
  type: 'local' | 'remote';
  status: 'ready' | 'loading' | 'error';
  lastError?: string;
  capabilities: {
    maxTokens: number;
    supportedTasks: string[];
    contextWindow: number;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  models: {
    [key: string]: {
      status: 'ready' | 'loading' | 'error';
      lastError?: string;
    };
  };
  lastCheck: string;
} 