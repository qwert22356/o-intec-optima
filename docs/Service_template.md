## 服务模板结构（按模块划分）

```plaintext
services/
├── __init__.py
├── dashboard_service.py          # 仪表盘统计服务
│   ├── get_overview()
│   ├── get_recent_alerts(limit)
│   └── get_device_connection_status(page, per_page)
│
├── device_service.py            # 设备详情与面板服务
│   ├── get_device_ports(device_id)
│   ├── get_device_port_detail(device_id, port_id)
│   ├── get_related_devices(device_id)   # 设备选择相关联（简版）
│   └── get_device_related_connections(device_id)  # 设备上下联连接详情（详细版）
│
├── module_service.py            # 光模块监控与详情服务
│   ├── get_modules(filters, page, per_page)
│   ├── get_module_detail(module_id)
│   ├── get_module_history(module_id, metric, period, interval)
│
├── predict_service.py           # 模块预测服务
│   ├── get_prediction_list()
│   ├── get_prediction_detail(module_id)
│   ├── get_prediction_statistics()
│   ├── get_prediction_rules(module_id)
│   ├── get_module_connection_detail(module_id)
│   ├── get_urgent_modules(hours_threshold)
│   ├── get_failure_factors()
│   ├── get_all_rules()
│   ├── get_rule_accuracy()
│   ├── get_prediction_timeseries()
│   ├── get_rule_detail(rule_id)
│   └── create_prediction_rule(rule_info)
│
├── statistics_service.py        # 数据统计页面服务
│   ├── get_compatibility_overview()
│   ├── get_vendor_comparison()
│   ├── get_compatibility_by_speed()
│   ├── get_replacement_overview()
│   ├── get_replacement_by_vendor_year()
│   ├── get_replacement_by_speed()
│   ├── get_replacement_matrix()
│   ├── get_vendor_detail()
│   ├── get_module_logs()
│   └── get_ai_compatibility_analysis()
│
├── config_service.py            # 配置管理服务
│   ├── get_data_collection_config()
│   ├── set_data_collection_config(config)
│   ├── get_database_config()
│   ├── set_database_config(config)
│   ├── get_alert_policies()
│   ├── update_alert_policies(policies)
│   ├── get_notification_config()
│   └── set_notification_config(config)
│
├── llm_service.py               # 智能问答服务
│   ├── chat_with_context(message, context_id)
│   ├── get_chat_history(page, per_page)
│   └── get_llm_settings()
│   └── update_llm_settings(settings)
│
├── auth_service.py              # 认证服务
│   └── login(username, password)
│
├── settings_service.py          # 系统设置服务
│   └── get_settings()
│   └── update_settings(settings)
│
├── alert_service.py             # 告警管理服务
│   ├── get_alerts(filters)
│   └── update_alert(alert_id, resolution_info)
```
