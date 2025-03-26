import React, { useState, useEffect } from 'react';
import { Check, Wifi, Clock, AlertTriangle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface ConnectedDevice {
  id: string;
  ip: string;
  protocol: 'snmp' | 'grpc' | 'syslog';
  status: 'connected' | 'disconnected' | 'warning';
  lastSeen: string;
  frequency: number; // 采集频率，单位秒
  responseTime: number; // 响应时间，单位毫秒
  deviceId?: string; // 映射到Dashboard设备选择的ID
}

interface DeviceConnectionStatusProps {
  devices: ConnectedDevice[];
  onDeviceSelect?: (device: ConnectedDevice) => void;
}

export function DeviceConnectionStatus({ devices, onDeviceSelect }: DeviceConnectionStatusProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  // 重置分页当筛选条件改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, protocolFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProtocolBadge = (protocol: string) => {
    switch (protocol) {
      case 'snmp':
        return 'bg-blue-50 text-blue-600';
      case 'grpc':
        return 'bg-purple-50 text-purple-600';
      case 'syslog':
        return 'bg-teal-50 text-teal-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };
  
  // 应用筛选逻辑
  const filteredDevices = devices.filter(device => {
    // 搜索词筛选
    if (searchTerm && !device.ip.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // 协议筛选
    if (protocolFilter !== 'all' && device.protocol !== protocolFilter) {
      return false;
    }
    
    // 状态筛选
    if (statusFilter !== 'all' && device.status !== statusFilter) {
      return false;
    }
    
    return true;
  });
  
  // 计算分页
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  
  // 页面导航
  const goToPage = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 点击设备行的处理函数
  const handleDeviceClick = (device: ConnectedDevice) => {
    if (onDeviceSelect && device.status === 'connected') {
      setSelectedDeviceId(device.id);
      onDeviceSelect(device);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">设备连接状态</h3>
        <p className="text-sm text-gray-500 mt-1">监控设备连接协议与数据采集频率</p>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {/* 搜索框 */}
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              placeholder="搜索设备IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-full border border-gray-300 rounded-md text-sm"
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* 协议筛选 */}
          <select 
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">所有协议</option>
            <option value="snmp">SNMP</option>
            <option value="grpc">gRPC</option>
            <option value="syslog">Syslog</option>
          </select>
          
          {/* 状态筛选 */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">所有状态</option>
            <option value="connected">已连接</option>
            <option value="disconnected">已断开</option>
            <option value="warning">不稳定</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                设备IP
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                协议
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                采集频率
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                响应时间
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最后活动
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((device) => (
              <tr 
                key={device.id} 
                className={`hover:bg-gray-50 ${device.status === 'connected' ? 'cursor-pointer' : ''} ${selectedDeviceId === device.id ? 'bg-blue-50' : ''}`}
                onClick={() => device.status === 'connected' && handleDeviceClick(device)}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className={`text-sm font-medium ${selectedDeviceId === device.id ? 'text-blue-600' : 'text-gray-900'}`}>
                    {device.ip}
                    {selectedDeviceId === device.id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">已选择</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getProtocolBadge(device.protocol)}`}>
                    {device.protocol.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status === 'connected' && <Check className="w-3 h-3 mr-1" />}
                    {device.status === 'disconnected' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {device.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {device.status === 'connected' ? '已连接' : device.status === 'disconnected' ? '已断开' : '不稳定'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {device.frequency}秒
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {device.responseTime}ms
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Wifi className="w-3 h-3 mr-1 text-gray-400" />
                    {device.lastSeen}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 分页控件 */}
      {filteredDevices.length > 0 ? (
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示第 <span className="font-medium">{indexOfFirstItem + 1}</span> 至 <span className="font-medium">{Math.min(indexOfLastItem, filteredDevices.length)}</span> 项，共 <span className="font-medium">{filteredDevices.length}</span> 项
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={5}>5项/页</option>
                  <option value={10}>10项/页</option>
                  <option value={20}>20项/页</option>
                </select>
              
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-200 text-center text-gray-500 text-sm">
          未找到符合条件的设备
        </div>
      )}
    </div>
  );
} 