import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server, Network, ArrowUpDown, ArrowDown, ArrowUp, Wind, Thermometer, Cpu, Layers, Settings, PlugZap, ListFilter } from 'lucide-react';
import { MOCK_DATA } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, className = '' }) => (
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

const StatusBadge = ({ status }) => {
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

const OpticalModuleCard = ({ module }) => (
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

const InterfaceTable = ({ interfaces }) => (
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
              错误
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
                {iface.errors > 0 ? (
                  <span className="text-red-600">{iface.errors}</span>
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

const DeviceStatusCard = ({ title, status, icon: Icon }) => (
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
  const [interfaces, setInterfaces] = useState([]);
  const [opticalModules, setOpticalModules] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({
    fans: { state: "normal", detail: "风扇运行正常，4500 RPM" },
    temperature: { state: "normal", detail: "CPU温度 45℃, 系统温度 38℃" },
    power: { state: "normal", detail: "电源1: 在线, 电源2: 在线" }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockInterfaces = [
          { 
            name: "Ethernet1/1", 
            status: "up", 
            adminStatus: "up", 
            speed: "100 Gbps", 
            mtu: 9216, 
            duplex: "full", 
            autoNeg: true,
            rxBytes: "1.2 GB",
            txBytes: "856 MB",
            rxPackets: "1,203,456",
            txPackets: "987,654",
            drops: 0,
            errors: 0
          },
          { 
            name: "Ethernet1/2", 
            status: "up", 
            adminStatus: "up", 
            speed: "100 Gbps", 
            mtu: 9216, 
            duplex: "full", 
            autoNeg: true,
            rxBytes: "985 MB",
            txBytes: "756 MB",
            rxPackets: "1,001,234",
            txPackets: "896,321",
            drops: 2,
            errors: 0
          },
          { 
            name: "Ethernet1/3", 
            status: "down", 
            adminStatus: "up", 
            speed: "100 Gbps", 
            mtu: 9216, 
            duplex: "full", 
            autoNeg: true,
            rxBytes: "0",
            txBytes: "0",
            rxPackets: "0",
            txPackets: "0",
            drops: 0,
            errors: 8
          },
          { 
            name: "Ethernet1/4", 
            status: "down", 
            adminStatus: "down", 
            speed: "100 Gbps", 
            mtu: 9216, 
            duplex: "full", 
            autoNeg: true,
            rxBytes: "0",
            txBytes: "0",
            rxPackets: "0",
            txPackets: "0",
            drops: 0,
            errors: 0
          },
          { 
            name: "Ethernet2/1", 
            status: "up", 
            adminStatus: "up", 
            speed: "100 Gbps", 
            mtu: 9216, 
            duplex: "full", 
            autoNeg: true,
            rxBytes: "2.5 GB",
            txBytes: "1.8 GB",
            rxPackets: "2,345,678",
            txPackets: "1,987,654",
            drops: 0,
            errors: 0
          }
        ];
        
        const mockOpticalModules = [
          {
            name: "Ethernet1/1",
            present: true,
            vendor: "Finisar",
            partNumber: "FTLX8571D3BCL",
            serialNumber: "AGD1950A1Z1",
            connectorType: "LC",
            transceiverType: "SFP+",
            domSupport: true,
            calibration: "internal",
            temperature: "45.7°C",
            voltage: "3.3V",
            txPower: "-1.5 dBm",
            rxPower: "-2.1 dBm"
          },
          {
            name: "Ethernet1/2",
            present: true,
            vendor: "Finisar",
            partNumber: "FTLX8571D3BCL",
            serialNumber: "AGD1951B2Z1",
            connectorType: "LC",
            transceiverType: "SFP+",
            domSupport: true,
            calibration: "internal",
            temperature: "48.2°C",
            voltage: "3.29V",
            txPower: "-1.3 dBm",
            rxPower: "-2.0 dBm"
          },
          {
            name: "Ethernet1/3",
            present: true,
            vendor: "Cisco",
            partNumber: "QSFP-100G-SR4-S",
            serialNumber: "FNS21520QS2",
            connectorType: "MPO",
            transceiverType: "QSFP28",
            domSupport: true,
            calibration: "external",
            temperature: "52.5°C",
            voltage: "3.31V",
            txPower: "-1.8 dBm",
            rxPower: "-5.7 dBm"
          },
          {
            name: "Ethernet2/1",
            present: true,
            vendor: "Intel",
            partNumber: "E25GSFP28-LR-I",
            serialNumber: "INTL2550A1Z1",
            connectorType: "LC",
            transceiverType: "SFP28",
            domSupport: true,
            calibration: "internal",
            temperature: "42.1°C",
            voltage: "3.28V",
            txPower: "-1.9 dBm",
            rxPower: "-3.1 dBm"
          }
        ];
        
        setInterfaces(mockInterfaces);
        setOpticalModules(mockOpticalModules);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const interfaceStats = {
    total: interfaces.length,
    up: interfaces.filter(i => i.status === "up").length,
    down: interfaces.filter(i => i.status === "down").length,
    adminDown: interfaces.filter(i => i.adminStatus === "down").length,
    errors: interfaces.reduce((acc, i) => acc + i.errors, 0)
  };

  return (
    <div className="space-y-6">
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
          title="告警模块"
          value={MOCK_DATA.criticalModules}
          icon={AlertTriangle}
          className="bg-red-50"
        />
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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