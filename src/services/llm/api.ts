import { LLMResponse, Message, ModuleStatus, LogEntry } from './types';
import { API_ENDPOINTS, DEFAULT_CONFIG, SYSTEM_PROMPTS } from './config';
import axios from 'axios';

class LLMService {
  private config = DEFAULT_CONFIG;
  private axiosInstance = axios.create({
    baseURL: this.config.endpoint,
    timeout: this.config.timeout,
  });

  // 设置API密钥
  public setApiKey(model: string, apiKey: string) {
    const modelConfig = this.config.modelConfigs.find(c => c.name === model);
    if (modelConfig) {
      modelConfig.apiKey = apiKey;
    }
  }

  // 获取模块状态
  private async getModuleStatus(portName: string): Promise<ModuleStatus> {
    try {
      const response = await this.axiosInstance.get(`/api/modules/${portName}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch module status:', error);
      throw new Error(`获取模块状态失败: ${portName}`);
    }
  }

  // 获取历史日志
  private async getModuleLogs(portName: string, hours: number = 24): Promise<LogEntry[]> {
    try {
      const response = await this.axiosInstance.get(`/api/modules/${portName}/logs`, {
        params: { hours }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch module logs:', error);
      throw new Error(`获取模块日志失败: ${portName}`);
    }
  }

  // 处理本地模型推理
  private async localInference(
    message: string,
    model: string,
    context: { status?: ModuleStatus; logs?: LogEntry[] }
  ): Promise<LLMResponse> {
    try {
      const response = await this.axiosInstance.post(API_ENDPOINTS.local.inference, {
        message,
        model,
        context,
        systemPrompt: this.getSystemPrompt(message),
      });
      
      return {
        content: response.data.content,
        model: model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Local inference failed:', error);
      throw new Error('本地模型推理失败');
    }
  }

  // 处理远程API调用
  private async remoteInference(
    message: string,
    model: string,
    context: { status?: ModuleStatus; logs?: LogEntry[] }
  ): Promise<LLMResponse> {
    const modelConfig = this.config.modelConfigs.find(c => c.name === model);
    if (!modelConfig?.apiKey) {
      throw new Error(`未配置API密钥: ${model}`);
    }

    try {
      let endpoint = API_ENDPOINTS.remote.openai; // 默认使用OpenAI端点
      let headers: Record<string, string> = {};
      let data: any;

      // 根据不同的模型配置请求
      if (model.startsWith('GPT')) {
        endpoint = API_ENDPOINTS.remote.openai + '/chat/completions';
        headers = { 'Authorization': `Bearer ${modelConfig.apiKey}` };
        data = {
          model: model.toLowerCase(),
          messages: [
            { role: 'system', content: this.getSystemPrompt(message) },
            { role: 'user', content: JSON.stringify({ message, context }) }
          ]
        };
      } else if (model.startsWith('Claude')) {
        endpoint = API_ENDPOINTS.remote.anthropic + '/messages';
        headers = { 'x-api-key': modelConfig.apiKey };
        data = {
          model: model.toLowerCase(),
          messages: [
            { role: 'user', content: JSON.stringify({ message, context }) }
          ],
          system: this.getSystemPrompt(message)
        };
      } else if (model.startsWith('DeepSeek')) {
        endpoint = API_ENDPOINTS.remote.deepseek + '/chat/completions';
        headers = { 'Authorization': `Bearer ${modelConfig.apiKey}` };
        data = {
          model: model.toLowerCase(),
          messages: [
            { role: 'system', content: this.getSystemPrompt(message) },
            { role: 'user', content: JSON.stringify({ message, context }) }
          ]
        };
      } else if (model.startsWith('Gemini')) {
        endpoint = API_ENDPOINTS.remote.gemini + '/models/gemini-pro:generateContent';
        headers = { 'x-goog-api-key': modelConfig.apiKey };
        data = {
          contents: [
            { role: 'user', parts: [{ text: JSON.stringify({ message, context }) }] }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          },
        };
      }

      const response = await axios.post(endpoint, data, { headers });
      
      return {
        content: this.extractResponseContent(response.data, model),
        model: model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Remote inference failed:', error);
      throw new Error(`远程API调用失败: ${model}`);
    }
  }

  // 提取不同API返回格式的响应内容
  private extractResponseContent(response: any, model: string): string {
    if (model.startsWith('GPT')) {
      return response.choices[0].message.content;
    } else if (model.startsWith('Claude')) {
      return response.content[0].text;
    }
    return response.output || response.generated_text || '';
  }

  // 根据消息内容选择合适的系统提示词
  private getSystemPrompt(message: string): string {
    if (message.includes('日志') || message.includes('异常')) {
      return SYSTEM_PROMPTS.logAnalysis;
    } else if (message.includes('状态') || message.includes('怎么样')) {
      return SYSTEM_PROMPTS.statusQuery;
    } else if (message.includes('问题') || message.includes('故障')) {
      return SYSTEM_PROMPTS.troubleshooting;
    }
    return SYSTEM_PROMPTS.statusQuery; // 默认使用状态查询提示词
  }

  // 处理用户查询
  public async processQuery(message: string, model: string): Promise<LLMResponse> {
    const modelConfig = this.config.modelConfigs.find(c => c.name === model);
    if (!modelConfig?.enabled) {
      throw new Error(`模型未启用: ${model}`);
    }

    // 提取可能涉及的端口名
    const portMatch = message.match(/Ethernet\d+/i);
    const context: { status?: ModuleStatus; logs?: LogEntry[] } = {};
    
    if (portMatch) {
      const portName = portMatch[0];
      try {
        // 并行获取状态和日志
        const [status, logs] = await Promise.all([
          this.getModuleStatus(portName),
          this.getModuleLogs(portName)
        ]);
        context.status = status;
        context.logs = logs;
      } catch (error) {
        console.warn('Failed to fetch context:', error);
        // 继续处理，即使上下文获取失败
      }
    }

    // 根据模型类型选择处理方式
    if (modelConfig.type === 'local') {
      return this.localInference(message, model, context);
    } else {
      return this.remoteInference(message, model, context);
    }
  }
}

export const llmService = new LLMService(); 