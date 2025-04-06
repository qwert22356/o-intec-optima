## ✅ Database Table Recommendations (Unified Table Names / Field Descriptions / Types / Purpose)

---

### 📈 1. Table：grpc_interface_metrics（InfluxDB）
- **Purpose**: Collects real-time gRPC metric data at 1-minute intervals for performance monitoring and trend prediction.

| Field Name | Type | Description |
|--------|------|------|
| timestamp | datetime | Collection timestamp |
| module_id | string | unique identifier of the optical module (including manufacturer + location + interface) |
| datacenter | string | Datacenter location |
| room | string | Room / Pod |
| rack | string | Rack position |
| device_ip | string | Device IP address |
| device_hostname | string | Switch name |
| device_vendor | string | Vendor name |
| interface | string | Interface name |
| speed | string | Interface speed (e.g., 100G) |
| admin_status | string | Administrative status of interface |
| oper_status | string | Operational status of interface |
| mtu | int | MTU size of interface |
| duplex | string | Duplex mode (Full/Half) |
| rx_bytes / tx_bytes | int | Received / Transmitted bytes |
| rx_packets / tx_packets | int | Received / Transmitted packets |
| rx_dropped / tx_dropped | int | Dropped packets |
| rx_errors / tx_errors | int | Packet errors |
| crc_errors / fcs_errors | int | CRC/FCS error count |
| flap_count | int | Interface flapping count |
| temperature | float | Module temperature (°C) |
| voltage | float | Module voltage (V) |
| current | float | Module current (A) |
| tx_power / rx_power | float | Transmit / Receive power (dBm) |
| optic_vendor | string | Optical module vendor |
| optic_type | string | Optical module type (e.g., QSFP28) |
| optic_serial | string | Optical module serial number |

---

### 📡 2. Table：snmp_interface_status（TimescaleDB）
- **Purpose***: Collects SNMP interface status, broadcast storms, link anomalies, MAC statistics, and more.

| Field Name | Type | Description |
|--------|------|------|
| timestamp | timestamptz | Timestamp |
| module_id | text | Module unique identifier |
| datacenter / room / rack | text | Location information |
| device_ip / hostname / vendor | text | Device information |
| interface | text | Interface name |
| speed | text | Interface speed |
| ifIndex / ifDescr / ifAlias | text/int | Interface index / description / alias |
| ifType | text | Interface type (e.g., Ethernet) |
| ifAdminStatus / ifOperStatus | int | 	Admin / operational status |
| ifLastChange | bigint | Last state change time (ticks) |
| ifSpeed | bigint | Interface speed (bps) |
| ifHCInOctets / ifHCOutOctets | bigint | High-precision RX / TX bytes |
| ifInErrors / ifOutErrors | int | Error count |
| ifInDiscards / ifOutDiscards | int | Discard count |
| ifInBroadcastPkts / ifOutBroadcastPkts | int | Broadcast packets |
| ifInMulticastPkts / ifOutMulticastPkts | int | Multicast packets |
| ifInUcastPkts / ifOutUcastPkts | int | Unicast packets |

---

### 📜 3. Index：syslog-events（Elasticsearch）
- **Purpose**：Structured storage of syslog logs from network devices for protocol events, link failures, and status change analysis.

| Field Name | Type | Description |
|--------|------|------|
| timestamp | datetime | Log timestamp |
| module_id | string | Corresponding module identifier (mapped from interface) |
| device_ip / hostname / vendor | string | Device information |
| facility | string | Syslog facility type |
| severity | string | Severity level (0-Emergency/1-Alert/2-Critical/3-Error/4-Warning/5-Notice/6-Informational/7-Debug) |
| message | string | Raw log content |
| parsed_event.protocol | string | Protocol name (e.g., OSPF) |
| parsed_event.event | string | Event type (e.g., neighbor-down) |
| parsed_event.interface | string | Related interface |
| parsed_event.neighbor_ip | string | Neighbor IP (e.g., OSPF neighbor) |
| parsed_event.reason | string | Event trigger reason |

---

### 🧭 4. Table：lldp_neighbors（TimescaleDB）
- **Purpose**: Stores LLDP neighbor discovery information for automatic topology analysis.

| Field Name | Type | Description |
|--------|------|------|
| timestamp | timestamptz | Timestamp |
| module_id | text | Module ID (local port) |
| device_ip / hostname / vendor | text | Local device information |
| datacenter / room / rack | text | Location info |
| interface | text | Local interface |
| remote_device_id | text | Neighbor device ID (system name) |
| remote_device_ip | text | Neighbor device IP (optional) |
| remote_port_id | text | Neighbor interface ID |
| remote_chassis_id | text | Neighbor chassis ID |
| remote_system_name | text | Neighbor system name |
| remote_port_desc | text | Neighbor port description |
| remote_system_desc | text | Neighbor device description |
| remote_capabilities | text | Capabilities (e.g., router/switch) |
| topology_role | text | Topology role (e.g., Leaf/Spine) |

---

### 🧠 5. Table：module_ddm_metrics（Parquet）
- **Purpose**: Historical DDM data of optical modules for model training and trend analysis.

| Field Name | Type | Description |
|--------|------|------|
| timestamp | datetime | Timestamp |
| module_id | string | Module identifier |
| temperature / voltage / current | float | Temperature / Voltage / Current |
| tx_power / rx_power | float | TX / RX optical power |
| device_vendor | string | Vendor information |
| interface | string | Interface info |
| datacenter / room / rack | string | Location info |

---

### 📊 6. Table：prediction_result（Parquet）
- **Purpose**: Records AI model prediction results for optical modules and triggered rule details.

| Field Name | Type | Description |
|--------|------|------|
| timestamp | datetime | Prediction timestamp |
| module_id | string | Module ID |
| failure_probability | float | Failure probability (0-100) |
| failure_time_estimate | datetime | Estimated failure time |
| model_name | string | Model name (e.g., ARIMA+IF) |
| remaining_days | int | Remaining life in days |
| hit_rules | json | Triggered rule details |

---

## Common Fields for All Tables
✅ Common field descriptions（All table including）
| Field Name | Type | Description |
|--------|------|------|
| timestamp | datetime | Data timestamp (ISO format) |
| module_id	| string | Unique identifier, e.g., CISCO-DC1-Pod01-Rack01-SW01-Eth1/1-100G |
| datacenter | string | Datacenter identifier |
| room | string | Room / Pod |
| rack | string | Rack |
| device_hostname | string | Device hostname |
| device_ip	| string | Device IP address |
| device_vendor	| string | Vendor name |
| interface	| string | Interface name, e.g., Ethernet1/1 |
| speed | string | Interface speed, e.g., 100G |

## syslog-events Severity level 
| Level Number| Name| Description| Explanation
|--------|------|------|------|
| 0	| Emergency	| System Unavailable| The system is unusable (e.g., power failure, system crash)
| 1	| Alert	| Immediate Action	| Must be addressed immediately (e.g., database corruption)
| 2	| Critical	| Critical Condition| Severe conditions (e.g., hardware failure, link down)
| 3	| Error	| Error Condition| Error events (e.g., interface errors, protocol failures)
| 4	| Warning| Warning Condition| Non-critical issues needing attention (e.g., port flapping)
| 5	| Notice| Normal but Significant| Normal but important events (e.g., config changes)
| 6	| Informational| Informational Message| General information (e.g., device boot, interface up/down)
| 7	| Debug	| Debug-Level Message| Debug-level messages, most detailed logs
