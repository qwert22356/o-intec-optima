# O-intecOptima 系统架构

## 系统架构图

![系统架构图](../screenshots/系统架构图.png)

## 架构说明

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