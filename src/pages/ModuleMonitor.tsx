import React, { useState, useEffect, useRef } from 'react';
import { MOCK_DATA } from '../lib/utils';
import { AlertCircle, Search, ArrowUpDown, Filter, ChevronDown, X, Download, FileJson, FileSpreadsheet } from 'lucide-react';

// 定义模块数据接口
interface ModuleData {
  id: string;
  name: string;
  health: number;
  temperature: string | number;
  rxPower: string | number;
  txPower: string | number;
  voltage: string | number;
  current: string | number;
  portIndex: string | number;
  device: {
    id: string;
    name: string;
    type: string;
    ip: string;
  } | null;
  rack: {
    id: string;
    name: string;
  } | null;
  room: {
    id: string;
    name: string;
  } | null;
  dataCenter: {
    id: string;
    name: string;
  } | null;
  lastUpdated: string;
}

// 从MOCK_DATA中提取光模块数据
const extractModuleData = (): ModuleData[] => {
  const modules: ModuleData[] = [];
  // 遍历每个数据中心
  MOCK_DATA.topology.nodes.forEach(node => {
    // 只处理光模块类型的节点
    if (node.type === 'module') {
      // 查找所属设备
      const parentNode = MOCK_DATA.topology.nodes.find(n => node.parent === n.id);
      // 查找所属机架
      const rackNode = parentNode ? MOCK_DATA.topology.nodes.find(n => parentNode.parent === n.id) : null;
      // 查找所属机房
      const roomNode = rackNode ? MOCK_DATA.topology.nodes.find(n => rackNode.parent === n.id) : null;
      // 查找所属数据中心
      const dcNode = roomNode ? MOCK_DATA.topology.nodes.find(n => roomNode.parent === n.id) : null;
      
      // 构建完整的光模块信息
      modules.push({
        id: node.id,
        name: node.name,
        health: node.health || Math.floor(Math.random() * 100),
        temperature: node.temperature || (25 + Math.random() * 15).toFixed(1),
        rxPower: -(Math.random() * 5 + 3).toFixed(2),
        txPower: -(Math.random() * 3 + 1).toFixed(2),
        voltage: (3.1 + Math.random() * 0.4).toFixed(2),
        current: (30 + Math.random() * 20).toFixed(1),
        portIndex: node.portIndex || `${Math.floor(Math.random() * 48) + 1}`,
        device: parentNode ? {
          id: parentNode.id,
          name: parentNode.name,
          type: parentNode.type,
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        } : null,
        rack: rackNode ? {
          id: rackNode.id,
          name: rackNode.name
        } : null,
        room: roomNode ? {
          id: roomNode.id,
          name: roomNode.name
        } : null,
        dataCenter: dcNode ? {
          id: dcNode.id,
          name: dcNode.name
        } : null,
        lastUpdated: new Date(Date.now() - Math.random() * 1000000000).toISOString()
      });
    }
  });
  
  return modules;
};

// 定义过滤器接口
interface FilterState {
  dataCenter: string;
  room: string;
  rack: string;
  device: string;
  status: string; // 'normal', 'warning', 'critical'
}

// 定义排序配置接口
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// 定义导出选项类型
type ExportFormat = 'csv' | 'json' | 'excel';

