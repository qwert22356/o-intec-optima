import React, { useState, useEffect } from 'react';
import { MOCK_DATA } from '../lib/utils';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  PlusCircle, 
  Play, 
  Clock,
  LineChart,
  AlertTriangle,
  CheckCircle2,
  History,
  Plus,
  RefreshCw
} from 'lucide-react';

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
  // 预测分析所需的额外字段
  predictedFailure: boolean;
  failureProbability: number;
  timeToFailure: number; // 小时
  anomalyVector?: string;
  historicalAnomalies?: number;
}

// 定义预测规则接口
interface PredictionRule {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  moduleType: string;
  confidenceThreshold: number;
  parameters: {
    timeWindow: number; // 小时
    features: string[];
    algorithm: string;
    minConfidence: number;
  };
  isActive: boolean;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
}

const ModulePredictive = () => {
  const [moduleData, setModuleData] = useState<ModuleData[]>([]);
  const [predictionRules, setPredictionRules] = useState<PredictionRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'predictions' | 'rules'>('predictions');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFailingOnly, setShowFailingOnly] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [selectedRule, setSelectedRule] = useState<PredictionRule | null>(null);
  const [isTrainingMode, setIsTrainingMode] = useState<boolean>(false);
  const [ruleSearchTerm, setRuleSearchTerm] = useState<string>('');
  const [ruleFilterStatus, setRuleFilterStatus] = useState<string>('all');
  
  // 初始化数据
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // 提取模块数据并添加预测字段
      const modules = extractModuleData();
      setModuleData(modules);
      
      // 模拟预测规则数据
      const rules = generateMockRules();
      setPredictionRules(rules);
      
      setIsLoading(false);
    } catch (err) {
      setError('数据加载失败，请稍后重试');
      setIsLoading(false);
      console.error(err);
    }
  }, []);
  
  // 从MOCK_DATA中提取光模块数据并添加预测字段
  const extractModuleData = (): ModuleData[] => {
    const modules: ModuleData[] = [];
    
    MOCK_DATA.topology.nodes.forEach(node => {
      if (node.type === 'module') {
        const parentNode = MOCK_DATA.topology.nodes.find(n => node.parent === n.id);
        const rackNode = parentNode ? MOCK_DATA.topology.nodes.find(n => parentNode.parent === n.id) : null;
        const roomNode = rackNode ? MOCK_DATA.topology.nodes.find(n => rackNode.parent === n.id) : null;
        const dcNode = roomNode ? MOCK_DATA.topology.nodes.find(n => roomNode.parent === n.id) : null;
        
        // 为每个模块生成随机的预测数据
        const predictedFailure = Math.random() > 0.8;
        const failureProbability = predictedFailure 
          ? Math.floor(Math.random() * 40) + 60 // 60% - 100%
          : Math.floor(Math.random() * 50); // 0% - 50%
        const timeToFailure = predictedFailure 
          ? Math.floor(Math.random() * 168) + 1 // 1 - 168小时 (1周)
          : 0;
        
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
          lastUpdated: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
          predictedFailure,
          failureProbability,
          timeToFailure,
          historicalAnomalies: Math.floor(Math.random() * 10)
        });
      }
    });
    
    return modules;
  };
  
  // 生成模拟预测规则数据
  const generateMockRules = (): PredictionRule[] => {
    const rules: PredictionRule[] = [];
    
    const ruleNames = [
      "光功率衰减预测模型", 
      "温度异常检测规则", 
      "电压波动监测模型", 
      "高温预警规则",
      "接收功率波动检测"
    ];
    
    const algorithms = [
      "ARIMA时间序列", 
      "LSTM深度学习", 
      "随机森林回归", 
      "隔离森林异常检测",
      "XGBoost分类器"
    ];
    
    const features = [
      ["rxPower", "temperature"],
      ["temperature", "current", "voltage"],
      ["rxPower", "txPower"],
      ["temperature", "voltage"],
      ["rxPower", "txPower", "temperature", "current", "voltage"]
    ];
    
    for (let i = 0; i < 5; i++) {
      const totalPredictions = Math.floor(Math.random() * 1000) + 100;
      const correctPredictions = Math.floor(totalPredictions * (0.7 + Math.random() * 0.25));
      const accuracy = (correctPredictions / totalPredictions) * 100;
      
      rules.push({
        id: `rule-${i + 1}`,
        name: ruleNames[i],
        description: `用于检测光模块${ruleNames[i].split('模型')[0].split('规则')[0]}问题的预测模型`,
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
        moduleType: i % 2 === 0 ? "单模" : "多模",
        confidenceThreshold: 65 + Math.floor(Math.random() * 20),
        parameters: {
          timeWindow: 24 * (Math.floor(Math.random() * 14) + 1), // 1-14天
          features: features[i],
          algorithm: algorithms[i],
          minConfidence: 60 + Math.floor(Math.random() * 20)
        },
        isActive: Math.random() > 0.2, // 80%概率为活跃状态
        accuracy: parseFloat(accuracy.toFixed(2)),
        totalPredictions,
        correctPredictions
      });
    }
    
    return rules;
  };
  
  // 获取过滤后的模块数据
  const getFilteredModules = () => {
    return moduleData.filter(module => {
      // 搜索过滤
      if (searchTerm && 
          !module.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !module.device?.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !module.device?.ip.includes(searchTerm)) {
        return false;
      }
      
      // 只显示预测会故障的模块
      if (showFailingOnly && !module.predictedFailure) {
        return false;
      }
      
      return true;
    });
  };
  
  // 获取过滤后的规则
  const getFilteredRules = () => {
    return predictionRules.filter(rule => {
      if (ruleSearchTerm && 
          !rule.name.toLowerCase().includes(ruleSearchTerm.toLowerCase()) &&
          !rule.description.toLowerCase().includes(ruleSearchTerm.toLowerCase())) {
        return false;
      }
      
      if (ruleFilterStatus === 'active' && !rule.isActive) {
        return false;
      }
      
      if (ruleFilterStatus === 'inactive' && rule.isActive) {
        return false;
      }
      
      return true;
    });
  };

  // 渲染主界面
  return (
    <div className="container mx-auto py-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">光模块预测分析</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsTrainingMode(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                创建新规则
              </button>
              <button
                onClick={() => {/* 刷新数据 */}}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                刷新数据
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'predictions' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('predictions')}
                >
                  使用现有规则预测
                </button>
                <button
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'rules' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('rules')}
                >
                  预测规则管理
                </button>
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'predictions' ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2 items-center">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="搜索模块名称或位置..."
                          className="px-3 py-2 border border-gray-300 rounded-md pr-10 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                      </div>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        value={showFailingOnly ? 'predicted' : 'all'}
                        onChange={(e) => setShowFailingOnly(e.target.value === 'predicted')}
                      >
                        <option value="all">所有状态</option>
                        <option value="predicted">预测故障</option>
                        <option value="normal">正常运行</option>
                      </select>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                        预测故障: {moduleData.filter(m => m.predictedFailure).length}
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        正常: {moduleData.filter(m => !m.predictedFailure).length}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            模块名称
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            位置
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            状态
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            故障概率
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            预计剩余时间
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            温度
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredModules().map((module) => (
                          <tr key={module.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              {module.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {module.dataCenter?.name} / {module.room?.name} / {module.device?.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                module.predictedFailure 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {module.predictedFailure ? '预测故障' : '正常'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                                  <div 
                                    className={`h-full rounded-full ${
                                      module.failureProbability >= 70 ? 'bg-red-500' :
                                      module.failureProbability >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${module.failureProbability}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{module.failureProbability}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {module.predictedFailure 
                                ? `${module.timeToFailure} 小时` 
                                : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`${
                                parseFloat(String(module.temperature)) > 30 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {module.temperature}°C
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <button 
                                onClick={() => setSelectedModule(module)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                详情
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getFilteredModules().length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      未找到符合条件的光模块
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2 items-center">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="搜索规则名称..."
                          className="px-3 py-2 border border-gray-300 rounded-md pr-10 w-64"
                          value={ruleSearchTerm}
                          onChange={(e) => setRuleSearchTerm(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                      </div>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        value={ruleFilterStatus}
                        onChange={(e) => setRuleFilterStatus(e.target.value)}
                      >
                        <option value="all">所有规则</option>
                        <option value="active">已激活</option>
                        <option value="inactive">未激活</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredRules().map((rule) => (
                      <div 
                        key={rule.id} 
                        className="border rounded-lg overflow-hidden hover:shadow-md cursor-pointer"
                        onClick={() => setSelectedRule(rule)}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{rule.name}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              rule.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.isActive ? '活跃' : '未激活'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {rule.description}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>模块类型: {rule.moduleType}</span>
                            <span>算法: {rule.parameters.algorithm}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className={`h-full rounded-full ${
                                    rule.accuracy >= 80 ? 'bg-green-500' :
                                    rule.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${rule.accuracy}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">准确率: {rule.accuracy}%</span>
                            </div>
                            <span className="text-xs">预测次数: {rule.totalPredictions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {getFilteredRules().length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      未找到符合条件的预测规则
                    </div>
                  )}
                  
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setIsTrainingMode(true)}
                      className="px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-500 inline-flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      创建新预测规则
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-2">预测概况</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">总模块数</div>
                <div className="text-xl font-bold">{moduleData.length}</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">预测故障模块数</div>
                <div className="text-xl font-bold text-red-600">{moduleData.filter(m => m.predictedFailure).length}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">故障率</div>
                <div className="text-xl font-bold">
                  {moduleData.length > 0 
                    ? ((moduleData.filter(m => m.predictedFailure).length / moduleData.length) * 100).toFixed(1) + '%' 
                    : '0%'}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-2">规则性能</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">活跃规则数</div>
                <div className="text-xl font-bold">{predictionRules.filter(r => r.isActive).length}</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">平均准确率</div>
                <div className="text-xl font-bold">
                  {predictionRules.length > 0 
                    ? (predictionRules.reduce((sum, rule) => sum + rule.accuracy, 0) / predictionRules.length).toFixed(1) + '%' 
                    : '0%'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">总预测次数</div>
                <div className="text-xl font-bold">
                  {predictionRules.reduce((sum, rule) => sum + rule.totalPredictions, 0)}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-2">紧急需求</h3>
              <div className="space-y-2">
                {moduleData
                  .filter(m => m.predictedFailure && m.timeToFailure <= 24)
                  .slice(0, 3)
                  .map(module => (
                    <div key={module.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-xs text-gray-500">{module.device?.name || '-'}</div>
                      </div>
                      <div className="flex items-center text-red-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{module.timeToFailure}小时</span>
                      </div>
                    </div>
                  ))}
                
                {moduleData.filter(m => m.predictedFailure && m.timeToFailure <= 24).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    目前没有紧急需求
                  </div>
                )}
                
                {moduleData.filter(m => m.predictedFailure && m.timeToFailure <= 24).length > 3 && (
                  <div className="text-center text-sm text-blue-600 cursor-pointer hover:underline">
                    查看全部 ({moduleData.filter(m => m.predictedFailure && m.timeToFailure <= 24).length})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 模块详情对话框 */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    selectedModule.predictedFailure ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  {selectedModule.name}
                  {selectedModule.predictedFailure && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      预测故障
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setSelectedModule(null)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">位置信息</h4>
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
                  
                  <h4 className="text-sm text-gray-500 mb-2 mt-4">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                      <span className="text-gray-500">健康分：</span>
                      <span className="font-medium">{selectedModule.health}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">预测信息</h4>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">故障概率</div>
                    <div className="flex items-center">
                      <div className="w-full h-3 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-full rounded-full ${
                            selectedModule.failureProbability >= 70 ? 'bg-red-500' :
                            selectedModule.failureProbability >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${selectedModule.failureProbability}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold">{selectedModule.failureProbability}%</span>
                    </div>
                  </div>
                  
                  {selectedModule.predictedFailure && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">预计剩余时间</div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-lg font-bold">{selectedModule.timeToFailure} 小时</span>
                      </div>
                      
                      <div className="text-sm mt-2">
                        可能在 <span className="font-medium">{new Date(Date.now() + selectedModule.timeToFailure * 3600 * 1000).toLocaleString()}</span> 前后出现故障
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">历史异常次数</div>
                    <div className="text-lg font-bold">{selectedModule.historicalAnomalies}</div>
                  </div>
                  
                  <h4 className="text-sm text-gray-500 mb-2 mt-6">预测理由</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      {selectedModule.predictedFailure 
                        ? '根据历史数据分析，该模块存在多项参数异常波动，与历史故障特征模式高度匹配。主要异常特征包括：' 
                        : '根据历史数据分析，该模块运行正常，未发现明显异常波动模式。监控指标如下：'}
                    </p>
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      <li className={`${parseFloat(String(selectedModule.temperature)) > 30 ? 'text-red-600' : 'text-gray-600'}`}>
                        温度指标 {parseFloat(String(selectedModule.temperature)) > 30 ? '偏高' : '正常'} ({selectedModule.temperature}°C)
                      </li>
                      <li className={`${parseFloat(String(selectedModule.rxPower)) < -7 ? 'text-red-600' : 'text-gray-600'}`}>
                        接收功率指标 {parseFloat(String(selectedModule.rxPower)) < -7 ? '偏低' : '正常'} ({selectedModule.rxPower} dBm)
                      </li>
                      <li className="text-gray-600">
                        发送功率指标 正常 ({selectedModule.txPower} dBm)
                      </li>
                      <li className={`${parseFloat(String(selectedModule.voltage)) < 3.2 || parseFloat(String(selectedModule.voltage)) > 3.4 ? 'text-red-600' : 'text-gray-600'}`}>
                        电压指标 {parseFloat(String(selectedModule.voltage)) < 3.2 || parseFloat(String(selectedModule.voltage)) > 3.4 ? '波动' : '正常'} ({selectedModule.voltage} V)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  导出详情
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  查看历史趋势
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 规则详情对话框 */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{selectedRule.name}</h3>
                <button 
                  onClick={() => setSelectedRule(null)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-500">{selectedRule.description}</p>
                <div className="flex mt-2">
                  {selectedRule.isActive ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      活跃
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                      未激活
                    </span>
                  )}
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {selectedRule.moduleType}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">规则参数</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">预测算法</div>
                      <div className="font-medium">{selectedRule.parameters.algorithm}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">特征数据</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRule.parameters.features.map(feature => (
                          <span key={feature} className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">时间窗口</div>
                      <div className="font-medium">{selectedRule.parameters.timeWindow} 小时</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">最低置信度</div>
                      <div className="font-medium">{selectedRule.parameters.minConfidence}%</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">创建时间</div>
                      <div className="font-medium">{new Date(selectedRule.createdAt).toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">最后更新</div>
                      <div className="font-medium">{new Date(selectedRule.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">性能指标</h4>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">准确率</div>
                    <div className="flex items-center">
                      <div className="w-full h-3 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-full rounded-full ${
                            selectedRule.accuracy >= 80 ? 'bg-green-500' :
                            selectedRule.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedRule.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold">{selectedRule.accuracy}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">总预测次数</div>
                      <div className="text-lg font-bold">{selectedRule.totalPredictions}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">正确预测</div>
                      <div className="text-lg font-bold">{selectedRule.correctPredictions}</div>
                    </div>
                  </div>
                  
                  <h4 className="text-sm text-gray-500 mb-2 mt-6">推荐操作</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      {selectedRule.accuracy >= 80 ? (
                        <p>该规则预测准确率高，建议继续使用并定期评估。</p>
                      ) : selectedRule.accuracy >= 60 ? (
                        <p>该规则准确率中等，建议增加训练数据或优化算法参数。</p>
                      ) : (
                        <p>该规则准确率偏低，建议重新训练或调整特征选择。</p>
                      )}
                    </div>
                    
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      <li>增加{selectedRule.parameters.features.join(", ")}等参数的数据采集频率</li>
                      <li>考虑调整置信度阈值 ({selectedRule.parameters.minConfidence}%)</li>
                      <li>优化时间窗口大小 (当前{selectedRule.parameters.timeWindow}小时)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  编辑规则
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  运行规则
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建新规则表单 */}
      {isTrainingMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">创建新预测规则</h3>
                <button 
                  onClick={() => setIsTrainingMode(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    规则名称
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="输入规则名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    规则描述
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="描述规则用途和工作原理"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      预测算法
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">选择算法</option>
                      <option value="arima">ARIMA时间序列</option>
                      <option value="lstm">LSTM深度学习</option>
                      <option value="random_forest">随机森林回归</option>
                      <option value="isolation_forest">隔离森林异常检测</option>
                      <option value="xgboost">XGBoost分类器</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      适用模块类型
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">选择模块类型</option>
                      <option value="单模">单模光模块</option>
                      <option value="多模">多模光模块</option>
                      <option value="all">所有类型</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    特征选择
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[60px]">
                    <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      rxPower
                      <button className="ml-1 text-blue-800 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      txPower
                      <button className="ml-1 text-blue-800 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      temperature
                      <button className="ml-1 text-blue-800 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex mt-2 gap-2">
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                      + 电压
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">
                      + 电流
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      时间窗口 (小时)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="输入小时数"
                      min="1"
                      defaultValue="24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最低置信度 (%)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="输入置信度"
                      min="1"
                      max="100"
                      defaultValue="70"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked={true} />
                    <span className="text-sm text-gray-700">规则创建后立即激活</span>
                  </label>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setIsTrainingMode(false)}
                >
                  取消
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  创建规则并训练
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulePredictive; 