import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Network, 
  AlertTriangle, 
  Zap, 
  Thermometer,
  Clock,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  Check,
  HelpCircle,
  BarChart3,
  CalendarDays,
  ArrowDownUp
} from 'lucide-react';
import { MOCK_DATA, formatBytes } from '../lib/utils';

// 模拟速率数据
const speedOptions = ['1G', '10G', '25G', '40G', '100G', '200G', '400G', '800G'];

// 模拟厂商数据
const vendorOptions = [
  'Cisco', 'Huawei', 'Finisar', 'Intel', 'Broadcom', 
  'Juniper', 'ZTE', 'FiberHome', 'Nokia', 'Innolight'
];

// 模拟更换率数据
const mockReplacementData = {
  monthly: {
    vendors: {},
    speeds: {},
    heatmap: {}
  },
  quarterly: {
    vendors: {},
    speeds: {},
    heatmap: {}
  },
  yearly: {
    vendors: {},
    speeds: {},
    heatmap: {}
  }
};

// 生成模拟数据
const generateReplacementData = () => {
  // 为每个厂商生成更换率数据
  vendorOptions.forEach(vendor => {
    // 月度数据 (最近12个月)
    mockReplacementData.monthly.vendors[vendor] = Array(12).fill(0).map(() => 
      +(Math.random() * 5 + 1).toFixed(2) // 1-6% 范围内的更换率
    );
    
    // 季度数据 (最近8个季度)
    mockReplacementData.quarterly.vendors[vendor] = Array(8).fill(0).map(() => 
      +(Math.random() * 7 + 2).toFixed(2) // 2-9% 范围内的更换率
    );
    
    // 年度数据 (最近5年)
    mockReplacementData.yearly.vendors[vendor] = Array(5).fill(0).map(() => 
      +(Math.random() * 10 + 5).toFixed(2) // 5-15% 范围内的更换率
    );
  });
  
  // 为每个速率生成更换率数据
  speedOptions.forEach(speed => {
    // 月度数据 (最近12个月)
    mockReplacementData.monthly.speeds[speed] = Array(12).fill(0).map(() => 
      +(Math.random() * 5 + 1).toFixed(2) // 1-6% 范围内的更换率
    );
    
    // 季度数据 (最近8个季度)
    mockReplacementData.quarterly.speeds[speed] = Array(8).fill(0).map(() => 
      +(Math.random() * 7 + 2).toFixed(2) // 2-9% 范围内的更换率
    );
    
    // 年度数据 (最近5年)
    mockReplacementData.yearly.speeds[speed] = Array(5).fill(0).map(() => 
      +(Math.random() * 10 + 5).toFixed(2) // 5-15% 范围内的更换率
    );
  });
  
  // 为热力图生成数据 (厂商 x 速率)
  vendorOptions.forEach(vendor => {
    mockReplacementData.monthly.heatmap[vendor] = {};
    mockReplacementData.quarterly.heatmap[vendor] = {};
    mockReplacementData.yearly.heatmap[vendor] = {};
    
    speedOptions.forEach(speed => {
      // 热力图中的数据是最近一个时间段的平均更换率
      mockReplacementData.monthly.heatmap[vendor][speed] = +(Math.random() * 5 + 1).toFixed(2);
      mockReplacementData.quarterly.heatmap[vendor][speed] = +(Math.random() * 7 + 2).toFixed(2);
      mockReplacementData.yearly.heatmap[vendor][speed] = +(Math.random() * 10 + 5).toFixed(2);
    });
  });
};

// 调用一次生成数据
generateReplacementData();

