# O-intecOptima - 光模块智能运维平台

![系统架构图](screenshots/system-architecture.png)

O-intecOptima 是一个专业的光模块智能运维平台，旨在提供全方位的光模块监控、预测性维护和智能分析服务。

## 功能特点

- 📊 **实时监控**
  - 模块状态实时监控
  - 性能参数可视化
  - 告警实时推送

- 🔮 **预测性维护**
  - 故障预测分析
  - 寿命评估
  - 性能趋势分析

- 🤖 **智能分析**
  - 基于 LLM 的智能诊断
  - 自动化运维建议
  - 性能优化方案

- ⚙️ **配置管理**
  - 阈值配置
  - 告警规则设置
  - 系统参数配置

## 技术架构

### 前端技术栈
- React + TypeScript
- Vite 构建工具
- TailwindCSS 样式框架
- 实时数据可视化组件

### 后端技术栈
- FastAPI / Express.js
- WebSocket 实时通信
- 时序数据库 (InfluxDB)
- SQLite 关系数据库

### AI/ML 集成
- ARIMA/IF 预测模型
- Prophet 时序预测
- ChatGPT/D5 API 集成

### 数据采集
- SNMP 协议支持
- gRPC 通信
- syslog 日志采集

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- Python >= 3.8 (如果使用 FastAPI 后端)
- SQLite3

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/qwert22356/o-intec-optima.git
cd o-intec-optima
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
o-intec-optima/
├── src/                    # 源代码目录
│   ├── components/        # React 组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务
│   └── lib/              # 工具库
├── docs/                  # 文档
│   ├── api-requirements.md    # API 需求文档
│   └── architecture.md        # 架构文档
├── screenshots/           # 项目截图
└── public/               # 静态资源
```

## API 文档

详细的 API 文档请参考 [API 需求文档](docs/api-requirements.md)。

## 系统架构

详细的系统架构说明请参考 [架构文档](docs/architecture.md)。

## 开发计划

- [x] 前端 UI 开发完成
- [x] API 接口定义
- [ ] 后端服务开发
- [ ] 数据采集模块
- [ ] AI 预测模型集成
- [ ] 系统测试与优化

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目维护者：[qwert22356](https://github.com/qwert22356)
- 项目仓库：[o-intec-optima](https://github.com/qwert22356/o-intec-optima)

## 致谢

感谢所有为这个项目做出贡献的开发者！