import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server, Network, ArrowUpDown, ArrowDown, ArrowUp, Wind, Thermometer, Cpu, Layers, Settings, PlugZap, ListFilter, Router } from 'lucide-react';
import { MOCK_DATA } from '../lib/utils';

// 定义类型接口
interface NetworkInterface {
  name: string;
  status: string;
  adminStatus: string;
  speed: string;
  mtu: number;
  duplex: string;
  autoNeg: boolean;
  rxBytes: string;
  txBytes: string;
  rxPackets: string;
  txPackets: string;
  drops: number;
  crcErrors: number;
  frameErrors: number;
  errors: number;
}

interface OpticalModule {
  name: string;
  present: boolean;
  vendor: string;
  partNumber: string;
  serialNumber: string;
  connectorType: string;
  transceiverType: string;
  domSupport: boolean;
  calibration: string;
  temperature: string;
  voltage: string;
  txPower: string;
  rxPower: string;
}

interface DeviceStatusInfo {
  state: string;
  detail: string;
}

interface DeviceStatus {
  fans: DeviceStatusInfo;
  temperature: DeviceStatusInfo;
  power: DeviceStatusInfo;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  className?: string;
}

interface StatusBadgeProps {
  status: string;
}

interface OpticalModuleCardProps {
  module: OpticalModule;
}

interface InterfaceTableProps {
  interfaces: NetworkInterface[];
}

interface DeviceStatusCardProps {
  title: string;
  status: DeviceStatusInfo;
  icon: React.ComponentType<any>;
}

// 组件定义
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
    <div className="flex items-center">
      <div className="p-2 rounded-lg bg-blue-50">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let className = "px-2 py-1 text-xs rounded-full ";
  if (status === "up") {
    className += "bg-green-100 text-green-800";
  } else if (status === "down") {
    className += "bg-red-100 text-red-800";
  } else {
    className += "bg-gray-100 text-gray-800";
  }
  return <span className={className}>{status}</span>;
};

