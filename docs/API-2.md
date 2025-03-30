## API接口设计

### 通用规范
- 基础URL: `/api/v1`
- 认证: `Bearer Token (JWT)`
- 响应格式: `JSON`
- 错误处理: `HTTP状态码 + 详细错误信息`
- 分页: `page`, `per_page` 参数
- 过滤: 使用查询参数

---

### 1. 仪表盘页面 API

#### 1.1 系统概览
```http
GET /api/v1/dashboard/overview
```
```json
{
  "healthScore": 85,
  "criticalModules": 3,
  "totalModules": 200,
  "predictedFailures": 5,
  "systemAvailability": 99.8
}
```

#### 1.2 最近告警
```http
GET /api/v1/alerts/recent?limit=4
```
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "message": "模块 MOD-001 温度过高",
      "severity": "high",
      "timestamp": "2023-03-29T15:30:00Z",
      "moduleId": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
      "source": "系统监控"
    }
  ]
}
```

#### 1.3 设备连接状态
```http
GET /api/v1/devices/connection-status?page=1&per_page=10
```
```json
{
  "total": 25,
  "page": 1,
  "per_page": 10,
  "devices": [
    {
      "id": "device-1",
      "ip": "192.168.1.10",
      "protocol": "snmp",
      "status": "connected",
      "lastSeen": "2023-03-29T15:30:00Z",
      "frequency": 30,
      "responseTime": 45,
      "deviceId": "SW01"
    }
  ]
}
```

#### 1.4 设备选择（根据选中设备显示同Pod内上下联）
```http
GET /api/v1/devices/{deviceId}/related
```
```json
{
  "deviceId": "SW01",
  "pod": "Pod01",
  "relatedDevices": [
    {
      "id": "device-2",
      "name": "接入交换机-1",
      "type": "Leaf",
      "status": "connected"
    },
    {
      "id": "device-3",
      "name": "接入交换机-2",
      "type": "Leaf",
      "status": "connected"
    }
  ]
}
```

#### 1.41 设备选择详细版-用于拓扑展示、链路详情、状态分析
```http
GET /api/v1/devices/{deviceId}/related/connections
```
```json
{
  "deviceId": "SW01",
  "connections": [
    {
      "localInterface": "Ethernet1/1",
      "remoteDevice": "Spine-01",
      "remoteInterface": "Ethernet1/49",
      "remoteIp": "192.168.2.1",
      "remoteVendor": "Cisco",
      "topologyRole": "Spine"
    }
  ]
}
```

#### 1.5 交换机面板与端口状态
```http
GET /api/v1/devices/{deviceId}/ports
```
```json
{
  "deviceName": "Switch-01",
  "totalPorts": 64,
  "ports": [
    {
      "id": "port-1",
      "name": "Ethernet1/1",
      "status": "up",
      "speed": "100G",
      "mtu": 9000,
      "moduleInserted": true,
      "moduleType": "QSFP28",
      "stats": {
        "rxBytes": 1572864,
        "txBytes": 1048576,
        "rxPackets": 15000,
        "txPackets": 12000,
        "errors": 0,
        "drops": 0
      }
    }
  ]
}
```

#### 1.6 端口详情
```http
GET /api/v1/devices/{deviceId}/ports/{portId}
```
```json
{
  "id": "port-1",
  "name": "Ethernet1/1",
  "status": "up",
  "adminStatus": "up",
  "speed": "100G",
  "mtu": 9000,
  "duplex": "full",
  "moduleInserted": true,
  "moduleInfo": {
    "vendor": "Cisco",
    "partNumber": "QSFP-100G-SR4-S",
    "serialNumber": "FLJ22151234",
    "temperature": "45.2°C",
    "voltage": "3.3V",
    "current": "0.4A",
    "txPower": "-2.1dBm",
    "rxPower": "-3.5dBm"
  },
  "stats": {
    "rxBytes": 1572864,
    "txBytes": 1048576,
    "rxPackets": 15000,
    "txPackets": 12000,
    "errors": 0,
    "drops": 0,
    "crcErrors": 0,
    "frameErrors": 0
  },
  "locationinfo": {
    "DevideId": "EdgeRouter-02",
    "rack": "机架C-03",
    "room": "边缘机房",
    "datacenter": "EdgeRouter-02"
  },
  "Predictioninfo": {
    "remainingDays": "71 天",
    "predictionConfidence": 85,
    "predictionsuggest": "由于错误率上升，建议在90天内更换。模块的CRC错误和帧错误数量持续增加，这可能表明内部组件正在降级。历史数据显示这种模式通常会在90-120天内演变为完全故障。"
  }
}
```

### 2. 光模块监控页面 API

#### 2.1 光模块列表
```http
GET /api/v1/modules?page=1&per_page=20&filter[status]=warning&sort=temperature&order=desc
```
```json
{
  "total": 200,
  "page": 1,
  "per_page": 20,
  "modules": [
    {
      "id": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
      "name": "光模块-1",
      "health": 85,
      "temperature": "65.2°C",
      "rxPower": "-5.2dBm",
      "txPower": "-3.1dBm",
      "voltage": "3.25V",
      "current": "45.2mA",
      "device": {
        "id": "SW01",
        "name": "Switch-01",
        "type": "Spine",
        "ip": "192.168.1.1",
        "port": "Ethernet1/1"
      },
      "location": {
        "dataCenter": "DC1",
        "room": "Pod01",
        "rack": "Rack01"
      },
      "lastUpdated": "2023-03-29T15:30:00Z"
    }
  ]
}
```

#### 2.2 光模块详情
```http
GET /api/v1/modules/{moduleId}
```
```json
{
  "id": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
  "name": "光模块-1",
  "vendor": "Cisco",
  "partNumber": "QSFP-100G-SR4-S",
  "serialNumber": "FLJ22151234",
  "connectorType": "LC",
  "transceiverType": "QSFP28",
  "domSupport": true,
  "health": 85,
  "temperature": "65.2°C",
  "voltage": "3.25V",
  "current": "45.2mA",
  "txPower": "-3.1dBm",
  "rxPower": "-5.2dBm",
  "device": {
    "id": "SW01",
    "name": "Switch-01",
    "type": "Spine",
    "ip": "192.168.1.1",
    "port": "Ethernet1/1"
  },
  "location": {
    "dataCenter": "DC1",
    "room": "Pod01",
    "rack": "Rack01"
  },
  "history": {
    "temperature": [...],
    "rxPower": [...],
    "txPower": [...]
  },
  "lastUpdated": "2023-03-29T15:30:00Z",
  "alarms": [
    {
      "id": "alarm-1",
      "type": "temperature",
      "severity": "warning",
      "message": "温度接近阈值",
      "timestamp": "2023-03-29T15:00:00Z"
    }
  ],
  "runtime": "382 天",
  "statusScore": 82,
  "diagnosis": "该光模块状态良好，但近期温度略高，建议持续观察。"
}
```

#### 2.3 光模块历史数据
```http
GET /api/v1/modules/{moduleId}/history?metric=temperature&period=24h&interval=5m
```
```json
{
  "moduleId": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
  "metric": "temperature",
  "unit": "°C",
  "period": "24h",
  "interval": "5m",
  "data": [
    { "timestamp": "2023-03-28T16:00:00Z", "value": 62.5 },
    { "timestamp": "2023-03-28T16:05:00Z", "value": 63.1 }
  ]
}
```

### 3. 预测分析页面 API

#### 3.1 光模块预测列表
```http
GET /api/v1/predictions/modules?page=1&per_page=20&sort=remainingDays&order=asc
```
```json
{
  "total": 200,
  "page": 1,
  "per_page": 20,
  "modules": [
    {
      "id": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
      "name": "光模块-1",
      "health": 70,
      "remainingDays": 180,
      "temperature": "65.2°C",
      "temperatureTrend": "rising",
      "rxPowerTrend": "stable",
      "txPowerTrend": "declining",
      "predictionConfidence": 85,
      "status": "warning",
      "failureRisk": "medium",
      "device": {
        "id": "SW01",
        "name": "Switch-01"
      },
      "location": {
        "dataCenter": "DC1",
        "room": "Pod01",
        "rack": "Rack01"
      }
    }
  ]
}
```

#### 3.2 光模块预测详情
```http
GET /api/v1/predictions/modules/{moduleId}
```
```json
{
  "id": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
  "name": "光模块-1",
  "health": 70,
  "remainingDays": 180,
  "predictionHistory": [
    { "date": "2023-03-01", "remainingDays": 210 },
    { "date": "2023-03-15", "remainingDays": 195 },
    { "date": "2023-03-29", "remainingDays": 180 }
  ],
  "metrics": {
    "temperature": {
      "current": "65.2°C",
      "trend": "rising",
      "forecast": [
        { "date": "2023-04-05", "value": 66.1 },
        { "date": "2023-04-12", "value": 67.2 }
      ]
    },
    "rxPower": {
      "current": "-5.2dBm",
      "trend": "stable",
      "forecast": []
    },
    "txPower": {
      "current": "-3.1dBm",
      "trend": "declining",
      "forecast": []
    }
  },
  "failureRisk": {
    "overall": "medium",
    "factors": [
      { "name": "温度过高", "contribution": 60 },
      { "name": "发送功率下降", "contribution": 30 },
      { "name": "电压波动", "contribution": 10 }
    ]
  },
  "recommendations": [
    "建议在未来3个月内更换该模块",
    "监控设备温度，减少温度波动"
  ]
}
```

#### 3.3 预测统计
```http
GET /api/v1/predictions/statistics
```
```json
{
  "totalModules": 200,
  "atRiskModules": 25,
  "criticalModules": 8,
  "averageLifespan": "3.2年",
  "replacementRate": "2.8%",
  "modulesByRisk": {
    "high": 8,
    "medium": 17,
    "low": 175
  },
  "modulesByRemainingDays": {
    "0-30": 3,
    "31-90": 5,
    "91-180": 10,
    "181-365": 25,
    "365+": 157
  },
  "topFailureFactors": [
    { "factor": "温度过高", "count": 12 },
    { "factor": "发送功率下降", "count": 9 },
    { "factor": "电压波动", "count": 5 }
  ]
}
```

#### 3.4 模块故障概率与命中规则
```http
GET /api/v1/predictions/modules/{moduleId}
```
```json
{
  "ip": "192.168.62.212",
  "port": 39,
  "failureProbability": 75,
  "failureTimeEstimate": "2025-04-03T05:38:31Z",
  "modelHitRules": [
    {
      "name": "ARIMA+Isolation Forest异常检测规则",
      "hitTime": "2025-03-29T08:00:00Z",
      "accuracy": 84,
      "windowHours": 48
    }
  ]
}
```

#### 3.5 获取命中预测规则列表
```http
GET /api/v1/predictions/modules/{moduleId}/rules
```
```json
{
  "moduleId": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
  "rules": [
    {
      "name": "ARIMA+Isolation Forest异常检测规则",
      "algorithm": "ARIMA + Isolation Forest",
      "windowHours": 48,
      "accuracy": 84,
      "hit": true,
      "hitTime": "2025-03-29T08:00:00Z"
    },
    {
      "name": "周期性建模+Prophet规则",
      "algorithm": "Prophet",
      "windowHours": 72,
      "accuracy": 91,
      "hit": false
    }
  ]
}
```

#### 3.6 moduleId 连接详情
```http
GET /api/v1/predictions/modules/{moduleId}/connection
```
```json
{
  "ip": "192.168.62.212",
  "port": 39,
  "interface": "Eth1/1",
  "direction": "Tx/Rx",
  "deviceModel": "Cisco N9K-C93180YC-FX",
  "transceiverType": "QSFP-100G-SR4"
}
```

#### 3.7 急需维护模块
```http
GET /api/v1/predictions/modules/urgent?hoursThreshold=24
```
```json
{
  "total": 4,
  "modules": [
    {
      "id": "模块-MOD02",
      "location": "Core-Core02 / Spine-Spine01 / Leaf-Leaf02",
      "remainingHours": 1,
      "failureProbability": 66,
      "status": "warning",
      "predictedFailureTime": "2025-03-30T16:38:05Z"
    }
  ]
}
```

#### 3.8 故障因子统计（趋势分析用）
```http
GET /api/v1/predictions/statistics/failure-factors
```
```json
{
  "factors": [
    { "name": "温度过高", "count": 12 },
    { "name": "发送功率下降", "count": 9 },
    { "name": "电压波动", "count": 5 }
  ]
}
```

#### 3.9 获取所有规则列表
```http
GET /api/v1/predictions/rules
```
```json
{
  "rules": [
    {
      "id": "rule-001",
      "name": "AI训练集群-ARIMA+Isolation Forest异常检测规则",
      "status": "active",
      "accuracy": 84,
      "algorithm": "ARIMA + Isolation Forest",
      "features": ["rxPower", "temperature", "voltage", "historical_trend"],
      "timeWindowHours": 48,
      "minConfidence": 81,
      "scenarios": "模块3000个以上，任务持续长、温升缓慢"
    }
  ]
}
```

#### 3.10 规则准确率统计
```http
GET /api/v1/predictions/rules/accuracies
```
```json
{
  "rulesAccuracy": [
    { "name": "制造业-Prophet", "accuracy": 91 },
    { "name": "ISP-KMeans聚类", "accuracy": 88 },
    { "name": "AI推理边缘", "accuracy": 85 },
    { "name": "AI训练集群", "accuracy": 84 }
  ]
}
```

#### 3.11 预测命中趋势（时间序列）
```http
GET /api/v1/predictions/statistics/timeseries
```
```json
{
  "startDate": "2025-03-01",
  "endDate": "2025-03-30",
  "data": [
    { "date": "2025-03-01", "total": 90, "hit": 78 },
    { "date": "2025-03-02", "total": 92, "hit": 82 },
    { "date": "2025-03-03", "total": 94, "hit": 81 }
  ]
}
```

#### 3.12 获取规则详情
```http
GET /api/v1/predictions/rules/{ruleId}
```
```json
{
  "id": "rule-001",
  "name": "AI训练集群-ARIMA+IF",
  "algorithm": "ARIMA + Isolation Forest",
  "description": "适合长期趋势分析，检测温升异常",
  "features": ["rxPower", "temperature", "voltage", "historical_trend"],
  "timeWindowHours": 48,
  "minConfidence": 81,
  "accuracy": 84,
  "status": "active",
  "totalPredictions": 252,
  "correctPredictions": 211,
  "lastUpdated": "2025-03-26T04:56:17Z",
  "createdAt": "2025-03-23T18:50:22Z"
}
```

#### 3.13 创建预测规则
```http
POST /api/v1/predictions/rules
```
```json
{
  "name": "训练集群规则",
  "description": "检测长期温升趋势",
  "algorithm": "ARIMA + Isolation Forest",
  "moduleType": "QSFP-100G",
  "features": ["rxPower", "txPower", "temperature"],
  "timeWindowHours": 24,
  "minConfidence": 70,
  "autoActivate": true,
  "industryPreset": "ai-cluster"
}
```

### 4. 数据统计页面 API

#### 4.1 光模块兼容性总览
```http
GET /api/v1/statistics/modules/compatibility/overview
```
```json
{
  "totalModules": 403,
  "compatibleModules": 381,
  "incompatibleModules": 22
}
```

#### 4.2 光模块预测详情
```http
GET /api/v1/statistics/modules/compatibility/vendor-comparison
```
```json
{
  "sameVendor": {
    "total": 247,
    "compatibleRate": 98.4
  },
  "differentVendor": {
    "total": 156,
    "compatibleRate": 88.5
  }
}
```

#### 4.3 速率维度兼容性统计
```http
GET /api/v1/statistics/modules/compatibility/by-speed
```
```json
{
  "data": [
    {
      "speed": "10G",
      "sameVendor": { "total": 62, "issues": 0, "rate": 100.0 },
      "differentVendor": { "total": 33, "issues": 2, "rate": 93.9 }
    },
    {
      "speed": "25G",
      "sameVendor": { "total": 85, "issues": 1, "rate": 98.8 },
      "differentVendor": { "total": 46, "issues": 3, "rate": 93.5 }
    }
  ]
}
```

#### 4.4 AI兼容性分析
```http
GET /api/v1/statistics/modules/compatibility/ai-analysis?days=30
```
```json
{
  "analysisDate": "2025-03-30",
  "period": "过去30天",
  "totalModules": 403,
  "aiDetectedIncompatibles": 22,
  "aiCompatibilityScore": 91.5,
  "topIncompatibilityCauses": [
    { "factor": "厂商协议不一致", "count": 12 },
    { "factor": "DOM信息缺失", "count": 6 },
    { "factor": "速率与类型匹配异常", "count": 4 }
  ],
  "recommendations": [
    "建议核查速率与端口支持能力是否匹配",
    "排查光模块 EEPROM 信息是否齐全",
    "统一厂商或提前测试组合兼容性"
  ]
}
```

#### 4.5 光模块更换率统计
## 4.5.1 获取概览
```http
GET /api/v1/statistics/modules/replacement/overview
```
```json
{
  "totalModules": 74,
  "averageVoltage": "3.3V",
  "averageReplacementRate": "8.0%/年"
}
```

## 4.5.2 厂商与年份对比
```http
GET /api/v1/statistics/modules/replacement/vendor-yearly
```
```json
{
  "granularity": "year",
  "data": [
    {
      "year": 2021,
      "vendors": {
        "Cisco": 12.1,
        "Huawei": 9.8,
        "Juniper": 10.4
      }
    }
  ]
}
```

## 4.5.3 按速率统计
```http
GET /api/v1/statistics/modules/replacement/by-speed
```
```json
{
  "data": [
    { "speed": "1G", "replacementRate": 10.7 },
    { "speed": "10G", "replacementRate": 4.1 },
    { "speed": "25G", "replacementRate": 2.2 },
    { "speed": "800G", "replacementRate": 2.1 }
  ]
}
```

## 4.5.4 更换率热力图（速率 × 厂商）
```http
GET /api/v1/statistics/modules/replacement/matrix
```
```json
{
  "data": [
    { "vendor": "Cisco", "speed": "100G", "replacementRate": 15.0 },
    { "vendor": "Huawei", "speed": "100G", "replacementRate": 13.4 },
    { "vendor": "ZTE", "speed": "100G", "replacementRate": 5.2 }
  ]
}
```

#### 4.6 光模块厂商详情
```http
GET /api/v1/statistics/vendors/detail
```
```json
{
  "vendors": [
    {
      "vendor": "Cisco",
      "mainProducts": "全线产品",
      "averageLifespan": "5.2年",
      "averageFailureRate": "0.7%/年",
      "costBenefitRatio": "中等"
    },
    {
      "vendor": "Huawei",
      "mainProducts": "全线产品",
      "averageLifespan": "4.8年",
      "averageFailureRate": "0.9%/年",
      "costBenefitRatio": "高"
    }
  ]
}
```

#### 4.7 光模块日志分析
```http
GET /api/v1/logs/modules?page=1&per_page=20&datacenter=DC1&severity=high
```
```json
{
  "total": 80,
  "logs": [
    {
      "timestamp": "2025-03-29T19:42:12Z",
      "datacenter": "DC1",
      "room": "Room A",
      "pod": "Pod 3",
      "rack": "R12",
      "device": "Switch-Core-01",
      "slot": "Slot 1",
      "port": "Port 24",
      "severity": "critical",
      "message": "QSFP28 模块接收功率超出阈值 (-3.8dBm)"
    }
  ]
}
```

### 5. 配置页面 API
#### 5.1 数据采集配置
```http
GET /api/v1/config/data-collection
POST /api/v1/config/data-collection
```
```json
{
  "snmp": {
    "enabled": true,
    "version": "2c",
    "community": "public",
    "interval": 300,
    "timeout": 10,
    "retries": 3,
    "deviceIps": ["192.168.1.1", "192.168.1.2"],
    "oids": ["ifOperStatus", "ifLastChange", "ifInErrors"]
  },
  "grpc": {
    "enabled": true,
    "interval": 30,
    "deviceIps": ["10.10.10.1", "10.10.10.2"],
    "port": 57400,
    "subscriptionConfig": {
      "subscription": [
        {
          "path": "/interfaces/interface[name=Ethernet0]/state/counters",
          "mode": "SAMPLE",
          "sample_interval": 10000000000
        }
      ],
      "mode": "STREAM"
    }
  },
  "syslog": {
    "enabled": true,
    "port": 514,
    "protocol": "udp",
    "filterLevel": "warning",
    "ipWhitelist": ["10.10.1.1", "10.10.1.2"],
    "retentionPolicy": "7d"
  }
}
```

#### 5.2 数据库配置
```http
GET /api/v1/config/database
POST /api/v1/config/database
```
```json
# 请求体示例（以 type 为区分）
{
  "type": "sqlite",
  "sqlite": {
    "path": "/opt/data/optima.db"
  },
  "parquet": {
    "path": "/data/parquet/",
    "retention_days": 30
  },
  "influxdb": {
    "host": "localhost",
    "port": 8086,
    "database": "optima",
    "username": "optima_user",
    "password": "****",
    "retention": "30d"
  },
  "timescaledb": {
    "host": "localhost",
    "port": 5432,
    "database": "optima",
    "username": "optima_user",
    "password": "****",
    "retention": "90d",
    "compression": true
  },
  "elasticsearch": {
    "hosts": ["http://localhost:9200"],
    "index_prefix": "optima-logs-",
    "retention": "30d"
  }
}
```
```json
# 返回示例
{
  "type": "parquet",
  "parquet": {
    "path": "/data/parquet/",
    "retention_days": 30
  }
}
```

#### 5.3 告警策略配置
##### 获取告警策略
```http
GET /api/v1/config/alert-policies
```
##### 新增/修改告警策略
```http
POST /api/v1/config/alert-policies
```
```json
{
  "policies": [
    {
      "id": "policy-1",
      "name": "温度过高告警",
      "description": "当光模块温度超过阈值时触发告警",
      "enabled": true,
      "metric": "temperature",
      "condition": "gt",
      "threshold": 70,
      "severity": "high",
      "cooldown": 300,
      "triggerCount": 3,
      "recoveryThreshold": 65,
      "notification": {
        "email": true,
        "webhook": true,
        "sms": false
      },
      "filters": {
        "vendors": ["Cisco", "Finisar"],
        "types": ["QSFP28"],
        "locations": ["DC1/Pod01"]
      }
    }
  ]
}
```

- 字段名 triggerCount 类型 int 示例 3 备注 连续满足条件 N 次才告警
- 字段名 recoveryThreshold 类型 float 示例 65 备注 低于此值时告警恢复
- 字段名 notification 类型 object 示例 null 备注 通知方式支持 email / webhook / teams / slack

#### 5.4 告警推送配置
```http
GET /api/v1/config/notifications
POST /api/v1/config/notifications
```
```json
{
  "email": {
    "enabled": true,
    "server": "smtp.example.com",
    "port": 587,
    "username": "alerts@example.com",
    "password": "******",
    "use_tls": true,
    "recipients": [
      {
        "name": "运维组",
        "email": "ops@example.com",
        "alert_levels": ["high", "medium"]
      }
    ],
    "template": {
      "subject": "[{severity}] 告警 {device_name} - {alert_type}",
      "body": "设备：{device_name}\n位置：{location}\n类型：{alert_type}\n等级：{severity}\n时间：{timestamp}\n描述：{description}\n当前值：{current_value}\n阈值：{threshold}{unit}"
    }
  },
  "webhook": {
    "enabled": true,
    "endpoints": [
      {
        "name": "企业微信",
        "url": "https://qyapi.weixin.qq.com/...",
        "alert_levels": ["high", "medium", "low"],
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer xxx"
        },
        "payload_template": "{\"alert\": {\"device\": \"{device_name}\", \"type\": \"{alert_type}\", \"severity\": \"{severity}\", \"timestamp\": \"{timestamp}\", \"value\": \"{current_value}\"}}"
      }
    ]
  },
  "slack": {
    "enabled": true,
    "webhook_url": "https://hooks.slack.com/services/xxx",
    "channel": "#alerts"
  },
  "teams": {
    "enabled": true,
    "webhook_url": "https://outlook.office.com/webhook/..."
  },
  "sms": {
    "enabled": true,
    "provider": "aliyun",
    "api_key": "******",
    "signature": "[Optima监控]",
    "recipients": [
      {
        "name": "李运维",
        "phone": "+8613712345678",
        "alert_levels": ["critical"]
      }
    ]
  }
}
```

### 6. LLM 控制台 API 
#### 6.1 对话接口
```http
POST /api/v1/llm/chat
```
```json
# 请求体
{
  "message": "分析光模块MOD-001温度过高的原因",
  "context_id": "chat-123", 
  "include_history": true
}
```
```json
# 返回
{
  "context_id": "chat-123",
  "reply": {
    "id": "msg-2",
    "role": "assistant",
    "content": "根据分析，MOD-001光模块温度过高（当前65.2°C，正常范围应在40-60°C）可能有以下原因：...",
    "timestamp": "2025-03-30T18:45:12Z",
    "sources": [
      {
        "type": "module",
        "id": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
        "partNumber": "QSFP-100G-SR4-S",
        "metric": "temperature",
        "value": "65.2°C",
        "threshold": "60°C",
        "time": "2025-03-30T18:40:00Z"
      },
      {
        "type": "doc",
        "title": "温度异常诊断规范",
        "url": "https://kb.optima.com/article/temp-thresholds"
      }
    ]
  },
  "history": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "分析光模块MOD-001温度过高的原因",
      "timestamp": "2025-03-30T18:44:10Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "根据分析，MOD-001光模块温度过高……",
      "timestamp": "2025-03-30T18:45:12Z"
    }
  ]
}
```

#### 6.2 获取历史会话
```http
GET /api/v1/llm/conversations?page=1&per_page=10
```
```json
{
  "id": "chat-123",
  "title": "光模块温度问题分析",
  "created_at": "2023-03-29T15:30:00Z",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "分析光模块MOD-001温度过高的原因",
      "timestamp": "2023-03-29T15:30:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "根据分析，MOD-001光模块温度过高（当前65.2°C，正常范围应在40-60°C）可能有以下原因：...",
      "timestamp": "2023-03-29T15:30:10Z",
      "sources": [...]
    }
  ]
}
```

#### 6.3 获取 / 设置模型配置
```http
GET /api/v1/llm/settings
POST /api/v1/llm/settings
```
```json
{
  "local_models": [
    {
      "name": "Phi-1.5",
      "enabled": true
    },
    {
      "name": "TinyLLaMA-1.1B",
      "enabled": false
    }
  ],
  "cloud_models": [
    {
      "name": "GPT-4",
      "enabled": false,
      "api_key": "sk-****"
    },
    {
      "name": "GPT-4 Turbo",
      "enabled": false,
      "api_key": ""
    },
    {
      "name": "Claude-3 Sonnet",
      "enabled": false,
      "api_key": ""
    },
    {
      "name": "Claude-3.7",
      "enabled": false,
      "api_key": ""
    }
  ]
}
```

### 8. 用户管理与系统设置
#### 8.1 用户认证
```http
POST /api/v1/auth/login
```
```json
# 请求体
{
  "username": "admin",
  "password": "password"
}
```
```json
# 返回
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-1",
    "username": "admin",
    "display_name": "管理员",
    "role": "admin",
    "permissions": ["read", "write", "admin"]
  }
}

