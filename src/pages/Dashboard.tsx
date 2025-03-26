import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server, Network, ArrowUpDown, ArrowDown, ArrowUp, Wind, Thermometer, Cpu, Layers, Settings, PlugZap, ListFilter, Router } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import SwitchPanel from '../components/SwitchPanel';
import PortDetailsDialog from '../components/PortDetailsDialog';
import { MOCK_DATA, formatBytes } from '../lib/utils';
import type { Port } from '../components/SwitchPanel';

// 组件接口定义
interface NetworkInterface {
  id: string;
  name: string;
  status: string;
  adminStatus: string;
  description: string;
  speed: string;
  mac: string;
  ip: string;
  mtu: string;
  errors: number;
  drops: number;
  crcErrors: number;
  frameErrors: number;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
}

interface OpticalModule {
  id: string;
  name: string;
  type: string;
  vendor: string;
  serial: string;
  wavelength: string;
  temperature: number;
  voltage: string;
  txPower: string;
  rxPower: string;
  status: string;
}

interface DeviceStatus {
  fans: { state: string; detail: string };
  temperature: { state: string; detail: string };
  power: { state: string; detail: string };
}

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  className?: string;
}

function StatCard({ title, value, icon: Icon, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mt-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// 设备状态卡片组件
interface DeviceStatusCardProps {
  title: string;
  status: { state: string; detail: string };
  icon: React.ElementType;
}

function DeviceStatusCard({ title, status, icon: Icon }: DeviceStatusCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${status.state === 'warning' ? 'bg-yellow-50' : status.state === 'error' ? 'bg-red-50' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className={`h-5 w-5 ${status.state === 'warning' ? 'text-yellow-500' : status.state === 'error' ? 'text-red-500' : 'text-green-500'}`} />
      </div>
      <div className="mt-2">
        <p className="text-base font-medium text-gray-900">{status.state === 'warning' ? '警告' : status.state === 'error' ? '错误' : '正常'}</p>
        <p className="text-sm text-gray-500">{status.detail}</p>
      </div>
    </div>
  );
}

// 接口表格组件
interface InterfaceTableProps {
  interfaces: NetworkInterface[];
}

function InterfaceTable({ interfaces }: InterfaceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">接口</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">速率</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">流量</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">错误</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {interfaces.map((iface) => (
            <tr key={iface.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{iface.name}</div>
                <div className="text-sm text-gray-500">{iface.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  iface.status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {iface.status.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{iface.ip}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{iface.speed}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                  {formatBytes(iface.rxBytes)}
                </div>
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 text-blue-500 mr-1" />
                  {formatBytes(iface.txBytes)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{iface.errors > 0 ? `${iface.errors} 错误` : '无'}</div>
                <div>{iface.crcErrors > 0 ? `${iface.crcErrors} CRC错误` : ''}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 光模块卡片组件
interface OpticalModuleCardProps {
  module: OpticalModule;
}

function OpticalModuleCard({ module }: OpticalModuleCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border ${
      module.status === 'critical' ? 'border-red-300' : 
      module.status === 'warning' ? 'border-yellow-300' : 'border-gray-200'
    }`}>
      <div className={`px-4 py-3 ${
        module.status === 'critical' ? 'bg-red-50' : 
        module.status === 'warning' ? 'bg-yellow-50' : 'bg-gray-50'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">{module.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            module.status === 'critical' ? 'bg-red-100 text-red-800' : 
            module.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {module.status === 'critical' ? '严重' : module.status === 'warning' ? '警告' : '正常'}
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-gray-500">类型:</div>
          <div>{module.type}</div>
          <div className="text-gray-500">厂商:</div>
          <div>{module.vendor}</div>
          <div className="text-gray-500">温度:</div>
          <div className={`${
            module.temperature > 35 ? 'text-red-600' : 
            module.temperature > 30 ? 'text-yellow-600' : 'text-gray-900'
          }`}>
            {module.temperature}°C
          </div>
          <div className="text-gray-500">发送功率:</div>
          <div>{module.txPower} dBm</div>
          <div className="text-gray-500">接收功率:</div>
          <div>{module.rxPower} dBm</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedDevice, setSelectedDevice] = useState('switch1');
  const [activeTab, setActiveTab] = useState('overview');
  const [interfacesData, setInterfacesData] = useState<NetworkInterface[]>([]);
  const [opticalModules, setOpticalModules] = useState<OpticalModule[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    fans: { state: 'normal', detail: '风扇运行正常' },
    temperature: { state: 'normal', detail: '温度在正常范围内' },
    power: { state: 'normal', detail: '电源系统运行正常' }
  });
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);

  // 生成模拟端口数据
  function generateMockPorts(): Port[] {
    const vendors = ['Cisco', 'Huawei', 'Intel', 'Nokia', 'ZTE', 'Juniper'];
    const deviceNames = ['CoreSwitch-01', 'EdgeRouter-02', 'AccessSwitch-03'];
    const rackNames = ['机架A-01', '机架B-02', '机架C-03'];
    const roomNames = ['主机房', '备用机房', '边缘机房'];
    
    return Array.from({ length: 48 }, (_, i) => {
      const moduleInserted = Math.random() > 0.2;
      const status = moduleInserted ? (Math.random() > 0.15 ? 'up' : 'error') : 'down';
      
      return {
        id: `port-${i + 1}`,
        name: `Port ${i + 1}`,
        status: status as 'up' | 'error' | 'down',
        moduleInserted,
        speed: moduleInserted ? '10G' : 'N/A',
        mtu: 1500,
        stats: {
          rxBytes: moduleInserted ? Math.floor(Math.random() * 10000000000) : 0,
          txBytes: moduleInserted ? Math.floor(Math.random() * 8000000000) : 0,
          drops: moduleInserted ? Math.floor(Math.random() * 10) : 0,
          crcErrors: moduleInserted ? Math.floor(Math.random() * 5) : 0,
          frameErrors: moduleInserted ? Math.floor(Math.random() * 3) : 0,
          flopCount: moduleInserted ? Math.floor(Math.random() * 2) : 0
        },
        moduleInfo: moduleInserted ? {
          vendor: vendors[Math.floor(Math.random() * vendors.length)],
          serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          partNumber: `PN-${Math.floor(Math.random() * 9000 + 1000)}`,
          temperature: `${(Math.random() * 20 + 40).toFixed(1)}°C`,
          voltage: `${(3.2 + Math.random() * 0.3).toFixed(2)}V`,
          current: `${(Math.random() * 50 + 20).toFixed(1)}mA`,
          rxPower: `${(-Math.random() * 5 - 5).toFixed(2)}dBm`,
          txPower: `${(-Math.random() * 3 - 3).toFixed(2)}dBm`,
          location: {
            device: deviceNames[Math.floor(Math.random() * deviceNames.length)],
            rack: rackNames[Math.floor(Math.random() * rackNames.length)],
            room: roomNames[Math.floor(Math.random() * roomNames.length)]
          }
        } : undefined
      };
    });
  }

  useEffect(() => {
    // 模拟数据加载
    const fetchData = () => {
      // 模拟接口数据
      const mockInterfaces: NetworkInterface[] = Array(24).fill(null).map((_, i) => ({
        id: `eth${i + 1}`,
        name: `GigabitEthernet1/${i + 1}`,
        status: Math.random() > 0.1 ? 'up' : 'down',
        adminStatus: Math.random() > 0.05 ? 'up' : 'down',
        description: `连接到服务器${i + 1}`,
        speed: `${[1, 10, 25, 40, 100][Math.floor(Math.random() * 5)]}G`,
        mac: '00:1B:44:11:3A:' + (i < 10 ? '0' + i : i).toString(16).toUpperCase(),
        ip: `192.168.1.${i + 1}`,
        mtu: '1500',
        errors: Math.floor(Math.random() * 5),
        drops: Math.floor(Math.random() * 10),
        crcErrors: Math.floor(Math.random() * 3),
        frameErrors: Math.floor(Math.random() * 2),
        rxBytes: Math.floor(Math.random() * 10000000000),
        txBytes: Math.floor(Math.random() * 10000000000),
        rxPackets: Math.floor(Math.random() * 1000000),
        txPackets: Math.floor(Math.random() * 1000000)
      }));

      // 模拟光模块数据
      const mockOpticalModules: OpticalModule[] = Array(12).fill(null).map((_, i) => ({
        id: `module${i + 1}`,
        name: `Transceiver${i + 1}`,
        type: ['SFP+', 'QSFP+', 'QSFP28'][Math.floor(Math.random() * 3)],
        vendor: ['Cisco', 'Juniper', 'Arista', 'Generic'][Math.floor(Math.random() * 4)],
        serial: `SN${Math.floor(Math.random() * 1000000)}`,
        wavelength: '850nm',
        temperature: Math.floor(Math.random() * 15) + 25,
        voltage: (Math.random() * 0.5 + 3.1).toFixed(2),
        txPower: (Math.random() * 2 - 5).toFixed(2),
        rxPower: (Math.random() * 2 - 10).toFixed(2),
        status: Math.random() > 0.1 ? 'ok' : Math.random() > 0.5 ? 'warning' : 'critical'
      }));

      // 模拟设备状态
      const randomStatus: DeviceStatus = {
        fans: {
          state: Math.random() > 0.9 ? 'warning' : 'normal',
          detail: '风扇运行正常'
        },
        temperature: {
          state: Math.random() > 0.9 ? 'warning' : 'normal',
          detail: '温度在正常范围内'
        },
        power: {
          state: Math.random() > 0.95 ? 'error' : 'normal',
          detail: '电源系统运行正常'
        }
      };

      setInterfacesData(mockInterfaces);
      setOpticalModules(mockOpticalModules);
      setDeviceStatus(randomStatus);
      setPorts(generateMockPorts());
    };

    fetchData();
  }, [selectedDevice]);

  // 计算接口统计数据
  const interfaceStats = {
    total: interfacesData.length,
    up: interfacesData.filter(i => i.status === "up").length,
    down: interfacesData.filter(i => i.status === "down").length,
    adminDown: interfacesData.filter(i => i.adminStatus === "down").length,
    errors: interfacesData.reduce((acc, i) => acc + i.errors, 0),
    drops: interfacesData.reduce((acc, i) => acc + i.drops, 0),
    crcErrors: interfacesData.reduce((acc, i) => acc + i.crcErrors, 0),
    frameErrors: interfacesData.reduce((acc, i) => acc + i.frameErrors, 0)
  };

  // 刷新数据
  const refreshData = () => {
    setPorts(generateMockPorts());
    // 生成新的接口和光模块数据
    const mockInterfaces: NetworkInterface[] = Array(24).fill(null).map((_, i) => ({
      id: `eth${i + 1}`,
      name: `GigabitEthernet1/${i + 1}`,
      status: Math.random() > 0.1 ? 'up' : 'down',
      adminStatus: Math.random() > 0.05 ? 'up' : 'down',
      description: `连接到服务器${i + 1}`,
      speed: `${[1, 10, 25, 40, 100][Math.floor(Math.random() * 5)]}G`,
      mac: '00:1B:44:11:3A:' + (i < 10 ? '0' + i : i).toString(16).toUpperCase(),
      ip: `192.168.1.${i + 1}`,
      mtu: '1500',
      errors: Math.floor(Math.random() * 5),
      drops: Math.floor(Math.random() * 10),
      crcErrors: Math.floor(Math.random() * 3),
      frameErrors: Math.floor(Math.random() * 2),
      rxBytes: Math.floor(Math.random() * 10000000000),
      txBytes: Math.floor(Math.random() * 10000000000),
      rxPackets: Math.floor(Math.random() * 1000000),
      txPackets: Math.floor(Math.random() * 1000000)
    }));
    setInterfacesData(mockInterfaces);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">系统仪表盘</h1>
          <p className="mt-1 text-sm text-gray-500">
            监控系统性能、设备状态和资源利用率
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center justify-end space-x-4">
            <div>
              <label htmlFor="device-select" className="sr-only">
                选择设备
              </label>
              <select
                id="device-select"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                <option value="switch1">Switch A - 核心交换机</option>
                <option value="switch2">Switch B - 接入交换机</option>
                <option value="switch3">Switch C - 路由交换机</option>
              </select>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={refreshData}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              刷新数据
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="接口总数"
          value="48"
          icon={Network}
        />
        <StatCard
          title="告警/错误"
          value="2"
          icon={AlertTriangle}
          className="bg-red-50"
        />
        <StatCard
          title="光模块数量"
          value="24"
          icon={PlugZap}
        />
      </div>

      <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="switch">交换机面板</TabsTrigger>
          <TabsTrigger value="interfaces">接口详情</TabsTrigger>
          <TabsTrigger value="modules">光模块</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
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

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">性能指标</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">CPU利用率</span>
                    <span className="text-sm font-medium text-gray-900">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">内存利用率</span>
                    <span className="text-sm font-medium text-gray-900">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">入向带宽利用率</span>
                    <span className="text-sm font-medium text-gray-900">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">出向带宽利用率</span>
                    <span className="text-sm font-medium text-gray-900">57%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '57%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">接口状态统计</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">42</div>
                    <div className="text-sm text-gray-500">UP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-red-600">4</div>
                    <div className="text-sm text-gray-500">DOWN</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-600">2</div>
                    <div className="text-sm text-gray-500">DISABLED</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">光模块类型分布</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">16</div>
                    <div className="text-sm text-gray-500">SFP+</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">6</div>
                    <div className="text-sm text-gray-500">QSFP+</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">2</div>
                    <div className="text-sm text-gray-500">QSFP28</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="switch">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">交换机面板视图</h3>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500">设备：</span>
                  <span className="font-medium ml-1">
                    {selectedDevice === 'switch1' ? 'Switch A - 核心交换机' : 
                     selectedDevice === 'switch2' ? 'Switch B - 接入交换机' : 'Switch C - 路由交换机'}
                  </span>
                </div>
              </div>
              <SwitchPanel
                ports={ports}
                onPortClick={(port) => {
                  setSelectedPort(port);
                  setIsModalOpen(true);
                }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">端口状态汇总</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">{ports.length}</div>
                  <div className="text-sm text-gray-500">总端口数</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {ports.filter(p => p.moduleInserted && p.status === 'up').length}
                  </div>
                  <div className="text-sm text-gray-500">正常端口</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {ports.filter(p => p.moduleInserted && p.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-500">错误端口</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">
                    {ports.filter(p => !p.moduleInserted).length}
                  </div>
                  <div className="text-sm text-gray-500">未使用端口</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">端口速率统计</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">1G端口</div>
                    <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {ports.filter(p => p.moduleInserted && p.speed.includes('1G')).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">10G端口</div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {ports.filter(p => p.moduleInserted && p.speed.includes('10G')).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">25G端口</div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {ports.filter(p => p.moduleInserted && p.speed.includes('25G')).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">40G/100G端口</div>
                    <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {ports.filter(p => p.moduleInserted && (p.speed.includes('40G') || p.speed.includes('100G'))).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="interfaces">
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">接口列表</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ListFilter className="h-4 w-4 mr-1" />
                  过滤
                </button>
                <select
                  className="block pl-3 pr-10 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  defaultValue="all"
                >
                  <option value="all">全部接口</option>
                  <option value="up">UP</option>
                  <option value="down">DOWN</option>
                  <option value="errors">有错误</option>
                </select>
              </div>
            </div>
            <InterfaceTable interfaces={interfacesData} />
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">光模块</h3>
              <div>
                <select
                  className="block pl-3 pr-10 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  defaultValue="all"
                >
                  <option value="all">全部光模块</option>
                  <option value="present">已插入</option>
                  <option value="not-present">未插入</option>
                  <option value="warning">有告警</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {opticalModules.map((module) => (
                <OpticalModuleCard key={module.name} module={module} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isModalOpen && selectedPort && (
        <PortDetailsDialog
          port={selectedPort}
          onClose={() => setIsModalOpen(false)}
          selectedDevice={{ name: selectedDevice === 'switch1' ? 'Switch A - 核心交换机' : 
                                    selectedDevice === 'switch2' ? 'Switch B - 接入交换机' : 'Switch C - 路由交换机' }}
        />
      )}
    </div>
  );
}