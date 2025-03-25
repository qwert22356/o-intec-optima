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
  Filter
} from 'lucide-react';
import { MOCK_DATA, formatBytes } from '../lib/utils';

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

  const renderModuleStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">光模块总数</div>
          <div className="text-2xl font-semibold">{statisticsData.modules.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">平均温度</div>
          <div className="text-2xl font-semibold">
            {statisticsData.modules.temperature.avg}°C
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 mb-1">平均电压</div>
          <div className="text-2xl font-semibold">
            {statisticsData.modules.voltage.avg}V
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">模块类型分布</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-32 w-32 mx-auto text-blue-500 mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(statisticsData.modules.types).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>{type}: {count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">厂商分布</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-32 w-32 mx-auto text-green-500 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(statisticsData.modules.vendors).map(([vendor, count]) => (
                  <div key={vendor} className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>{vendor}: {count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">温度分布</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart className="h-32 w-32 mx-auto text-amber-500 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">最低温度</div>
                <div className="font-medium">{statisticsData.modules.temperature.min}°C</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">平均温度</div>
                <div className="font-medium">{statisticsData.modules.temperature.avg}°C</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">最高温度</div>
                <div className="font-medium">{statisticsData.modules.temperature.max}°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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