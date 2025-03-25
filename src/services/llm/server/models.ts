import { ModelInfo } from './types.js';
import { MODEL_CAPABILITIES } from '../config.js';

// TODO: Add @xenova/transformers to package.json
// import { pipeline } from '@xenova/transformers';
const pipeline = async (task: string, model: string) => {
  // Mock implementation
  return {
    generate: async (text: string, options: any) => [{
      generated_text: `Mock response for ${model} with prompt: ${text}`
    }]
  };
};

class ModelManager {
  private models: Map<string, any> = new Map();
  private modelStatus: Map<string, ModelInfo> = new Map();

  constructor() {
    // 初始化本地模型状态
    this.initializeModels();
  }

  private async initializeModels() {
    // 初始化 Phi-1.5
    this.modelStatus.set('Phi-1.5', {
      name: 'Phi-1.5',
      type: 'local',
      status: 'loading',
      capabilities: {
        maxTokens: MODEL_CAPABILITIES['Phi-1.5'].maxTokens,
        supportedTasks: [...MODEL_CAPABILITIES['Phi-1.5'].supportedTasks],
        contextWindow: MODEL_CAPABILITIES['Phi-1.5'].contextWindow,
      },
    });

    try {
      const phi = await pipeline('text-generation', 'microsoft/phi-1_5');
      this.models.set('Phi-1.5', phi);
      this.updateModelStatus('Phi-1.5', 'ready');
    } catch (error) {
      console.error('Failed to load Phi-1.5:', error);
      this.updateModelStatus('Phi-1.5', 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    // 初始化 TinyLLaMA
    this.modelStatus.set('TinyLLaMA-1.1B', {
      name: 'TinyLLaMA-1.1B',
      type: 'local',
      status: 'loading',
      capabilities: {
        maxTokens: MODEL_CAPABILITIES['TinyLLaMA-1.1B'].maxTokens,
        supportedTasks: [...MODEL_CAPABILITIES['TinyLLaMA-1.1B'].supportedTasks],
        contextWindow: MODEL_CAPABILITIES['TinyLLaMA-1.1B'].contextWindow,
      },
    });

    try {
      const llama = await pipeline('text-generation', 'TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T');
      this.models.set('TinyLLaMA-1.1B', llama);
      this.updateModelStatus('TinyLLaMA-1.1B', 'ready');
    } catch (error) {
      console.error('Failed to load TinyLLaMA:', error);
      this.updateModelStatus('TinyLLaMA-1.1B', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private updateModelStatus(
    modelName: string,
    status: 'ready' | 'loading' | 'error',
    lastError?: string
  ) {
    const modelInfo = this.modelStatus.get(modelName);
    if (modelInfo) {
      modelInfo.status = status;
      if (lastError) {
        modelInfo.lastError = lastError;
      } else {
        delete modelInfo.lastError;
      }
    }
  }

  public async generateText(
    model: string,
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    const pipeline = this.models.get(model);
    if (!pipeline) {
      throw new Error(`Model not loaded: ${model}`);
    }

    try {
      const result = await pipeline.generate(prompt, {
        max_new_tokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        do_sample: true,
      });

      return result[0].generated_text;
    } catch (error) {
      console.error(`Generation failed for ${model}:`, error);
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getModelInfo(modelName: string): ModelInfo | undefined {
    return this.modelStatus.get(modelName);
  }

  public getAllModelInfo(): ModelInfo[] {
    return Array.from(this.modelStatus.values());
  }

  public isModelReady(modelName: string): boolean {
    return this.modelStatus.get(modelName)?.status === 'ready';
  }
}

export const modelManager = new ModelManager(); 