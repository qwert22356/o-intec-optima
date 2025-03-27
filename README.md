# O-intecOptima 系统后端完整架构说明（含 Redis、RabbitMQ）

# 一、总体结构图（文字版）

"""
                   ┌────────────────────────┐
                   │        前端 UI         │   ⇦ Vue/React 页面
                   └────────────┬───────────┘
                                │ HTTP 请求
                                ▼
                  ┌────────────────────────┐
                  │      FastAPI 接口层     │   ⇦ Controller 层
                  └────────────┬───────────┘
                                │ 调用服务层函数
                                ▼
        ┌────────────────────────────────────────────┐
        │               ✅ 服务模板层（Service）       │
        │  ├─ module_service.py    ← 查询状态         │
        │  ├─ predict_service.py   ← 模型预测         │
        │  ├─ config_service.py    ← 配置读写         │
        │  ├─ alert_service.py     ← 告警判断/生成    │
        │  └─ llm_service.py       ← 语言模型分析     │
        └──────────────┬─────────────────────────────┘
                       │
      ┌────────────────┼────────────────────────────────────────────────────┐
      │                │                                                    │
      ▼                ▼                                                    ▼
[数据库]        [预测模型引擎]                                    ✅ [异步任务队列系统]
(SQLite /       (ARIMA / Prophet                                (RabbitMQ / Kafka / Celery)
 TimescaleDB)    IsolationForest)                                      │
                                                                      ▼
                                                           后台 Worker 任务处理器
                                                           ├─ 预测分析任务
                                                           ├─ 告警通知推送
                                                           └─ 日志批量分析

                           ▲
                           │
                           │ Redis（缓存中间件）
                           │ ├─ 存储实时状态缓存（module:Ethernet56）
                           │ ├─ 发布/订阅告警消息
                           │ ├─ LLM 对话上下文
                           │ └─ 健康评分快速查询

     ▲                                     
     │写入
┌────┴────────┐      
│   数据采集器 │ ⇦ SNMP/gRPC/Syslog/Telegraf
└──────────────┘
"""

# 二、模块说明

## 1. FastAPI 接口层（Controller）
- 处理 URL 请求，如：GET /api/modules/Ethernet56/status
- 仅负责接收参数、调用服务层、返回响应

## 2. 服务模板层（Service）
- 逻辑中心，处理具体业务：
  - 模块状态查询
  - 模型调用预测
  - 告警策略比对
  - 配置读写
  - 调用大语言模型（LLM）
  - 发起异步任务推送至队列
  - 读取 Redis 缓存 / 写入状态缓存

## 3. 数据采集器（Agent）
- 定时采集 DDM 数据（如温度、电压）
- 来源：SNMP、gNMI、gRPC、Syslog、Telegraf
- 数据写入数据库 or 推送到 Kafka/RabbitMQ 队列

## 4. 数据库（DB）
- 保存模块状态、趋势数据、告警历史、配置项
- 可选方案：SQLite（轻量）/ InfluxDB（时序）/ TimescaleDB（PostgreSQL 拓展）

## 5. Redis（缓存中间件）
- 缓存最近温度、电流、状态等（加速查询）
- 存放健康评分、模块上下文状态
- 提供 LLM 多轮会话缓存
- 告警消息发布订阅（Pub/Sub）

## 6. 队列系统（RabbitMQ / Kafka / Celery）
- FastAPI 调用服务层 → 任务放入队列
- 后台 Worker 监听并处理任务
- 应用场景：模型预测、日志分析、告警推送等异步任务

## 7. 模型预测引擎
- 调用 ARIMA、Prophet、LSTM、IF 等模型
- 预测光模块未来温度/功率变化，返回故障概率
- 可以在本地服务 or 远程模型集群运行

# 三、架构特色
- FastAPI + 服务模板分层结构清晰
- 采集/预测/缓存/告警解耦，便于拓展
- 支持 Redis 高速缓存 + RabbitMQ 异步处理
- 模块可独立部署，未来支持微服务拆分
- 支持高并发、大数据采集下的异步处理能力
- 适合 AI 运维场景中的大规模设备预测分析

# ✅ 可继续扩展方向
- Prometheus + Grafana 可视化趋势
- Kubernetes 支持服务编排
- 多租户 SaaS 化部署
- REST + WebSocket 混合接口
- Kafka → Flink / Spark 做流计算分析
