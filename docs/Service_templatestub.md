🧩 dashboard_service.py
# 仪表盘统计服务
```python
def get_overview():
    """获取系统概览指标"""
    pass

def get_recent_alerts(limit: int):
    """获取最近告警记录"""
    pass

def get_device_connection_status(page: int, per_page: int):
    """获取设备连接状态"""
    pass
```
```python
📡 device_service.py
# 设备面板与详情服务

def get_device_ports(device_id: str):
    """获取设备端口状态及面板信息"""
    pass

def get_device_port_detail(device_id: str, port_id: str):
    """获取单个端口详细信息"""
    pass

def get_related_devices(device_id: str):
    """获取同Pod内上下联的网络设备（简版）"""
    pass

def get_device_related_connections(device_id: str):
    """获取设备上下联连接详情（带LLDP邻居信息）"""
    pass
```
```python
🔍 module_service.py
# 光模块服务

def get_modules(filters: dict, page: int, per_page: int):
    """获取光模块列表"""
    pass

def get_module_detail(module_id: str):
    """获取光模块详情"""
    pass

def get_module_history(module_id: str, metric: str, period: str, interval: str):
    """获取光模块历史指标数据"""
    pass
```
```python
📈 predict_service.py
# 预测服务

def get_prediction_list():
    """获取预测光模块列表"""
    pass

def get_prediction_detail(module_id: str):
    """获取光模块预测详情"""
    pass

def get_prediction_statistics():
    """获取全局预测统计数据"""
    pass

def get_prediction_rules(module_id: str):
    """获取某模块命中的预测规则列表"""
    pass

def get_module_connection_detail(module_id: str):
    """获取光模块链路连接信息（interface + neighbor）"""
    pass

def get_urgent_modules(hours_threshold: int):
    """获取急需维护的模块列表"""
    pass

def get_failure_factors():
    """获取故障因子统计"""
    pass

def get_all_rules():
    """获取所有预测规则列表"""
    pass

def get_rule_accuracy():
    """获取各行业模型规则准确率"""
    pass

def get_prediction_timeseries():
    """获取预测命中时间序列统计"""
    pass

def get_rule_detail(rule_id: str):
    """获取单条预测规则详情"""
    pass

def create_prediction_rule(rule_info: dict):
    """创建新预测规则"""
    pass
```
```python
📊 statistics_service.py

# 数据统计服务

def get_compatibility_overview():
    """获取光模块兼容性总览"""
    pass

def get_vendor_comparison():
    """获取同/异厂商兼容性对比"""
    pass

def get_compatibility_by_speed():
    """获取不同速率下的兼容性统计"""
    pass

def get_replacement_overview():
    """获取光模块更换率概览"""
    pass

def get_replacement_by_vendor_year():
    """按厂商/年份获取更换率统计"""
    pass

def get_replacement_by_speed():
    """按速率获取更换率统计"""
    pass

def get_replacement_matrix():
    """获取厂商×速率更换率矩阵"""
    pass

def get_vendor_detail():
    """获取厂商详细信息"""
    pass

def get_module_logs():
    """获取光模块相关日志（按条件）"""
    pass

def get_ai_compatibility_analysis():
    """获取 AI 分析的兼容性报告"""
    pass
```
```python
⚙️ config_service.py
# 配置服务

def get_data_collection_config():
    """获取采集配置"""
    pass

def set_data_collection_config(config: dict):
    """设置采集配置"""
    pass

def get_database_config():
    """获取数据库配置"""
    pass

def set_database_config(config: dict):
    """设置数据库配置"""
    pass

def get_alert_policies():
    """获取告警策略配置"""
    pass

def update_alert_policies(policies: list):
    """更新或新增告警策略"""
    pass

def get_notification_config():
    """获取通知推送配置"""
    pass

def set_notification_config(config: dict):
    """设置通知推送配置"""
    pass
```
```python

🧠 llm_service.py
# 智能问答服务

def chat_with_context(message: str, context_id: str = None, include_history: bool = True):
    """提交问题并返回回答，支持上下文"""
    pass

def get_chat_history(page: int, per_page: int):
    """获取历史会话记录"""
    pass

def get_llm_settings():
    """获取 LLM 模型配置"""
    pass

def update_llm_settings(settings: dict):
    """更新 LLM 模型配置"""
    pass
🔐 auth_service.py
python
Copy
Edit
# 用户认证

def login(username: str, password: str):
    """用户登录获取 Token"""
    pass
🛠️ settings_service.py
python
Copy
Edit
# 系统设置服务

def get_settings():
    """获取系统设置"""
    pass

def update_settings(settings: dict):
    """更新系统设置"""
    pass
```
```python
🚨 alert_service.py

# 告警管理服务

def get_alerts(filters: dict):
    """获取告警列表（支持条件）"""
    pass

def update_alert(alert_id: str, resolution_info: dict):
    """确认告警 / 关闭告警 / 添加备注"""
    pass
```