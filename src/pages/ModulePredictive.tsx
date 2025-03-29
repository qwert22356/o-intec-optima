import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  InfoIcon,
  PieChart,
  BarChart,
  Download,
  FileText,
  SlidersHorizontal,
  Calendar,
  Check,
  MapPin,
  Users,
  AlarmClock,
  BarChart3,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ArrowDownAZ,
  ArrowUpAZ
} from 'lucide-react';

// 定义模块数据接口
interface ModuleData {
  id: string;
  name: string;
  health: number;
  temperature: string | number;
  futureTemperature: string | number; // 增加未来温度预测
  futureTemperatureTime: string; // 增加未来温度预测时间点
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
  confidence?: number; // 新增置信度字段
}

// 定义预测规则接口
interface PredictionRule {
  id: string;
  name: string;
  description: string;
  moduleType: string;
  isActive: boolean;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  parameters: {
    algorithm: string;
    features: string[];
    timeWindow: number;
    minConfidence: number;
  };
  createdAt: string;
  updatedAt: string;
  industryRecommendation?: string;
}

// 定义分页配置接口
interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 在参数部分添加行业推荐数据结构
interface IndustryRecommendation {
  industry: string;
  scenario: string;
  algorithm: string;
  reason: string;
}

const industryRecommendations: IndustryRecommendation[] = [
  {
    industry: "AI训练集群",
    scenario: "模块3000个以上，场景特征训练任务持续长，温升缓慢但故障影响大",
    algorithm: "ARIMA+Isolation Forest异常检测",
    reason: "适合长期趋势分析和异常检测，可有效识别缓慢温升异常"
  },
  {
    industry: "AI推理边缘场景",
    scenario: "模块约500个，场景特征负载突变快且实时性高",
    algorithm: "Isolation Forest+滑动窗口异常检测",
    reason: "实时性强，可快速响应负载突变，适合边缘计算场景"
  },
  {
    industry: "互联网内容提供商ISP",
    scenario: "模块20000个以上，场景特征海量模块、环境异构",
    algorithm: "KMeans聚类+类型建模+异常打分",
    reason: "适合大规模异构环境，可对不同类型模块进行分类建模"
  },
  {
    industry: "传统数据中心/金融/政府",
    scenario: "模块规模1500+，场景特征稳定、波动小、合规性强",
    algorithm: "SARIMA+规则引擎",
    reason: "高精度时间序列预测，配合规则引擎保证合规性要求"
  },
  {
    industry: "制造业",
    scenario: "模块规模2000+，场景特征周期性生产，设备新旧老化明显",
    algorithm: "Prophet+周期性建模",
    reason: "适合处理周期性数据，可自动处理节假日等特殊时期"
  },
  {
    industry: "云服务商/电商",
    scenario: "模块规模20000+，场景特征多租户/大规模集群/高自动化",
    algorithm: "分区建模+异常检测+健康评分",
    reason: "适合多租户环境，可进行分区域建模和健康度评估"
  }
];

