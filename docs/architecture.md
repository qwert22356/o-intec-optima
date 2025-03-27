# O-intecOptima 系统架构

## 整体架构

系统采用前后端分离的架构设计，主要分为以下几层：

### 1. 前端层 (已完成)
- UI 界面实现

### 2. 后端 API 层
- 基于 FastAPI / Express.js
- 提供 REST/API 接口服务

### 3. 业务逻辑层
分为三个主要模块：

#### 3.1 数据存储
- SQLite
- InfluxDB

#### 3.2 模型服务
- ARIMA/IF
- Prophet等预测模型

#### 3.3 LLM 调度（可选）
- ChatGPT/D5等API集成

### 4. 数据采集层
- SNMP
- gRPC
- syslog

## 架构图

![系统架构图](../screenshots/architecture.png)

## 技术栈说明

1. **前端技术**
   - React + TypeScript
   - 现代化UI组件库
   - 实时数据可视化

2. **后端技术**
   - FastAPI/Express.js 提供 RESTful API
   - WebSocket 支持实时数据推送
   - 模块化的业务逻辑设计

3. **数据存储**
   - SQLite：结构化数据存储
   - InfluxDB：时序数据存储

4. **AI/ML 集成**
   - 预测分析模型
   - LLM 接口集成
   - 智能告警系统

5. **监控采集**
   - 多协议支持
   - 高性能数据采集
   - 可扩展的采集框架