const OpticalModuleCard: React.FC<OpticalModuleCardProps> = ({ module }) => (
  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
    <div className="border-b px-4 py-3 bg-gray-50 flex justify-between items-center">
      <div className="font-medium text-gray-800">{module.name}</div>
      <StatusBadge status={module.present ? "up" : "down"} />
    </div>
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-sm">
          <span className="text-gray-500">Vendor:</span>
          <div className="font-medium">{module.vendor}</div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Part Number:</span>
          <div className="font-medium">{module.partNumber}</div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Serial Number:</span>
          <div className="font-medium">{module.serialNumber}</div>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Type:</span>
          <div className="font-medium">{module.transceiverType}</div>
        </div>
      </div>
      <div className="border-t pt-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm">
            <span className="text-gray-500">DOM Support:</span>
            <div className="font-medium">{module.domSupport ? "Yes" : "No"}</div>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Temperature:</span>
            <div className={`font-medium ${parseFloat(module.temperature) > 70 ? 'text-red-600' : 'text-gray-800'}`}>
              {module.temperature}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InterfaceTable: React.FC<InterfaceTableProps> = ({ interfaces }) => (
  <div className="rounded-lg overflow-hidden border border-gray-200">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              接口名称
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              速率
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MTU
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              发送/接收字节
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              丢包数量
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CRC错误
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              帧错误
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {interfaces.map((iface) => (
            <tr key={iface.name} className={iface.adminStatus === "down" ? "bg-red-50" : ""}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {iface.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <StatusBadge status={iface.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {iface.speed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {iface.mtu}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <ArrowDown className="w-3 h-3 mr-1 text-green-600" />
                  {iface.rxBytes}
                </div>
                <div className="flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1 text-blue-600" />
                  {iface.txBytes}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {iface.drops > 0 ? (
                  <span className="text-red-600">{iface.drops}</span>
                ) : (
                  <span>0</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {iface.crcErrors > 0 ? (
                  <span className="text-red-600">{iface.crcErrors}</span>
                ) : (
                  <span>0</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {iface.frameErrors > 0 ? (
                  <span className="text-red-600">{iface.frameErrors}</span>
                ) : (
                  <span>0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ title, status, icon: Icon }) => (
  <div className="border rounded-lg overflow-hidden">
    <div className="px-4 py-3 bg-gray-50 border-b">
      <h3 className="font-medium text-gray-800">{title}</h3>
    </div>
    <div className="p-4">
      <div className="flex items-center">
        <Icon className="w-5 h-5 text-gray-500 mr-2" />
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${status.state === "normal" ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className={`text-sm font-medium ${status.state === "normal" ? "text-green-600" : "text-red-600"}`}>
              {status.state === "normal" ? "正常" : "异常"}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">{status.detail}</div>
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [opticalModules, setOpticalModules] = useState<OpticalModule[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    fans: { state: "normal", detail: "风扇运行正常，4500 RPM" },
    temperature: { state: "normal", detail: "CPU温度 45℃, 系统温度 38℃" },
    power: { state: "normal", detail: "电源1: 在线, 电源2: 在线" }
  });
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState("device1");
  const [devices, setDevices] = useState<{id: string, name: string, type: string, interfaces: number}[]>([]);

  // 模拟从gNMI获取设备列表
  useEffect(() => {
    // 模拟从gNMI获取所有设备的信息
    const fetchDevices = async () => {
      // 这里会被替换为真实的API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockDevices = [
        { id: "device1", name: "核心交换机-1", type: "C8000-SUP6", interfaces: 48 },
        { id: "device2", name: "核心交换机-2", type: "C8000-SUP6", interfaces: 48 },
        { id: "device3", name: "接入交换机-1", type: "S5800-48T", interfaces: 52 },
        { id: "device4", name: "接入交换机-2", type: "S5800-48T", interfaces: 52 },
        { id: "device5", name: "TOR交换机-1", type: "S6700-24C", interfaces: 28 },
        { id: "device6", name: "TOR交换机-2", type: "S6700-24C", interfaces: 28 },
        { id: "device7", name: "边界交换机-1", type: "N7710", interfaces: 128 },
        { id: "device8", name: "边界交换机-2", type: "N7710", interfaces: 128 }
      ];
      
      setDevices(mockDevices);
    };
    
    fetchDevices();
  }, []);

  // 根据选择的设备获取详细信息
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 这里会被替换为真实的 gNMI 数据获取
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 根据选择的设备生成不同数量的接口
        const deviceInfo = devices.find(d => d.id === selectedDevice);
        const interfaceCount = deviceInfo ? deviceInfo.interfaces : 0;
        
        // 生成接口数据
        const mockInterfaces: NetworkInterface[] = [];
        for (let i = 1; i <= interfaceCount; i++) {
          // 模拟一些接口故障情况
          const hasIssue = Math.random() < 0.1; // 10%的接口有问题
          const isDown = Math.random() < 0.05; // 5%的接口down
          const isAdminDown = Math.random() < 0.03; // 3%的接口管理down
          
          mockInterfaces.push({ 
            name: `Ethernet${i}`, 
            status: isDown ? "down" : "up", 
            adminStatus: isAdminDown ? "down" : "up", 
            speed: ["10 Gbps", "25 Gbps", "40 Gbps", "100 Gbps"][Math.floor(Math.random() * 4)], 
            mtu: [1500, 9000, 9216][Math.floor(Math.random() * 3)], 
            duplex: "full", 
            autoNeg: Math.random() > 0.2,
            rxBytes: `${(Math.random() * 5).toFixed(1)} GB`,
            txBytes: `${(Math.random() * 3).toFixed(1)} GB`,
            rxPackets: `${Math.floor(Math.random() * 10000000)}`,
            txPackets: `${Math.floor(Math.random() * 8000000)}`,
            drops: hasIssue && Math.random() < 0.3 ? Math.floor(Math.random() * 50) : 0,
            crcErrors: hasIssue && Math.random() < 0.4 ? Math.floor(Math.random() * 20) : 0,
            frameErrors: hasIssue && Math.random() < 0.2 ? Math.floor(Math.random() * 10) : 0,
            errors: hasIssue && Math.random() < 0.5 ? Math.floor(Math.random() * 30) : 0
          });
        }
        
        // 生成光模块数据 - 每台设备只有部分接口安装了光模块
        const moduleCount = Math.floor(interfaceCount * 0.6); // 60%的接口装有光模块
        const mockOpticalModules: OpticalModule[] = [];
        
        const vendors = ["Finisar", "Intel", "Cisco", "Juniper", "Huawei"];
        const transceiverTypes = ["SFP", "SFP+", "QSFP+", "QSFP28", "SFP28"];
        const connectorTypes = ["LC", "SC", "MPO", "MT-RJ"];
        
        for (let i = 1; i <= moduleCount; i++) {
          const portIndex = Math.floor(Math.random() * interfaceCount) + 1;
          const vendor = vendors[Math.floor(Math.random() * vendors.length)];
          const type = transceiverTypes[Math.floor(Math.random() * transceiverTypes.length)];
          const connector = connectorTypes[Math.floor(Math.random() * connectorTypes.length)];
          const temp = (Math.random() * 30 + 30).toFixed(1); // 30-60°C
          
          mockOpticalModules.push({
            name: `Ethernet${portIndex}`,
            present: Math.random() > 0.05, // 5%概率模块不在位
            vendor,
            partNumber: `${vendor}-${type}-${Math.floor(Math.random() * 1000)}`,
            serialNumber: `${vendor[0]}${type[0]}${Math.floor(Math.random() * 10000000)}`,
            connectorType: connector,
            transceiverType: type,
            domSupport: Math.random() > 0.1, // 90%支持DOM
            calibration: Math.random() > 0.5 ? "internal" : "external",
            temperature: `${temp}°C`,
            voltage: `${(Math.random() * 0.2 + 3.2).toFixed(2)}V`,
            txPower: `${(Math.random() * 3 - 5).toFixed(1)} dBm`,
            rxPower: `${(Math.random() * 5 - 8).toFixed(1)} dBm`
          });
        }
        
        // 随机设备状态问题
        const randomStatus: DeviceStatus = {
          fans: { 
            state: Math.random() < 0.05 ? "warning" : "normal", 
            detail: Math.random() < 0.05 ? "风扇#2转速降低，4100 RPM" : "风扇运行正常，4500 RPM" 
          },
          temperature: { 
            state: Math.random() < 0.05 ? "warning" : "normal", 
            detail: Math.random() < 0.05 ? "CPU温度 58℃ (接近阈值), 系统温度 45℃" : "CPU温度 45℃, 系统温度 38℃" 
          },
          power: { 
            state: Math.random() < 0.05 ? "warning" : "normal", 
            detail: Math.random() < 0.05 ? "电源1: 在线, 电源2: 离线" : "电源1: 在线, 电源2: 在线" 
          }
        };
        
        setInterfaces(mockInterfaces);
        setOpticalModules(mockOpticalModules);
        setDeviceStatus(randomStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };
    
    if (selectedDevice && devices.length > 0) {
      fetchData();
    }
  }, [selectedDevice, devices]);

  // 计算接口统计数据
  const interfaceStats = {
    total: interfaces.length,
    up: interfaces.filter(i => i.status === "up").length,
    down: interfaces.filter(i => i.status === "down").length,
    adminDown: interfaces.filter(i => i.adminStatus === "down").length,
    errors: interfaces.reduce((acc, i) => acc + i.errors, 0),
    drops: interfaces.reduce((acc, i) => acc + i.drops, 0),
    crcErrors: interfaces.reduce((acc, i) => acc + i.crcErrors, 0),
    frameErrors: interfaces.reduce((acc, i) => acc + i.frameErrors, 0)
  };

  return (
    <div className="space-y-6">
      {/* 设备选择器 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">设备选择</h2>
          
          <div className="flex flex-wrap gap-2">
            {devices.map(device => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedDevice === device.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <Router className="w-4 h-4 mr-2" />
                  <span>{device.name}</span>
                </div>
                <div className="text-xs mt-1 opacity-80">
                  {device.type} | {device.interfaces}端口
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="健康评分"
          value={`${MOCK_DATA.healthScore}%`}
          icon={Activity}
        />
        <StatCard
          title="在线模块"
          value={opticalModules.filter(m => m.present).length}
          icon={Cpu}
        />
        <StatCard
          title="接口状态"
          value={`${interfaceStats.up}/${interfaceStats.total}`}
          icon={Network}
        />
        <StatCard
          title="错误统计"
          value={interfaceStats.errors + interfaceStats.crcErrors + interfaceStats.frameErrors}
          icon={AlertTriangle}
          className={interfaceStats.errors > 0 ? "bg-red-50" : ""}
        />
      </div>

      {/* 错误统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">丢包数量</div>
          <div className="text-2xl font-semibold">{interfaceStats.drops}</div>
          <div className="text-xs text-gray-500 mt-1">来自 {interfaces.filter(i => i.drops > 0).length} 个接口</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">CRC错误</div>
          <div className="text-2xl font-semibold">{interfaceStats.crcErrors}</div>
          <div className="text-xs text-gray-500 mt-1">来自 {interfaces.filter(i => i.crcErrors > 0).length} 个接口</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">帧错误</div>
          <div className="text-2xl font-semibold">{interfaceStats.frameErrors}</div>
          <div className="text-xs text-gray-500 mt-1">来自 {interfaces.filter(i => i.frameErrors > 0).length} 个接口</div>
        </div>
      </div>

      {/* 接口状态表格 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between mb-4 items-center">
          <h2 className="text-lg font-semibold text-gray-900">接口状态</h2>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-gray-700">激活: {interfaceStats.up}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-gray-700">断开: {interfaceStats.down}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
              <span className="text-gray-700">管理禁用: {interfaceStats.adminDown}</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <InterfaceTable interfaces={interfaces} />
        )}
      </div>

      {/* 光模块和设备信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 光模块信息 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">光模块信息</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opticalModules.map((module) => (
                <OpticalModuleCard key={module.name} module={module} />
              ))}
            </div>
          )}
        </div>

        {/* 设备状态和告警 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">设备状态</h2>
            
            <div className="space-y-4">
              <DeviceStatusCard 
                title="风扇状态" 
                status={deviceStatus.fans} 
                icon={Wind} 
              />
              
              <DeviceStatusCard 
                title="温度状态" 
                status={deviceStatus.temperature} 
                icon={Thermometer} 
              />
              
              <DeviceStatusCard 
                title="电源状态" 
                status={deviceStatus.power} 
                icon={PlugZap} 
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近告警</h2>
            <div className="space-y-4">
              {MOCK_DATA.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg"
                >
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}