const ModulePredictive: React.FC = () => {
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
  const [showTrendModal, setShowTrendModal] = useState<boolean>(false);
  const [showModuleTrendModal, setShowModuleTrendModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [modulePagination, setModulePagination] = useState<PaginationConfig>({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  const [rulePagination, setRulePagination] = useState<PaginationConfig>({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  
  // 规则统计数据
  const [ruleStatsVisible, setRuleStatsVisible] = useState<boolean>(true);
  const [rulesTabStatsVisible, setRulesTabStatsVisible] = useState<boolean>(true);
  const [ruleTrendsData, setRuleTrendsData] = useState<{
    dates: string[];
    predictions: number[];
    hits: number[];
  }>({
    dates: [],
    predictions: [],
    hits: []
  });
  
  // v1.5 版本新增状态
  const [showHighRiskModuleModal, setShowHighRiskModuleModal] = useState<boolean>(false);
  const [highRiskModuleSearchTerm, setHighRiskModuleSearchTerm] = useState<string>('');
  const [highRiskTimeFilter, setHighRiskTimeFilter] = useState<number | null>(null); // 小时
  const [highRiskModuleSort, setHighRiskModuleSort] = useState<{
    field: 'timeToFailure' | 'failureProbability',
    direction: 'asc' | 'desc'
  }>({
    field: 'timeToFailure',
    direction: 'asc'
  });
  const [locationFilters, setLocationFilters] = useState<{
    dataCenter: string | null,
    room: string | null,
    rack: string | null,
    device: string | null
  }>({
    dataCenter: null,
    room: null,
    rack: null,
    device: null
  });
  
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
      
      // 生成规则趋势数据
      generateRuleTrendsData();
      
      setIsLoading(false);
    } catch (err) {
      setError('数据加载失败，请稍后重试');
      setIsLoading(false);
      console.error(err);
    }
  }, []);
  
  // 生成过去30天的规则趋势数据
  const generateRuleTrendsData = () => {
    const dates: string[] = [];
    const predictions: number[] = [];
    const hits: number[] = [];
    
    // 生成过去30天的日期
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
      
      // 生成随机的预测次数和命中次数
      const dailyPredictions = Math.floor(Math.random() * 80) + 20; // 20-100之间
      const dailyHits = Math.floor(dailyPredictions * (Math.random() * 0.4 + 0.5)); // 预测次数的50%-90%
      
      predictions.push(dailyPredictions);
      hits.push(dailyHits);
    }
    
    setRuleTrendsData({ dates, predictions, hits });
  };
  
  // 更新分页总数
  useEffect(() => {
    const filteredModules = getFilteredModules();
    setModulePagination(prev => ({
      ...prev,
      total: filteredModules.length
    }));
    
    const filteredRules = getFilteredRules();
    setRulePagination(prev => ({
      ...prev,
      total: filteredRules.length
    }));
  }, [moduleData, searchTerm, showFailingOnly, predictionRules, ruleSearchTerm, ruleFilterStatus]);
  
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
          
        // 当前温度
        const currentTemp = node.temperature || (25 + Math.random() * 15).toFixed(1);
        
        // 预测未来温度 (1-7天后) - 根据故障概率决定温度上升幅度
        const futureHours = Math.floor(Math.random() * 144) + 24; // 24-168小时 (1-7天)
        const temperatureIncrease = predictedFailure 
          ? (Math.random() * 12 + 8) // 故障模块温度上升8-20度
          : (Math.random() * 3); // 正常模块温度上升0-3度
        const futureTemp = (parseFloat(currentTemp.toString()) + temperatureIncrease).toFixed(1);
        
        // 未来时间点
        const now = new Date();
        const futureDate = new Date(now.getTime() + futureHours * 60 * 60 * 1000);
        
        modules.push({
          id: node.id,
          name: node.name,
          health: node.health || Math.floor(Math.random() * 100),
          temperature: currentTemp,
          futureTemperature: futureTemp,
          futureTemperatureTime: futureDate.toISOString(),
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
          confidence: Math.floor(Math.random() * 100) + 50 // 50% - 100%
        });
      }
    });
    
    return modules;
  };
  
  // 修改规则生成函数，添加行业推荐
  const generateMockRules = (): PredictionRule[] => {
    const algorithms = ['ARIMA', 'SARIMA', 'Prophet', 'Isolation Forest', 'KMeans聚类', '规则引擎', '分区建模+异常检测', '滑动窗口异常检测'];
    const featuresList = [
      ['rxPower', 'temperature', 'voltage', 'historical_trend'],
      ['txPower', 'rxPower', 'current', 'temperature', 'load_pattern'],
      ['temperature', 'voltage', 'current', 'age_factor'],
      ['rxPower', 'txPower', 'bias_current', 'environmental_factors']
    ];
    
    const ruleTypes = ['单模光模块', '多模光模块', '所有类型'];
    
    const rules: PredictionRule[] = [];
    
    // 基于行业推荐添加规则
    industryRecommendations.forEach((rec, i) => {
      const isActive = Math.random() < 0.8; // 80%处于活跃状态
      const accuracy = Math.floor(65 + Math.random() * 30);
      const totalPredictions = Math.floor(200 + Math.random() * 800);
      const correctPredictions = Math.floor(totalPredictions * (accuracy / 100));
      
      const now = Date.now();
      const createdAt = now - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000);
      const updatedAt = createdAt + Math.floor(Math.random() * (now - createdAt));
      
      const featIndex = Math.floor(Math.random() * featuresList.length);
      const typeIndex = Math.floor(Math.random() * ruleTypes.length);
      
      rules.push({
        id: `rule-${i}`,
        name: `${rec.industry}-${rec.algorithm}规则`,
        description: `针对${rec.industry}的预测规则，${rec.scenario}。${rec.reason}。`,
        moduleType: ruleTypes[typeIndex],
        isActive,
        accuracy,
        totalPredictions,
        correctPredictions,
        parameters: {
          algorithm: rec.algorithm,
          features: featuresList[featIndex],
          timeWindow: 24 * (Math.floor(Math.random() * 7) + 1), // 1-7天
          minConfidence: Math.floor(60 + Math.random() * 30) // 60-90%
        },
        createdAt: new Date(createdAt).toISOString(),
        updatedAt: new Date(updatedAt).toISOString(),
        industryRecommendation: rec.industry
      });
    });
    
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

  // 获取分页后的模块数据
  const getPaginatedModules = () => {
    const filteredData = getFilteredModules();
    const startIndex = (modulePagination.currentPage - 1) * modulePagination.pageSize;
    const endIndex = startIndex + modulePagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // 获取过滤后的规则
  const getFilteredRules = () => {
    return predictionRules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(ruleSearchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(ruleSearchTerm.toLowerCase());
      
      if (ruleFilterStatus === 'all') return matchesSearch;
      if (ruleFilterStatus === 'active') return matchesSearch && rule.isActive;
      if (ruleFilterStatus === 'inactive') return matchesSearch && !rule.isActive;
      
      return matchesSearch;
    });
  };
  
  // 获取分页后的规则数据
  const getPaginatedRules = () => {
    const filteredData = getFilteredRules();
    const startIndex = (rulePagination.currentPage - 1) * rulePagination.pageSize;
    const endIndex = startIndex + rulePagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // 处理模块页码变化
  const handleModulePageChange = (newPage: number) => {
    setModulePagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // 处理规则页码变化
  const handleRulePageChange = (newPage: number) => {
    setRulePagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // 处理每页显示数量变化
  const handleModulePageSizeChange = (newSize: number) => {
    setModulePagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1 // 切换每页显示数量时重置到第一页
    }));
  };

  // 处理规则每页显示数量变化
  const handleRulePageSizeChange = (newSize: number) => {
    setRulePagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1 // 切换每页显示数量时重置到第一页
    }));
  };

  // 添加导出详情函数
  const exportModuleDetails = (format: string) => {
    if (!selectedModule) return;
    
    const moduleInfo: Record<string, Record<string, string | number>> = {
      基本信息: {
        模块名称: selectedModule.name,
        健康状态: selectedModule.health,
        预测状态: selectedModule.predictedFailure ? '预测故障' : '正常',
        故障概率: `${selectedModule.failureProbability}%`,
        预计剩余时间: selectedModule.predictedFailure ? `${selectedModule.timeToFailure}小时` : '不适用',
        最后更新时间: selectedModule.lastUpdated,
      },
      位置信息: {
        数据中心: selectedModule.dataCenter?.name || '未知',
        机房: selectedModule.room?.name || '未知',
        机架: selectedModule.rack?.name || '未知',
        设备: selectedModule.device?.name || '未知',
        设备类型: selectedModule.device?.type || '未知',
        IP地址: selectedModule.device?.ip || '未知',
        端口: String(selectedModule.portIndex || '未知'),
      },
      性能指标: {
        温度: `${selectedModule.temperature}°C`,
        接收功率: `${selectedModule.rxPower} dBm`,
        发送功率: `${selectedModule.txPower} dBm`,
        电压: `${selectedModule.voltage} V`,
        电流: `${selectedModule.current} mA`,
      }
    };
    
    let content = '';
    let filename = `模块详情_${selectedModule.name}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') {
      content = JSON.stringify(moduleInfo, null, 2);
      filename += '.json';
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // 将嵌套对象扁平化为CSV
      let csvContent = '';
      Object.keys(moduleInfo).forEach(category => {
        const categoryData = moduleInfo[category];
        Object.keys(categoryData).forEach(key => {
          csvContent += `${category}-${key},${categoryData[key]}\n`;
        });
      });
      
      filename += '.csv';
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      alert('PDF导出功能正在开发中，请选择其他格式');
    }
    
    setExportFormat(null); // 重置导出格式选择
  };
  
  // 添加导出所有模块数据的函数
  const exportAllModulesData = () => {
    const modulesData = getFilteredModules();
    if (modulesData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    // 创建CSV数据
    let csvContent = '模块名称,位置,状态,故障概率,预计剩余时间,温度,未来温度预测,接收功率,发送功率,电压,电流\n';
    
    modulesData.forEach(module => {
      const location = `${module.dataCenter?.name || '未知'} / ${module.room?.name || '未知'} / ${module.device?.name || '未知'}`;
      const status = module.predictedFailure ? '预测故障' : '正常';
      const remainingTime = module.predictedFailure ? `${module.timeToFailure} 小时` : '-';
      
      csvContent += `"${module.name}","${location}","${status}",${module.failureProbability}%,"${remainingTime}",${module.temperature}°C,${module.futureTemperature}°C,${module.rxPower} dBm,${module.txPower} dBm,${module.voltage} V,${module.current} mA\n`;
    });
    
    // 导出为CSV文件
    const filename = `光模块预测分析数据_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 添加点击外部关闭导出菜单
  useEffect(() => {
    if (exportFormat) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.export-menu-container')) {
          setExportFormat(null);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [exportFormat]);
  
  // 过滤规则函数
  const filteredRules = predictionRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(ruleSearchTerm.toLowerCase()) ||
                        rule.description.toLowerCase().includes(ruleSearchTerm.toLowerCase());
    
    if (ruleFilterStatus === 'all') return matchesSearch;
    if (ruleFilterStatus === 'active') return matchesSearch && rule.isActive;
    if (ruleFilterStatus === 'inactive') return matchesSearch && !rule.isActive;
    
    return matchesSearch;
  });
  
  // 切换规则激活状态
  const toggleRuleActiveStatus = (ruleId: string) => {
    setPredictionRules(prevRules => 
      prevRules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive } 
          : rule
      )
    );
  };
  
  // 获取排名前5的规则
  const getTopRules = () => {
    return [...predictionRules]
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);
  };
  
  // 预测趋势数据
  const predictionTrends = {
    labels: Array.from({ length: 30 }, (_, i) => `${30-i}天前`).reverse(),
    datasets: [
      {
        label: '预测次数',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50 + 20)),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: '命中次数',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30 + 10)),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // 获取高风险模块
  const getHighRiskModules = () => {
    return moduleData.filter(m => m.predictedFailure && m.timeToFailure <= 24);
  };

  // 过滤并排序高风险模块
  const getFilteredAndSortedHighRiskModules = () => {
    let filtered = getHighRiskModules();
    
    // 应用搜索词过滤
    if (highRiskModuleSearchTerm) {
      const term = highRiskModuleSearchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        (m.name?.toLowerCase().includes(term)) || 
        (m.device?.name?.toLowerCase().includes(term)) ||
        (m.dataCenter?.name?.toLowerCase().includes(term)) ||
        (m.room?.name?.toLowerCase().includes(term)) ||
        (m.rack?.name?.toLowerCase().includes(term))
      );
    }
    
    // 应用位置过滤
    if (locationFilters.dataCenter) {
      filtered = filtered.filter(m => m.dataCenter?.name === locationFilters.dataCenter);
    }
    if (locationFilters.room) {
      filtered = filtered.filter(m => m.room?.name === locationFilters.room);
    }
    if (locationFilters.rack) {
      filtered = filtered.filter(m => m.rack?.name === locationFilters.rack);
    }
    if (locationFilters.device) {
      filtered = filtered.filter(m => m.device?.name === locationFilters.device);
    }
    
    // 应用预计寿命过滤
    if (highRiskTimeFilter !== null) {
      filtered = filtered.filter(m => m.timeToFailure <= highRiskTimeFilter);
    }
    
    // 排序
    return filtered.sort((a, b) => {
      if (highRiskModuleSort.field === 'timeToFailure') {
        return highRiskModuleSort.direction === 'asc' 
          ? a.timeToFailure - b.timeToFailure 
          : b.timeToFailure - a.timeToFailure;
      } else {
        return highRiskModuleSort.direction === 'asc' 
          ? a.failureProbability - b.failureProbability 
          : b.failureProbability - a.failureProbability;
      }
    });
  };

  // 获取唯一位置选项
  const getUniqueLocationOptions = () => {
    const highRiskModules = getHighRiskModules();
    
    const dataCenters = Array.from(new Set(
      highRiskModules
        .filter(m => m.dataCenter?.name)
        .map(m => m.dataCenter?.name)
    ));
    
    const rooms = Array.from(new Set(
      highRiskModules
        .filter(m => m.room?.name)
        .map(m => m.room?.name)
    ));
    
    const racks = Array.from(new Set(
      highRiskModules
        .filter(m => m.rack?.name)
        .map(m => m.rack?.name)
    ));
    
    const devices = Array.from(new Set(
      highRiskModules
        .filter(m => m.device?.name)
        .map(m => m.device?.name)
    ));
    
    return { dataCenters, rooms, racks, devices };
  };

  // 导出高风险模块数据
  const exportHighRiskModules = (format: 'csv' | 'json' | 'pdf') => {
    const modules = getFilteredAndSortedHighRiskModules();
    let content: string;
    let fileName: string;
    
    if (format === 'json') {
      content = JSON.stringify(modules, null, 2);
      fileName = '高风险模块预警_' + new Date().toISOString().slice(0, 10) + '.json';
    } else if (format === 'csv') {
      // 创建CSV表头
      const headers = [
        '模块名称', '数据中心', '机房', '机架', '设备', '端口', 
        '故障概率', '预计剩余时间(小时)', '预测故障时间', '温度', '健康分'
      ].join(',');
      
      // 创建CSV数据行
      const rows = modules.map(m => [
        m.name,
        m.dataCenter?.name || '-',
        m.room?.name || '-',
        m.rack?.name || '-',
        m.device?.name || '-',
        m.portIndex,
        m.failureProbability + '%',
        m.timeToFailure,
        new Date(Date.now() + m.timeToFailure * 3600 * 1000).toLocaleString(),
        m.temperature + '°C',
        m.health
      ].join(','));
      
      content = [headers, ...rows].join('\n');
      fileName = '高风险模块预警_' + new Date().toISOString().slice(0, 10) + '.csv';
    } else {
      // 对于PDF，先生成简单的文本内容，实际应用中应使用PDF生成库
      content = `高风险模块预警报告\n生成时间: ${new Date().toLocaleString()}\n\n`;
      modules.forEach((m, i) => {
        content += `${i+1}. ${m.name}\n`;
        content += `   位置: ${m.dataCenter?.name || '-'} > ${m.room?.name || '-'} > ${m.rack?.name || '-'} > ${m.device?.name || '-'} > 端口 ${m.portIndex}\n`;
        content += `   故障概率: ${m.failureProbability}%\n`;
        content += `   预计剩余时间: ${m.timeToFailure}小时\n`;
        content += `   预测故障时间: ${new Date(Date.now() + m.timeToFailure * 3600 * 1000).toLocaleString()}\n\n`;
      });
      fileName = '高风险模块预警_' + new Date().toISOString().slice(0, 10) + '.txt';
    }
    
    // 创建下载链接
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                onClick={() => {/* TODO: 添加插件安装功能 */}}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                安装预测插件
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
                    <div className="flex items-center text-sm text-gray-500">
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        value={showFailingOnly ? 'predicted' : 'all'}
                        onChange={(e) => setShowFailingOnly(e.target.value === 'predicted')}
                      >
                        <option value="all">所有状态</option>
                        <option value="predicted">预测故障</option>
                        <option value="normal">正常运行</option>
                      </select>
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                        onClick={() => exportAllModulesData()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        导出数据
                      </button>
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
                            未来温度预测
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedModules().map((module) => (
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
                                parseFloat(String(module.futureTemperature)) > 45 ? 'text-red-600' : 
                                parseFloat(String(module.futureTemperature)) > 35 ? 'text-amber-600' : 'text-gray-600'
                              }`}>
                                {module.futureTemperature}°C
                                <span className="text-xs ml-1 text-gray-500">
                                  (+{(parseFloat(String(module.futureTemperature)) - parseFloat(String(module.temperature))).toFixed(1)})
                                </span>
                              </span>
                              <div className="text-xs text-gray-500">
                                {new Date(module.futureTemperatureTime).toLocaleDateString()}
                              </div>
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
                  
                  {getPaginatedModules().length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      未找到符合条件的光模块
                    </div>
                  )}
                  
                  {/* 添加模块分页控件 */}
                  {getFilteredModules().length > 0 && (
                    <div className="flex flex-wrap items-center justify-between px-4 py-4 border-t border-gray-200 mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        显示 {getFilteredModules().length > 0 ? (modulePagination.currentPage - 1) * modulePagination.pageSize + 1 : 0} - {Math.min(modulePagination.currentPage * modulePagination.pageSize, getFilteredModules().length)} 条，共 {getFilteredModules().length} 条
                      </div>
                      
                      <div className="flex items-center mt-2 sm:mt-0">
                        <div className="mr-4">
                          <select 
                            value={modulePagination.pageSize}
                            onChange={(e) => handleModulePageSizeChange(Number(e.target.value))}
                            className="p-1 px-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value={10}>10条/页</option>
                            <option value={20}>20条/页</option>
                            <option value={50}>50条/页</option>
                            <option value={100}>100条/页</option>
                          </select>
                        </div>
                        
                        <div className="flex">
                          <button 
                            onClick={() => handleModulePageChange(1)}
                            disabled={modulePagination.currentPage === 1}
                            className="px-3 py-1 rounded-l-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            首页
                          </button>
                          <button 
                            onClick={() => handleModulePageChange(modulePagination.currentPage - 1)}
                            disabled={modulePagination.currentPage === 1}
                            className="px-3 py-1 border-t border-b border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            上一页
                          </button>
                          <div className="px-3 py-1 border-t border-b border-gray-300 text-sm font-medium bg-blue-50">
                            {modulePagination.currentPage}
                          </div>
                          <button 
                            onClick={() => handleModulePageChange(modulePagination.currentPage + 1)}
                            disabled={modulePagination.currentPage * modulePagination.pageSize >= getFilteredModules().length}
                            className="px-3 py-1 border-t border-b border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            下一页
                          </button>
                          <button 
                            onClick={() => handleModulePageChange(Math.ceil(getFilteredModules().length / modulePagination.pageSize))}
                            disabled={modulePagination.currentPage * modulePagination.pageSize >= getFilteredModules().length}
                            className="px-3 py-1 rounded-r-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            末页
                          </button>
                        </div>
                      </div>
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
                      <button
                        className="ml-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                        onClick={() => exportAllModulesData()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        导出数据
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* 左侧规则列表 */}
                    <div className="w-full lg:w-2/3">
                      <div className="space-y-4">
                        {getFilteredRules().map((rule: PredictionRule) => (
                          <div
                            key={rule.id}
                            className={`p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow ${
                              selectedRule?.id === rule.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedRule(rule)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                {rule.name}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    rule.accuracy >= 80
                                      ? 'bg-green-100 text-green-800'
                                      : rule.accuracy >= 60
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {rule.accuracy}% 准确率
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRuleActiveStatus(rule.id);
                                  }}
                                  className={`p-1 rounded-full ${
                                    rule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                                  }`}
                                >
                                  {rule.isActive ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">{rule.description}</div>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              更新于 {new Date(rule.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        
                        {getFilteredRules().length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            {ruleSearchTerm || ruleFilterStatus !== 'all'
                              ? '没有找到匹配的规则'
                              : '暂无预测规则，点击下方按钮创建'}
                          </div>
                        )}
                        
                        <div className="flex justify-center">
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                            onClick={() => setIsTrainingMode(true)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            创建新规则
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* 右侧规则统计 */}
                    <div className="w-full lg:w-1/3">
                      <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <h3 className="text-lg font-medium mb-4">预测趋势概览</h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">过去30天趋势图</p>
                          </div>
                        </div>
                        <div className="flex justify-center space-x-4 mt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {predictionRules.reduce((sum, rule) => sum + rule.totalPredictions, 0)}
                            </div>
                            <div className="text-xs text-gray-500">总预测次数</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {predictionRules.reduce((sum, rule) => sum + Math.round(rule.totalPredictions * rule.accuracy / 100), 0)}
                            </div>
                            <div className="text-xs text-gray-500">总命中次数</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-medium mb-4">规则准确率分析</h3>
                        <div className="space-y-3">
                          {getTopRules().map((rule: PredictionRule) => (
                            <div key={rule.id} className="flex items-center space-x-2">
                              <div className="w-20 truncate font-medium">{rule.name}</div>
                              <div className="flex-1">
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                  <div
                                    className={`h-full rounded-full ${
                                      rule.accuracy >= 80 ? 'bg-green-500' :
                                      rule.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${rule.accuracy}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-10 text-right font-medium text-sm">
                                {rule.accuracy}%
                              </div>
                            </div>
                          ))}
                        </div>
                        {getTopRules().length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            暂无规则数据
                          </div>
                        )}
                        <button
                          className="w-full mt-4 px-3 py-2 text-sm text-blue-600 hover:underline flex items-center justify-center"
                          onClick={() => {
                            setRuleSearchTerm('');
                            setRuleFilterStatus('all');
                            // 确保不弹出任何窗口
                            setShowTrendModal(false);
                            setSelectedRule(null);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          刷新所有规则准确率
                        </button>
                      </div>
                    </div>
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
                  <div className="text-center text-sm text-blue-600 cursor-pointer hover:underline"
                    onClick={() => setShowHighRiskModuleModal(true)}
                  >
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
                  
                  {/* Health status display */}
                  {selectedModule.predictedFailure && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <div className="text-red-700 text-sm">
                        <InfoIcon className="w-5 h-5 inline-block mr-1" />
                        针对此模块检测到潜在故障风险，预测置信度 <span className="font-bold">{selectedModule.confidence}%</span>
                      </div>
                    </div>
                  )}
                  
                  
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-end space-x-3">
                <div className="relative export-menu-container">
                  <button 
                    onClick={() => setExportFormat(exportFormat ? null : 'select')}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    导出详情
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {exportFormat === 'select' && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button 
                        onClick={() => exportModuleDetails('json')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        JSON格式
                      </button>
                      <button 
                        onClick={() => exportModuleDetails('csv')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        CSV格式
                      </button>
                      <button 
                        onClick={() => exportModuleDetails('pdf')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        PDF格式
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={() => setShowModuleTrendModal(true)}
                >
                  查看历史趋势
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 规则详情对话框 */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedRule.name}</h2>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center mb-4">
                <div className={`px-2 py-1 rounded-full ${
                  selectedRule.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedRule.isActive ? '活跃' : '未激活'}
                </div>
                <div className="ml-2 text-sm text-gray-500">
                  准确率: 
                  <span className={`font-medium ${
                    selectedRule.accuracy >= 80 ? 'text-green-600' :
                    selectedRule.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {' '}{selectedRule.accuracy}%
                  </span>
                </div>
                <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {selectedRule.moduleType}
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                {selectedRule.description}
              </p>
              
              {selectedRule.industryRecommendation && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">行业推荐信息</h4>
                  <div className="text-sm">
                    <p><span className="font-medium">适用场景：</span> 
                      {industryRecommendations.find(rec => rec.industry === selectedRule.industryRecommendation)?.scenario}
                    </p>
                    <p className="mt-2"><span className="font-medium">推荐原因：</span> 
                      {industryRecommendations.find(rec => rec.industry === selectedRule.industryRecommendation)?.reason}
                    </p>
                  </div>
                </div>
              )}
              
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
      
      {/* 模块历史趋势模态框 */}
      {showModuleTrendModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedModule.name} 历史趋势分析</h2>
                <button
                  onClick={() => setShowModuleTrendModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                {/* 温度趋势图 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">温度历史趋势</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                      <span>温度 (°C)</span>
                    </div>
                  </div>
                  
                  <div className="h-64 relative">
                    <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                      {/* 背景网格 */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line 
                          key={`grid-y-${i}`}
                          x1="0" 
                          y1={50 * i} 
                          x2="1000" 
                          y2={50 * i} 
                          stroke="#E5E7EB" 
                          strokeWidth="1"
                          strokeDasharray="5,5"
                        />
                      ))}
                      {Array.from({ length: 7 }).map((_, i) => (
                        <line 
                          key={`grid-x-${i}`}
                          x1={i * (1000 / 6)} 
                          y1="0" 
                          x2={i * (1000 / 6)} 
                          y2="300" 
                          stroke="#E5E7EB" 
                          strokeWidth="1"
                          strokeDasharray="5,5"
                        />
                      ))}
                      
                      {/* X轴和Y轴 */}
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="#94A3B8" strokeWidth="2" />
                      <line x1="0" y1="0" x2="0" y2="300" stroke="#94A3B8" strokeWidth="2" />
                      
                      {/* 模拟温度曲线 */}
                      <path
                        d="M0,200 C100,180 200,220 300,230 C400,240 500,200 600,150 C700,100 800,120 900,130 L1000,120"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="3"
                      />
                      
                      {/* 危险阈值线 */}
                      <line x1="0" y1="80" x2="1000" y2="80" stroke="#EF4444" strokeWidth="1" strokeDasharray="5,5" />
                      <text x="5" y="75" fontSize="12" fill="#EF4444">危险阈值 (75°C)</text>
                      
                      {/* 警告阈值线 */}
                      <line x1="0" y1="120" x2="1000" y2="120" stroke="#F59E0B" strokeWidth="1" strokeDasharray="5,5" />
                      <text x="5" y="115" fontSize="12" fill="#F59E0B">警告阈值 (65°C)</text>
                      
                      {/* 当前温度指示 */}
                      <circle cx="1000" cy="120" r="5" fill="#F97316" />
                      <text x="970" y="105" fontSize="12" fill="#F97316" textAnchor="end">当前: 65°C</text>
                      
                      {/* X轴刻度 */}
                      {['7天前', '6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'].map((label, i) => (
                        <text 
                          key={`x-label-${i}`}
                          x={i * (1000 / 7)} 
                          y="320" 
                          textAnchor="middle" 
                          fontSize="12"
                          fill="#64748B"
                        >
                          {label}
                        </text>
                      ))}
                      
                      {/* Y轴刻度 */}
                      {['85°C', '75°C', '65°C', '55°C', '45°C', '35°C', '25°C'].map((label, i) => (
                        <text 
                          key={`y-label-${i}`}
                          x="-5" 
                          y={i * 50} 
                          textAnchor="end" 
                          dominantBaseline="middle"
                          fontSize="12"
                          fill="#64748B"
                        >
                          {label}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>
                
                {/* 功率趋势图 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">接收功率历史趋势</h3>
                    <div className="flex space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span>接收功率 (dBm)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span>发送功率 (dBm)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 relative">
                    <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                      {/* 背景网格 */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line 
                          key={`grid-y-${i}`}
                          x1="0" 
                          y1={50 * i} 
                          x2="1000" 
                          y2={50 * i} 
                          stroke="#E5E7EB" 
                          strokeWidth="1"
                          strokeDasharray="5,5"
                        />
                      ))}
                      {Array.from({ length: 7 }).map((_, i) => (
                        <line 
                          key={`grid-x-${i}`}
                          x1={i * (1000 / 6)} 
                          y1="0" 
                          x2={i * (1000 / 6)} 
                          y2="300" 
                          stroke="#E5E7EB" 
                          strokeWidth="1"
                          strokeDasharray="5,5"
                        />
                      ))}
                      
                      {/* X轴和Y轴 */}
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="#94A3B8" strokeWidth="2" />
                      <line x1="0" y1="0" x2="0" y2="300" stroke="#94A3B8" strokeWidth="2" />
                      
                      {/* 接收功率曲线 */}
                      <path
                        d="M0,150 C100,170 200,160 300,180 C400,200 500,190 600,210 C700,230 800,220 900,240 L1000,230"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                      />
                      
                      {/* 发送功率曲线 */}
                      <path
                        d="M0,100 C100,110 200,105 300,115 C400,120 500,115 600,125 C700,130 800,125 900,135 L1000,130"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                      />
                      
                      {/* 当前接收功率指示 */}
                      <circle cx="1000" cy="230" r="5" fill="#3B82F6" />
                      <text x="970" y="225" fontSize="12" fill="#3B82F6" textAnchor="end">当前: -3.2 dBm</text>
                      
                      {/* 当前发送功率指示 */}
                      <circle cx="1000" cy="130" r="5" fill="#10B981" />
                      <text x="970" y="125" fontSize="12" fill="#10B981" textAnchor="end">当前: 0.5 dBm</text>
                      
                      {/* X轴刻度 */}
                      {['7天前', '6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'].map((label, i) => (
                        <text 
                          key={`x-label-${i}`}
                          x={i * (1000 / 7)} 
                          y="320" 
                          textAnchor="middle" 
                          fontSize="12"
                          fill="#64748B"
                        >
                          {label}
                        </text>
                      ))}
                      
                      {/* Y轴刻度 */}
                      {['5 dBm', '2 dBm', '0 dBm', '-2 dBm', '-5 dBm', '-8 dBm', '-10 dBm'].map((label, i) => (
                        <text 
                          key={`y-label-${i}`}
                          x="-5" 
                          y={i * 50} 
                          textAnchor="end" 
                          dominantBaseline="middle"
                          fontSize="12"
                          fill="#64748B"
                        >
                          {label}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-end">
                <button
                  onClick={() => setShowModuleTrendModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建新规则表单 */}
      {isTrainingMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">创建新预测规则</h2>
                <button
                  onClick={() => setIsTrainingMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
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
                      <option value="sarima">SARIMA时间序列</option>
                      <option value="prophet">Prophet预测</option>
                      <option value="isolation_forest">Isolation Forest异常检测</option>
                      <option value="kmeans">KMeans聚类</option>
                      <option value="rule_engine">规则引擎</option>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    行业推荐
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">选择行业推荐（可选）</option>
                    {industryRecommendations.map(rec => (
                      <option key={rec.industry} value={rec.industry}>
                        {rec.industry} ({rec.algorithm})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    选择行业推荐可以应用预设的参数配置，适合您的具体应用场景
                  </p>
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

      {/* 高风险模块预测预警表弹窗 */}
      {showHighRiskModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  未来24小时高风险模块预测预警表
                  <span className="ml-2 text-sm text-gray-500">
                    (共 {getFilteredAndSortedHighRiskModules().length} 个模块)
                  </span>
                </h2>
                <button 
                  onClick={() => setShowHighRiskModuleModal(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 搜索和筛选工具栏 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* 搜索框 */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="搜索模块名称或位置..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={highRiskModuleSearchTerm}
                    onChange={(e) => setHighRiskModuleSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* 数据中心筛选 */}
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={locationFilters.dataCenter || ''}
                    onChange={(e) => setLocationFilters({
                      ...locationFilters,
                      dataCenter: e.target.value === '' ? null : e.target.value
                    })}
                  >
                    <option value="">所有数据中心</option>
                    {getUniqueLocationOptions().dataCenters.map((dc) => (
                      <option key={dc} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>
                
                {/* 机房筛选 */}
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={locationFilters.room || ''}
                    onChange={(e) => setLocationFilters({
                      ...locationFilters,
                      room: e.target.value === '' ? null : e.target.value
                    })}
                  >
                    <option value="">所有机房</option>
                    {getUniqueLocationOptions().rooms.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                
                {/* 预计寿命筛选 */}
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={highRiskTimeFilter?.toString() || ''}
                    onChange={(e) => setHighRiskTimeFilter(
                      e.target.value === '' ? null : parseInt(e.target.value)
                    )}
                  >
                    <option value="">所有预计寿命</option>
                    <option value="1">未来1小时</option>
                    <option value="2">未来2小时</option>
                    <option value="4">未来4小时</option>
                    <option value="6">未来6小时</option>
                    <option value="12">未来12小时</option>
                    <option value="24">未来24小时</option>
                  </select>
                </div>
              </div>
              
              {/* 第二行筛选器 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* 机架筛选 */}
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={locationFilters.rack || ''}
                    onChange={(e) => setLocationFilters({
                      ...locationFilters,
                      rack: e.target.value === '' ? null : e.target.value
                    })}
                  >
                    <option value="">所有机架</option>
                    {getUniqueLocationOptions().racks.map((rack) => (
                      <option key={rack} value={rack}>{rack}</option>
                    ))}
                  </select>
                </div>
                
                {/* 设备筛选 */}
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={locationFilters.device || ''}
                    onChange={(e) => setLocationFilters({
                      ...locationFilters,
                      device: e.target.value === '' ? null : e.target.value
                    })}
                  >
                    <option value="">所有设备</option>
                    {getUniqueLocationOptions().devices.map((device) => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </select>
                </div>
                
                {/* 排序控制 */}
                <div className="flex">
                  <button
                    className={`flex-1 flex items-center justify-center border ${
                      highRiskModuleSort.field === 'timeToFailure' 
                        ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : 'border-gray-300 text-gray-600'
                    } rounded-l-md py-2 px-3`}
                    onClick={() => setHighRiskModuleSort({
                      field: 'timeToFailure',
                      direction: highRiskModuleSort.field === 'timeToFailure' 
                        ? (highRiskModuleSort.direction === 'asc' ? 'desc' : 'asc') 
                        : 'asc'
                    })}
                  >
                    剩余时间
                    {highRiskModuleSort.field === 'timeToFailure' && (
                      highRiskModuleSort.direction === 'asc' 
                        ? <ArrowUp className="w-4 h-4 ml-1" /> 
                        : <ArrowDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center border ${
                      highRiskModuleSort.field === 'failureProbability' 
                        ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : 'border-gray-300 text-gray-600'
                    } rounded-r-md py-2 px-3`}
                    onClick={() => setHighRiskModuleSort({
                      field: 'failureProbability',
                      direction: highRiskModuleSort.field === 'failureProbability' 
                        ? (highRiskModuleSort.direction === 'asc' ? 'desc' : 'asc') 
                        : 'desc'
                    })}
                  >
                    风险分数
                    {highRiskModuleSort.field === 'failureProbability' && (
                      highRiskModuleSort.direction === 'asc' 
                        ? <ArrowUp className="w-4 h-4 ml-1" /> 
                        : <ArrowDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* 数据表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        模块名称
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        位置信息
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        故障概率
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        剩余时间
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        预计故障时间
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredAndSortedHighRiskModules().map((module) => (
                      <tr key={module.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              module.failureProbability >= 80 ? 'bg-red-500' :
                              module.failureProbability >= 60 ? 'bg-yellow-500' : 'bg-orange-400'
                            }`}></div>
                            <div className="text-sm font-medium text-gray-900">{module.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {module.dataCenter?.name || '-'} / {module.room?.name || '-'} / {module.rack?.name || '-'} / {module.device?.name || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div 
                                className={`h-full rounded-full ${
                                  module.failureProbability >= 80 ? 'bg-red-500' :
                                  module.failureProbability >= 60 ? 'bg-yellow-500' : 'bg-orange-400'
                                }`}
                                style={{ width: `${module.failureProbability}%` }}
                              ></div>
                            </div>
                            <span 
                              className={`text-sm font-medium ${
                                module.failureProbability >= 80 ? 'text-red-600' :
                                module.failureProbability >= 60 ? 'text-yellow-600' : 'text-orange-600'
                              }`}
                            >
                              {module.failureProbability}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className={`w-4 h-4 mr-1 ${
                              module.timeToFailure <= 1 ? 'text-red-500' :
                              module.timeToFailure <= 6 ? 'text-orange-500' : 'text-yellow-500'
                            }`} />
                            <span className="text-sm font-medium">{module.timeToFailure} 小时</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(Date.now() + module.timeToFailure * 3600 * 1000).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedModule(module)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredAndSortedHighRiskModules().length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    没有符合条件的高风险模块
                  </div>
                )}
              </div>
              
              {/* 导出按钮 */}
              <div className="mt-6 flex justify-end">
                <div className="relative mr-4">
                  <button 
                    onClick={() => exportHighRiskModules('csv')}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出 CSV
                  </button>
                </div>
                <div className="relative mr-4">
                  <button 
                    onClick={() => exportHighRiskModules('json')}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出 JSON
                  </button>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowHighRiskModuleModal(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 确保在文件末尾导出时使用正确的类型
export default ModulePredictive; 