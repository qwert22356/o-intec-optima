import express from 'express';
import cors from 'cors';
import { InferenceRequest, InferenceResponse, HealthCheckResponse } from './types.js';
import { modelManager } from './models.js';
import { SYSTEM_PROMPTS } from '../config.js';

const app = express();

// 配置 CORS
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// 根路径处理
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'LLM Service is running',
    endpoints: {
      health: '/api/llm/health',
      models: '/api/llm/models',
      inference: '/api/llm/inference',
    }
  });
});

// 健康检查端点
app.get('/api/llm/health', (_req, res) => {
  const modelStatuses = modelManager.getAllModelInfo().reduce((acc, info) => {
    acc[info.name] = {
      status: info.status,
      lastError: info.lastError,
    };
    return acc;
  }, {} as HealthCheckResponse['models']);

  const response: HealthCheckResponse = {
    status: Object.values(modelStatuses).some(s => s.status === 'error')
      ? 'degraded'
      : Object.values(modelStatuses).every(s => s.status === 'ready')
        ? 'healthy'
        : 'degraded',
    models: modelStatuses,
    lastCheck: new Date().toISOString(),
  };

  res.json(response);
});

// 获取可用模型列表
app.get('/api/llm/models', (_req, res) => {
  const models = modelManager.getAllModelInfo();
  res.json(models);
});

// 推理端点
app.post('/api/llm/inference', async (req, res) => {
  const request = req.body as InferenceRequest;
  
  try {
    if (!modelManager.isModelReady(request.model)) {
      throw new Error(`Model not ready: ${request.model}`);
    }

    // 构建提示词
    let prompt = SYSTEM_PROMPTS.default + '\n\n用户: ' + request.message;
    
    // 添加上下文信息
    if (request.context?.status) {
      prompt += '\n\n当前状态:\n' + JSON.stringify(request.context.status, null, 2);
    }
    if (request.context?.logs) {
      prompt += '\n\n相关日志:\n' + request.context.logs
        .map(log => `[${log.timestamp}] ${log.type}: ${log.message}`)
        .join('\n');
    }

    prompt += '\n\n助手: ';

    const content = await modelManager.generateText(request.model, prompt);
    
    const response: InferenceResponse = {
      content,
      model: request.model,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Inference failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 模块状态模拟数据
const mockModuleStatus = {
  'Ethernet48': {
    temperature: 26.5,
    rxPower: -5.2,
    txPower: -2.8,
    errors: {
      crc: 0,
      linkFlaps: 0,
    },
    lastUpdate: new Date().toISOString(),
  }
};

// 模拟日志数据
const mockLogs = {
  'Ethernet48': [
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'info',
      message: 'Link status: up',
      portName: 'Ethernet48',
    }
  ]
};

// 获取模块状态
app.get('/api/modules/:portName/status', (req, res) => {
  const { portName } = req.params;
  const status = mockModuleStatus[portName as keyof typeof mockModuleStatus];
  
  if (!status) {
    res.status(404).json({ error: `Module not found: ${portName}` });
    return;
  }

  res.json({
    portName,
    ...status,
  });
});

// 获取模块日志
app.get('/api/modules/:portName/logs', (req, res) => {
  const { portName } = req.params;
  const logs = mockLogs[portName as keyof typeof mockLogs] || [];
  res.json(logs);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`LLM server running on port ${PORT}`);
}); 