const ModuleMonitor = () => {
  const [moduleData, setModuleData] = useState<ModuleData[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dataCenter: '',
    room: '',
    rack: '',
    device: '',
    status: '' // 'normal', 'warning', 'critical'
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'health',
    direction: 'asc' // 默认按健康分从低到高排序，优先显示问题模块
  });
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  const exportOptionsRef = useRef<HTMLDivElement>(null);
  
  // 初始化数据
  useEffect(() => {
    try {
      setIsLoading(true);
      const data = extractModuleData();
      setModuleData(data);
      setIsLoading(false);
    } catch (err) {
      setError('数据加载失败，请稍后重试');
      setIsLoading(false);
      console.error(err);
    }
  }, []);
  
  // 点击外部关闭导出选项
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportOptionsRef.current && !exportOptionsRef.current.contains(event.target as Node)) {
        setShowExportOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 获取过滤后的数据
  const getFilteredData = () => {
    return moduleData.filter(module => {
      // 搜索过滤
      if (searchTerm && 
          !module.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !module.device?.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !module.device?.ip.includes(searchTerm)) {
        return false;
      }
      
      // 位置过滤
      if (filters.dataCenter && module.dataCenter?.name !== filters.dataCenter) return false;
      if (filters.room && module.room?.name !== filters.room) return false;
      if (filters.rack && module.rack?.name !== filters.rack) return false;
      if (filters.device && module.device?.name !== filters.device) return false;
      
      // 状态过滤
      if (filters.status === 'normal' && module.health < 80) return false;
      if (filters.status === 'warning' && (module.health < 60 || module.health >= 80)) return false;
      if (filters.status === 'critical' && module.health >= 60) return false;
      
      return true;
    });
  };
  
  // 排序数据
  const getSortedData = (data: ModuleData[]) => {
    return [...data].sort((a, b) => {
      // 使用类型安全的方式访问属性
      const getValueSafely = (obj: ModuleData, key: string) => {
        if (key === 'health') return obj.health;
        if (key === 'temperature') return Number(obj.temperature);
        if (key === 'name') return obj.name;
        // 添加其他需要排序的属性
        return 0; // 默认值
      };
      
      const aValue = getValueSafely(a, sortConfig.key);
      const bValue = getValueSafely(b, sortConfig.key);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // 处理排序
  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  // 获取唯一选项列表
  const getUniqueOptions = (field: keyof Pick<ModuleData, 'dataCenter' | 'room' | 'rack' | 'device'>) => {
    const options = new Set<string>();
    moduleData.forEach(module => {
      const entity = module[field];
      if (entity && 'name' in entity) {
        options.add(entity.name);
      }
    });
    return Array.from(options).sort();
  };
  
  // 获取状态颜色和文本
  const getStatusInfo = (health: number) => {
    if (health >= 80) {
      return { color: 'bg-green-500', text: '正常' };
    } else if (health >= 60) {
      return { color: 'bg-yellow-500', text: '预警' };
    } else {
      return { color: 'bg-red-500', text: '危险' };
    }
  };
  
  // 清除所有过滤条件
  const clearFilters = () => {
    setFilters({
      dataCenter: '',
      room: '',
      rack: '',
      device: '',
      status: ''
    });
    setSearchTerm('');
  };
  
  // 导出数据函数
  const exportData = (format: ExportFormat, onlyFiltered: boolean = false) => {
    // 获取数据
    const dataToExport = onlyFiltered ? getFilteredData() : moduleData;
    
    if (dataToExport.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    switch (format) {
      case 'csv':
        exportToCSV(dataToExport);
        break;
      case 'json':
        exportToJSON(dataToExport);
        break;
      case 'excel':
        // Excel格式实际上是CSV，但文件扩展名为xls
        exportToCSV(dataToExport, true);
        break;
    }
    
    // 关闭导出选项面板
    setShowExportOptions(false);
  };
  
  // 导出CSV文件
  const exportToCSV = (dataToExport: ModuleData[], isExcel: boolean = false) => {
    // CSV头部
    const headers = [
      '模块名称',
      '健康分',
      '状态',
      '数据中心',
      '机房',
      '机架',
      '设备',
      'IP地址',
      '端口',
      '温度(°C)',
      '接收功率(dBm)',
      '发送功率(dBm)',
      '电压(V)',
      '电流(mA)',
      '最后更新'
    ];
    
    // 转换数据为CSV行
    const csvRows = [
      headers.join(',') // 头部行
    ];
    
    // 添加数据行
    dataToExport.forEach(module => {
      const status = module.health >= 80 ? '正常' : module.health >= 60 ? '预警' : '危险';
      const values = [
        `"${module.name}"`, // 使用引号包裹，避免名称中的逗号导致格式错误
        module.health,
        status,
        `"${module.dataCenter?.name || '-'}"`,
        `"${module.room?.name || '-'}"`,
        `"${module.rack?.name || '-'}"`,
        `"${module.device?.name || '-'}"`,
        module.device?.ip || '-',
        module.portIndex,
        module.temperature,
        module.rxPower,
        module.txPower,
        module.voltage,
        module.current,
        new Date(module.lastUpdated).toLocaleString()
      ];
      csvRows.push(values.join(','));
    });
    
    // 创建CSV内容
    const csvContent = csvRows.join('\n');
    
    // 创建Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建URL
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // 根据格式确定文件名和扩展名
    const fileExt = isExcel ? '.xls' : '.csv';
    const timestamp = new Date().toISOString().split('T')[0];
    const dataType = dataToExport === moduleData ? '全部' : '筛选';
    
    link.setAttribute('download', `光模块监控数据_${dataType}_${timestamp}${fileExt}`);
    link.style.visibility = 'hidden';
    
    // 添加到DOM，触发下载，然后移除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 导出JSON文件
  const exportToJSON = (dataToExport: ModuleData[]) => {
    // 创建格式化的JSON内容
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    
    // 创建Blob
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    
    // 创建URL
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // 文件名
    const timestamp = new Date().toISOString().split('T')[0];
    const dataType = dataToExport === moduleData ? '全部' : '筛选';
    
    link.setAttribute('download', `光模块监控数据_${dataType}_${timestamp}.json`);
    link.style.visibility = 'hidden';
    
    // 添加到DOM，触发下载，然后移除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 渲染表格
  const renderTable = () => {
    const filteredData = getFilteredData();
    const sortedData = getSortedData(filteredData);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-600 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('health')}>
                <div className="flex items-center">
                  状态
                  {sortConfig.key === 'health' && (
                    <ChevronDown className={`ml-1 w-4 h-4 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3">模块名称</th>
              <th className="px-4 py-3">数据中心</th>
              <th className="px-4 py-3">机房</th>
              <th className="px-4 py-3">机架</th>
              <th className="px-4 py-3">设备</th>
              <th className="px-4 py-3">IP地址</th>
              <th className="px-4 py-3">端口</th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('temperature')}>
                <div className="flex items-center">
                  温度
                  {sortConfig.key === 'temperature' && (
                    <ChevronDown className={`ml-1 w-4 h-4 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  没有找到符合条件的光模块
                </td>
              </tr>
            ) : (
              sortedData.map(module => (
                <tr 
                  key={module.id} 
                  className={`border-b hover:bg-gray-50 ${selectedModule?.id === module.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getStatusInfo(module.health).color}`}></div>
                      <span>{getStatusInfo(module.health).text}</span>
                      <span className="text-xs text-gray-500 ml-2">{module.health}分</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">{module.name}</td>
                  <td className="px-4 py-4">{module.dataCenter?.name || '-'}</td>
                  <td className="px-4 py-4">{module.room?.name || '-'}</td>
                  <td className="px-4 py-4">{module.rack?.name || '-'}</td>
                  <td className="px-4 py-4">{module.device?.name || '-'}</td>
                  <td className="px-4 py-4 font-mono">{module.device?.ip || '-'}</td>
                  <td className="px-4 py-4">{module.portIndex}</td>
                  <td className="px-4 py-4">{module.temperature}°C</td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => setSelectedModule(module)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  // 渲染详情面板
  const renderDetailPanel = () => {
    if (!selectedModule) return null;
    
    const { color } = getStatusInfo(selectedModule.health);
    
    return (
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${color}`}></div>
            {selectedModule.name}
          </h3>
          <button 
            onClick={() => setSelectedModule(null)} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm text-gray-500 mb-1">位置信息</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">数据中心：</span>
                <span className="font-medium">{selectedModule.dataCenter?.name || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">机房：</span>
                <span className="font-medium">{selectedModule.room?.name || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">机架：</span>
                <span className="font-medium">{selectedModule.rack?.name || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">设备：</span>
                <span className="font-medium">{selectedModule.device?.name || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">IP地址：</span>
                <span className="font-mono font-medium">{selectedModule.device?.ip || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">端口：</span>
                <span className="font-medium">{selectedModule.portIndex}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm text-gray-500 mb-1">状态信息</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">健康分：</span>
                <div className="mt-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={color} 
                    style={{ width: `${selectedModule.health}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>0</span>
                  <span>{selectedModule.health}</span>
                  <span>100</span>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">温度：</span>
                <span className="font-medium">{selectedModule.temperature}°C</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">接收功率：</span>
                <span className="font-medium">{selectedModule.rxPower} dBm</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">发送功率：</span>
                <span className="font-medium">{selectedModule.txPower} dBm</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">电压：</span>
                <span className="font-medium">{selectedModule.voltage} V</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">电流：</span>
                <span className="font-medium">{selectedModule.current} mA</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">最后更新：</span>
                <span className="font-medium">
                  {new Date(selectedModule.lastUpdated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            查看历史趋势
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染筛选器
  const renderFilters = () => {
    const dataCenterOptions = getUniqueOptions('dataCenter');
    const roomOptions = getUniqueOptions('room');
    const rackOptions = getUniqueOptions('rack');
    const deviceOptions = getUniqueOptions('device');
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            过滤条件
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              清除所有
            </button>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Download className="w-3 h-3 mr-1" />
              导出数据
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 搜索框 */}
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索模块名称/设备/IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* 数据中心筛选 */}
          <div>
            <select
              value={filters.dataCenter}
              onChange={(e) => setFilters({...filters, dataCenter: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">所有数据中心</option>
              {dataCenterOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {/* 机房筛选 */}
          <div>
            <select
              value={filters.room}
              onChange={(e) => setFilters({...filters, room: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">所有机房</option>
              {roomOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {/* 状态筛选 */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">所有状态</option>
              <option value="normal">正常 (≥80分)</option>
              <option value="warning">预警 (60-79分)</option>
              <option value="critical">危险 (＜60分)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStatsSummary = () => {
    // 计算统计数据
    const totalModules = moduleData.length;
    const normalModules = moduleData.filter(m => m.health >= 80).length;
    const warningModules = moduleData.filter(m => m.health >= 60 && m.health < 80).length;
    const criticalModules = moduleData.filter(m => m.health < 60).length;
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">总模块数</div>
          <div className="text-2xl font-semibold">{totalModules}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">正常</div>
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-green-600">{normalModules}</div>
            <div className="text-sm text-gray-500 ml-2">
              ({((normalModules / totalModules) * 100).toFixed(1)}%)
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full ml-auto"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">预警</div>
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-yellow-600">{warningModules}</div>
            <div className="text-sm text-gray-500 ml-2">
              ({((warningModules / totalModules) * 100).toFixed(1)}%)
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full ml-auto"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">危险</div>
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-red-600">{criticalModules}</div>
            <div className="text-sm text-gray-500 ml-2">
              ({((criticalModules / totalModules) * 100).toFixed(1)}%)
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full ml-auto"></div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">光模块监控</h1>
        {!isLoading && !error && moduleData.length > 0 && (
          <div className="relative" ref={exportOptionsRef}>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
                <div className="py-2 border-b">
                  <div className="px-4 py-1 text-sm font-medium text-gray-700">导出全部数据</div>
                  <div className="mt-1 grid grid-cols-3 gap-1 px-2">
                    <button 
                      onClick={() => exportData('csv')}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <FileSpreadsheet className="w-6 h-6 text-green-600 mb-1" />
                      <span>CSV</span>
                    </button>
                    <button 
                      onClick={() => exportData('json')}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <FileJson className="w-6 h-6 text-blue-600 mb-1" />
                      <span>JSON</span>
                    </button>
                    <button 
                      onClick={() => exportData('excel')}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <FileSpreadsheet className="w-6 h-6 text-green-800 mb-1" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
                
                <div className="py-2">
                  <div className="px-4 py-1 text-sm font-medium text-gray-700">导出筛选数据</div>
                  <div className="mt-1 grid grid-cols-3 gap-1 px-2">
                    <button 
                      onClick={() => exportData('csv', true)}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <FileSpreadsheet className="w-6 h-6 text-green-600 mb-1" />
                      <span>CSV</span>
                    </button>
                    <button 
                      onClick={() => exportData('json', true)}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <FileJson className="w-6 h-6 text-blue-600 mb-1" />
                      <span>JSON</span>
                    </button>
                    <button 
                      onClick={() => exportData('excel', true)}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <FileSpreadsheet className="w-6 h-6 text-green-800 mb-1" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          {renderStatsSummary()}
          {renderFilters()}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              {renderTable()}
            </div>
            
            <div>
              {selectedModule ? (
                renderDetailPanel()
              ) : (
                <div className="bg-white p-5 rounded-lg shadow-md h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>选择一个光模块查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleMonitor; 