// 模拟统计数据
const statisticsData = {
  interfaces: {
    total: 48,
    up: 36,
    down: 8,
    adminDown: 4,
    errors: {
      drops: 156,
      crc: 23,
      frame: 12,
      flop: 5
    }
  },
  modules: {
    total: 38,
    types: {
      'SFP+': 12,
      'QSFP+': 18,
      'QSFP28': 8
    },
    vendors: {
      'Cisco': 15,
      'Huawei': 10,
      'Intel': 8,
      'Other': 5
    },
    temperature: {
      avg: 38.5,
      max: 52.3,
      min: 32.1
    },
    voltage: {
      avg: 3.3,
      max: 3.4,
      min: 3.2
    }
  },
  traffic: {
    totalRx: 1258000000000, // 1.258 TB
    totalTx: 985000000000,  // 985 GB
    peakRx: 25000000000,    // 25 GB/s
    peakTx: 18000000000     // 18 GB/s
  },
  predictions: {
    avgLifespan: 720, // 平均预期寿命 (days)
    replacementRate: 0.08, // 每年更换率
    failureProbability: {
      next30days: 0.05,
      next90days: 0.12,
      next180days: 0.25
    }
  }
};

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('interfaces');
  const [timeRange, setTimeRange] = useState('7d');
  const [isExporting, setIsExporting] = useState(false);

  // 模拟导出数据
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('数据已导出到 statistics_report.xlsx');
    }, 1500);
  };

  const renderInterfaceStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">总接口数</div>
          <div className="text-2xl font-semibold">{statisticsData.interfaces.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">正常接口</div>
          <div className="text-2xl font-semibold text-green-600">{statisticsData.interfaces.up}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">故障接口</div>
          <div className="text-2xl font-semibold text-red-600">{statisticsData.interfaces.down}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">管理禁用</div>
          <div className="text-2xl font-semibold text-gray-600">{statisticsData.interfaces.adminDown}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">错误统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 mb-1">丢包数量</div>
            <div className="text-2xl font-semibold text-amber-600">{statisticsData.interfaces.errors.drops}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 mb-1">CRC错误</div>
            <div className="text-2xl font-semibold text-amber-600">{statisticsData.interfaces.errors.crc}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 mb-1">帧错误</div>
            <div className="text-2xl font-semibold text-amber-600">{statisticsData.interfaces.errors.frame}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 mb-1">接口抖动</div>
            <div className="text-2xl font-semibold text-amber-600">{statisticsData.interfaces.errors.flop}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">接口状态分布</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <PieChart className="h-32 w-32 mx-auto text-blue-500 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>正常: {statisticsData.interfaces.up}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>故障: {statisticsData.interfaces.down}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                <span>禁用: {statisticsData.interfaces.adminDown}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModuleStats = () => {
    // 光模块统计设置
    const [timeUnit, setTimeUnit] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
    const [selectedVendors, setSelectedVendors] = useState<string[]>([vendorOptions[0], vendorOptions[1]]);
    const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>(['10G', '100G']);
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
    
    // 获取对应时间单位的标签
    const getTimeLabels = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      if (timeUnit === 'monthly') {
        // 返回过去12个月的标签
        return Array(12).fill(0).map((_, i) => {
          const month = (currentMonth - i + 12) % 12;
          return `${month + 1}月`;
        }).reverse();
      } else if (timeUnit === 'quarterly') {
        // 返回过去8个季度的标签
        return Array(8).fill(0).map((_, i) => {
          const quarterIndex = Math.floor((currentMonth - i * 3 + 12) / 3) % 4;
          const year = currentYear - Math.floor((i * 3 + (3 - quarterIndex * 3)) / 12);
          return `${year}Q${4 - quarterIndex}`;
        }).reverse();
      } else {
        // 返回过去5年的标签
        return Array(5).fill(0).map((_, i) => `${currentYear - 4 + i}`);
      }
    };
    
    // 处理厂商选择
    const toggleVendorSelection = (vendor: string) => {
      if (selectedVendors.includes(vendor)) {
        setSelectedVendors(selectedVendors.filter(v => v !== vendor));
      } else {
        setSelectedVendors([...selectedVendors, vendor]);
      }
    };
    
    // 处理速率选择
    const toggleSpeedSelection = (speed: string) => {
      if (selectedSpeeds.includes(speed)) {
        setSelectedSpeeds(selectedSpeeds.filter(s => s !== speed));
      } else {
        setSelectedSpeeds([...selectedSpeeds, speed]);
      }
    };
    
    // 获取热力图数据 - 由于模拟数据有限，返回当前选中时间单位的厂商x速率矩阵
    const getHeatmapData = () => {
      return {
        vendors: selectedVendors.length > 0 ? selectedVendors : vendorOptions,
        speeds: selectedSpeeds.length > 0 ? selectedSpeeds : speedOptions,
        data: mockReplacementData[timeUnit].heatmap
      };
    };
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-1">光模块总数</div>
            <div className="text-2xl font-semibold">{statisticsData.modules.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-1">平均电压</div>
            <div className="text-2xl font-semibold">
              {statisticsData.modules.voltage.avg}V
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-1">平均更换率</div>
            <div className="text-2xl font-semibold">
              {(statisticsData.predictions.replacementRate * 100).toFixed(1)}%/年
            </div>
          </div>
        </div>

        {/* 光模块厂商更换率对比 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-lg font-medium">光模块厂商更换率对比</h3>
            
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              {/* 时间单位选择 */}
              <div className="inline-flex border rounded-md">
                <button 
                  className={`px-3 py-1 text-sm ${timeUnit === 'monthly' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => setTimeUnit('monthly')}
                >
                  月
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${timeUnit === 'quarterly' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => setTimeUnit('quarterly')}
                >
                  季度
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${timeUnit === 'yearly' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => setTimeUnit('yearly')}
                >
                  年
                </button>
              </div>
              
              {/* 图表类型选择 */}
              <div className="inline-flex border rounded-md">
                <button 
                  className={`px-3 py-1 text-sm ${chartType === 'bar' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => setChartType('bar')}
                >
                  <BarChart className="w-4 h-4 inline mr-1" />
                  柱状图
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${chartType === 'line' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => setChartType('line')}
                >
                  <LineChart className="w-4 h-4 inline mr-1" />
                  折线图
                </button>
              </div>
              
              {/* 厂商选择下拉框 */}
              <div className="relative inline-block">
                <button 
                  className="flex items-center justify-between min-w-[120px] px-3 py-1 text-sm border rounded-md bg-white"
                  onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                >
                  <span>厂商</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showVendorDropdown && (
                  <div className="absolute z-10 mt-1 w-56 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2">
                      {vendorOptions.map(vendor => (
                        <div 
                          key={vendor}
                          className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => toggleVendorSelection(vendor)}
                        >
                          <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                            selectedVendors.includes(vendor) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedVendors.includes(vendor) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span>{vendor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 速率选择下拉框 */}
              <div className="relative inline-block">
                <button 
                  className="flex items-center justify-between min-w-[120px] px-3 py-1 text-sm border rounded-md bg-white"
                  onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
                >
                  <span>速率</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showSpeedDropdown && (
                  <div className="absolute z-10 mt-1 w-40 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2">
                      {speedOptions.map(speed => (
                        <div 
                          key={speed}
                          className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => toggleSpeedSelection(speed)}
                        >
                          <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                            selectedSpeeds.includes(speed) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedSpeeds.includes(speed) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span>{speed}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 图表区域 */}
          <div className="h-80 flex items-center justify-center">
            <div className="w-full">
              {chartType === 'bar' ? (
                <BarChart3 className="h-32 w-32 mx-auto text-blue-500 mb-4" />
              ) : (
                <LineChart className="h-32 w-32 mx-auto text-blue-500 mb-4" />
              )}
              <div className="text-center">
                <p className="font-medium text-gray-700">厂商更换率对比图表 ({timeUnit === 'monthly' ? '月' : timeUnit === 'quarterly' ? '季度' : '年'})</p>
                <div className="flex flex-wrap justify-center mt-2 gap-4">
                  {selectedVendors.map((vendor, i) => (
                    <div key={vendor} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full bg-blue-${(i + 3) * 100} mr-2`}></div>
                      <span>{vendor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-4">
            <div className="flex flex-wrap gap-6 justify-center">
              {selectedSpeeds.map(speed => (
                <div key={speed} className="text-center">
                  <div className="text-sm font-medium">{speed}</div>
                  <div className="text-xl font-semibold mt-1">
                    {(Math.random() * 10 + 2).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">平均更换率</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 热力图：速率 × 厂商 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-6">更换率热力图 (速率 × 厂商)</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    厂商 \ 速率
                  </th>
                  {getHeatmapData().speeds.map(speed => (
                    <th key={speed} className="py-2 px-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {speed}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getHeatmapData().vendors.map(vendor => (
                  <tr key={vendor}>
                    <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vendor}
                    </td>
                    {getHeatmapData().speeds.map(speed => {
                      // 获取更换率数据
                      const rate = mockReplacementData[timeUnit].heatmap[vendor]?.[speed] || 0;
                      // 根据更换率决定背景颜色深浅
                      const bgColor = rate <= 3 ? 'bg-green-50' : 
                                      rate <= 7 ? 'bg-yellow-50' : 
                                      'bg-red-50';
                      const textColor = rate <= 3 ? 'text-green-700' : 
                                        rate <= 7 ? 'text-yellow-700' : 
                                        'text-red-700';
                      
                      return (
                        <td key={speed} className={`py-2 px-3 whitespace-nowrap text-sm text-center ${bgColor}`}>
                          <span className={`font-medium ${textColor}`}>{rate}%</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 模块类型分布和厂商分布 - 简化为文字展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">模块类型分布</h3>
            <div className="space-y-2">
              {Object.entries(statisticsData.modules.types).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center py-1">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-medium">{count} 个</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">厂商分布</h3>
            <div className="space-y-2">
              {Object.entries(statisticsData.modules.vendors).map(([vendor, count]) => (
                <div key={vendor} className="flex justify-between items-center py-1">
                  <span className="text-gray-600">{vendor}</span>
                  <span className="font-medium">{count} 个</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrafficStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">总接收流量</div>
          <div className="text-2xl font-semibold">{formatBytes(statisticsData.traffic.totalRx)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">总发送流量</div>
          <div className="text-2xl font-semibold">{formatBytes(statisticsData.traffic.totalTx)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">峰值接收</div>
          <div className="text-2xl font-semibold">{formatBytes(statisticsData.traffic.peakRx)}/s</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">峰值发送</div>
          <div className="text-2xl font-semibold">{formatBytes(statisticsData.traffic.peakTx)}/s</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">流量趋势</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <LineChart className="h-32 w-32 mx-auto text-blue-500 mb-4" />
            <p className="text-gray-500">流量趋势图表将显示在这里</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">带宽利用率</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart className="h-32 w-32 mx-auto text-green-500 mb-4" />
            <p className="text-gray-500">带宽利用率图表将显示在这里</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPredictiveStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">平均预期寿命</div>
          <div className="text-2xl font-semibold">{statisticsData.predictions.avgLifespan} 天</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">年更换率</div>
          <div className="text-2xl font-semibold">{(statisticsData.predictions.replacementRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">30天内故障概率</div>
          <div className="text-2xl font-semibold text-amber-600">
            {(statisticsData.predictions.failureProbability.next30days * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">故障概率分布</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart className="h-32 w-32 mx-auto text-amber-500 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">30天内</div>
                <div className="font-medium">
                  {(statisticsData.predictions.failureProbability.next30days * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">90天内</div>
                <div className="font-medium">
                  {(statisticsData.predictions.failureProbability.next90days * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">180天内</div>
                <div className="font-medium">
                  {(statisticsData.predictions.failureProbability.next180days * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">寿命分布预测</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <LineChart className="h-32 w-32 mx-auto text-blue-500 mb-4" />
            <p className="text-gray-500">寿命分布预测图表将显示在这里</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">数据统计</h1>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="1d">过去24小时</option>
              <option value="7d">过去7天</option>
              <option value="30d">过去30天</option>
              <option value="90d">过去90天</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">所有设备</option>
              <option value="device1">Switch-Core-01</option>
              <option value="device2">Switch-Core-02</option>
            </select>
          </div>
          
          <button
            onClick={handleExport}
            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-1" />
            {isExporting ? '导出中...' : '导出报告'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'interfaces' ? 'border-blue-500 text-blue-600' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('interfaces')}
            >
              <Network className="h-4 w-4 inline mr-1" />
              接口统计
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'modules' ? 'border-blue-500 text-blue-600' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('modules')}
            >
              <Zap className="h-4 w-4 inline mr-1" />
              光模块统计
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'traffic' ? 'border-blue-500 text-blue-600' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('traffic')}
            >
              <BarChart className="h-4 w-4 inline mr-1" />
              流量统计
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'predictive' ? 'border-blue-500 text-blue-600' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('predictive')}
            >
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              预测分析
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'interfaces' && renderInterfaceStats()}
          {activeTab === 'modules' && renderModuleStats()}
          {activeTab === 'traffic' && renderTrafficStats()}
          {activeTab === 'predictive' && renderPredictiveStats()}
        </div>
      </div>
    </div>
  );
}