```#### 8.2 系统设置获取与修改
```http
GET /api/v1/settings
PUT /api/v1/settings
```
```json
# 请求体 / 返回
{
  "general": {
    "system_name": "O-Intec Optima",
    "logo_url": "/assets/logo.png",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "date_format": "YYYY-MM-DD",
    "time_format": "HH:mm:ss"
  },
  "thresholds": {
    "temperature": {
      "warning": 65,
      "critical": 75
    },
    "rx_power": {
      "warning": -10,
      "critical": -15
    },
    "tx_power": {
      "warning": -10,
      "critical": -15
    },
    "voltage": {
      "warning_low": 3.0,
      "warning_high": 3.5
    }
  },
  "backup": {
    "enabled": true,
    "schedule": "0 0 * * *",
    "retention": 7
  }
}

### 9. 告警管理
#### 9.1 获取告警
```http
GET /api/v1/alerts?page=1&per_page=20&severity=high,medium&status=active
```
```json
{
  "total": 45,
  "page": 1,
  "per_page": 20,
  "alerts": [
    {
      "id": "alert-123",
      "message": "模块 MOD-001 温度过高",
      "severity": "high",
      "source": "系统监控",
      "timestamp": "2023-03-29T15:30:00Z",
      "status": "active",
      "acknowledged": false,
      "module_id": "CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G",
      "device_id": "SW01",
      "metric": "temperature",
      "value": 75.2,
      "threshold": 70
    }
  ]
}
```#### 9.2 更新告警状态（确认/解决）
```http
PUT /api/v1/alerts/{alertId}
```
```json
# 请求体
{
  "acknowledged": true,
  "resolution": "模块已更换",
  "status": "resolved"
}
```




