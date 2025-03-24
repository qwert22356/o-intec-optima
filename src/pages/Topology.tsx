import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { MOCK_DATA } from '../lib/utils';
import {
  AlertCircle,
  Info,
  Loader2,
  Maximize2,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: string;
  parent?: string;
  health?: number;
  temperature?: string;
  portIndex?: number;
  level?: number;
  [key: string]: any; // Allow additional properties for ECharts
}

interface Link {
  source: string;
  target: string;
  ber?: string;
  [key: string]: any; // Allow additional properties for ECharts
}

interface TooltipParams {
  dataType: string;
  data: Node | Link;
  [key: string]: any;
}

export default function Topology() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number>(0);
  
  // 获取节点类型名称
  const getNodeTypeName = (type: string): string => {
    const typeMap: {[key: string]: string} = {
      'datacenter': '数据中心',
      'room': '机房',
      'rack': '机柜',
      'core': 'Core交换机',
      'border': 'Border交换机',
      'spine': 'Spine交换机',
      'leaf': 'Leaf交换机',
      'module': '光模块'
    };
    return typeMap[type] || type;
  };
  
  // 获取节点样式
  const getNodeStyle = (node: Node) => {
    const baseStyle = {
      symbolSize: 40,
      itemStyle: {
        borderWidth: 2
      }
    };
    
    switch(node.type) {
      case 'datacenter':
        return { 
          ...baseStyle,
          symbol: 'roundRect',
          symbolSize: [180, 70],
          itemStyle: { color: '#f3e8ff', borderColor: '#c084fc' }
        };
      case 'room':
        return { 
          ...baseStyle,
          symbol: 'roundRect',
          symbolSize: [160, 60],
          itemStyle: { color: '#f8fafc', borderColor: '#94a3b8' }
        };
      case 'rack':
        return { 
          ...baseStyle,
          symbol: 'rect',
          symbolSize: [120, 50],
          itemStyle: { color: '#f1f5f9', borderColor: '#e2e8f0' }
        };
      case 'core':
        return {
          ...baseStyle,
          symbol: 'circle',
          symbolSize: 50,
          itemStyle: { color: '#4f46e5', borderColor: '#4338ca' }
        };
      case 'border':
        return {
          ...baseStyle,
          symbol: 'circle',
          symbolSize: 45,
          itemStyle: { color: '#2563eb', borderColor: '#1d4ed8' }
        };
      case 'spine':
        return {
          ...baseStyle,
          symbol: 'circle',
          symbolSize: 40,
          itemStyle: { color: '#0ea5e9', borderColor: '#0284c7' }
        };
      case 'leaf':
        return {
          ...baseStyle,
          symbol: 'circle',
          symbolSize: 35,
          itemStyle: { color: '#3b82f6', borderColor: '#2563eb' }
        };
      case 'module':
        return {
          ...baseStyle,
          symbol: 'diamond',
          symbolSize: 30,
          itemStyle: { 
            color: node.health && node.health >= 80 ? '#22c55e' : 
                   node.health && node.health >= 60 ? '#eab308' : '#ef4444',
            borderColor: node.health && node.health >= 80 ? '#16a34a' : 
                         node.health && node.health >= 60 ? '#ca8a04' : '#dc2626'
          }
        };
      default:
        return baseStyle;
    }
  };
  
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    console.log("初始化拓扑图...");
    console.log("拓扑数据节点数量:", MOCK_DATA.topology.nodes.length);
    console.log("拓扑数据连接数量:", MOCK_DATA.topology.links.length);
    
    try {
      // 根据过滤层级筛选节点
      const filterNodes = () => {
        if (filterLevel === 0) {
          return MOCK_DATA.topology.nodes;
        }
        
        const maxLevel = filterLevel + 1; // 显示当前层级及下一层级
        return MOCK_DATA.topology.nodes.filter(node => 
          node.level && node.level <= maxLevel
        );
      };
      
      // 获取要显示的节点和连接
      const visibleNodes = filterNodes();
      const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
      
      // 过滤只包含可见节点的连接
      const visibleLinks = MOCK_DATA.topology.links.filter(
        link => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target)
      );
      
      console.log(`应用层级过滤后: ${visibleNodes.length} 个节点, ${visibleLinks.length} 个连接`);
      
      // 配置层次化布局的ECharts选项
      const option = {
        backgroundColor: '#ffffff',
        tooltip: {
          show: true,
          confine: true,
          formatter: (params: any) => {
            if (params.dataType === 'node') {
              const nodeData = params.data;
              return `
                <div style="padding: 10px">
                  <h4>${nodeData.name}</h4>
                  <div>类型: ${getNodeTypeName(nodeData.type)}</div>
                  ${nodeData.parent ? `所属: ${nodeData.parent}<br>` : ''}
                  ${nodeData.health !== undefined ? `健康分: ${nodeData.health}<br>` : ''}
                  ${nodeData.temperature ? `温度: ${nodeData.temperature}°C<br>` : ''}
                  ${nodeData.portIndex ? `端口号: ${nodeData.portIndex}<br>` : ''}
                  ${nodeData.type === 'module' ? `光功率: -${(Math.random() * 5 + 1).toFixed(1)} dBm` : ''}
                </div>
              `;
            } else if (params.dataType === 'edge') {
              return `<div style="padding: 10px">误码率: ${params.data.ber || 'N/A'}</div>`;
            }
            return '';
          }
        },
        series: [{
          type: 'graph',
          layout: filterLevel > 0 ? 'circular' : 'force', // 根据筛选层级选择不同布局
          roam: true,
          draggable: true,
          zoom: 1,
          focusNodeAdjacency: true,
          force: {
            repulsion: 300,
            edgeLength: 150,
            gravity: 0.1,
            layoutAnimation: true
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: 12
          },
          categories: [
            { name: '数据中心' },
            { name: '机房' },
            { name: '机柜' },
            { name: 'Core交换机' },
            { name: 'Border交换机' },
            { name: 'Spine交换机' },
            { name: 'Leaf交换机' },
            { name: '光模块' }
          ],
          // 转换节点数据，应用样式
          data: visibleNodes.map((node: Node) => {
            const style = getNodeStyle(node);
            const category = 
              node.type === 'datacenter' ? 0 :
              node.type === 'room' ? 1 :
              node.type === 'rack' ? 2 :
              node.type === 'core' ? 3 :
              node.type === 'border' ? 4 :
              node.type === 'spine' ? 5 :
              node.type === 'leaf' ? 6 : 7;
            
            return {
              ...node,
              ...style,
              category,
              label: { 
                show: node.type !== 'module' || filterLevel >= 7, // 只有在特定层级才显示模块标签
                position: 'right',
                formatter: node.name
              }
            };
          }),
          // 转换连接数据，应用样式
          edges: visibleLinks.map((link: Link) => {
            const lineWidth = link.ber === '1e-12' ? 3 : 1;
            const lineType = link.ber === '1e-12' ? 'solid' : [4, 4];
            
            return {
              ...link,
              lineStyle: {
                color: '#94a3b8',
                width: lineWidth,
                type: lineType,
                curveness: 0.1
              },
              value: link.ber
            };
          })
        }]
      };

      console.log("应用ECharts配置...");
      chart.setOption(option);
      
      chart.on('click', (params: any) => {
        if (params.dataType === 'node') {
          setSelectedNode(params.data);
        }
      });

      setIsLoading(false);
    } catch (err) {
      console.error("拓扑图初始化错误:", err);
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }

    // Handle window resize
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [filterLevel]); // 添加filterLevel作为依赖，当筛选条件变化时重新渲染

  // 节点搜索处理
  const handleSearch = () => {
    const term = searchTerm;
    
    if (term.trim() === '') {
      setFilteredNodes([]);
      return;
    }
    
    const filtered = MOCK_DATA.topology.nodes.filter(node => 
      node.name.toLowerCase().includes(term.toLowerCase()) ||
      node.type.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredNodes(filtered.slice(0, 10)); // 只显示前10个结果
  };
  
  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
    setSearchTerm('');
    setFilteredNodes([]);
    
    // 如果需要，自动调整筛选层级到该节点所在层级
    if (node.level && node.level > filterLevel) {
      setFilterLevel(node.level - 1); // 展示到该节点的层级
    }
  };

  // 放大缩小功能
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (!chartRef.current) return;
    const chart = echarts.getInstanceByDom(chartRef.current);
    if (!chart) return;
    
    try {
      // 获取当前的缩放比例
      const option = chart.getOption();
      const series = (option.series as any)?.[0];
      
      if (!series) {
        console.error("无法获取图表配置");
        return;
      }
      
      const currentZoom = series.zoom || 1;
      
      // 放大缩小
      const newZoom = type === 'in' ? currentZoom * 1.5 : type === 'out' ? currentZoom / 1.5 : 1;
      
      chart.setOption({
        series: [{
          zoom: newZoom,
          force: {
            edgeLength: type === 'in' ? 150 * 1.2 : type === 'out' ? 150 * 0.8 : 150
          }
        }]
      });
    } catch (err) {
      console.error("缩放操作错误:", err);
    }
  };

  // 手动触发图表重绘
  const handleRedraw = () => {
    if (!chartRef.current) return;
    
    try {
      console.log("手动重绘图表...");
      // 销毁并重新创建图表实例
      const instance = echarts.getInstanceByDom(chartRef.current);
      if (instance) {
        instance.dispose();
      }
      
      const chart = echarts.init(chartRef.current);
      
      // 使用简化模型的根节点数据
      const simpleData = [
        { 
          id: 'DC',
          name: '北京数据中心', 
          type: 'datacenter',
          symbol: 'roundRect',
          symbolSize: [180, 70],
          itemStyle: { color: '#f3e8ff', borderColor: '#c084fc' }
        },
        { 
          id: 'Room01',
          name: '主机房', 
          type: 'room',
          parent: 'DC',
          symbol: 'roundRect',
          symbolSize: [160, 60],
          itemStyle: { color: '#f8fafc', borderColor: '#94a3b8' }
        },
        { 
          id: 'Room01-Rack01',
          name: '主1号机柜', 
          type: 'rack',
          parent: 'Room01',
          symbol: 'rect',
          symbolSize: [120, 50],
          itemStyle: { color: '#f1f5f9', borderColor: '#e2e8f0' }
        },
        { 
          id: 'Room01-Rack01-Core01',
          name: 'Core-01', 
          type: 'core',
          parent: 'Room01-Rack01',
          symbol: 'circle',
          symbolSize: 50,
          itemStyle: { color: '#4f46e5', borderColor: '#4338ca' }
        },
        { 
          id: 'Room01-Rack01-Core01-Border01',
          name: 'Border-01',
          type: 'border',
          parent: 'Room01-Rack01-Core01',
          symbol: 'circle',
          symbolSize: 45,
          itemStyle: { color: '#2563eb', borderColor: '#1d4ed8' }
        },
        { 
          id: 'Room01-Rack01-Core01-Border01-Spine01',
          name: 'Spine-01', 
          type: 'spine',
          parent: 'Room01-Rack01-Core01-Border01',
          symbol: 'circle',
          symbolSize: 40,
          itemStyle: { color: '#0ea5e9', borderColor: '#0284c7' }
        },
        { 
          id: 'Room01-Rack01-Core01-Border01-Spine01-Leaf01',
          name: 'Leaf-01', 
          type: 'leaf',
          parent: 'Room01-Rack01-Core01-Border01-Spine01',
          symbol: 'circle',
          symbolSize: 35,
          itemStyle: { color: '#3b82f6', borderColor: '#2563eb' }
        },
        { 
          id: 'Room01-Rack01-Core01-Border01-Spine01-Leaf01-MOD01',
          name: '模块-01', 
          type: 'module',
          parent: 'Room01-Rack01-Core01-Border01-Spine01-Leaf01',
          symbol: 'diamond',
          symbolSize: 30,
          itemStyle: { color: '#22c55e', borderColor: '#16a34a' }
        }
      ];
      
      // 生成简化连接
      const simpleLinks = [];
      for (let i = 0; i < simpleData.length - 1; i++) {
        simpleLinks.push({
          source: simpleData[i].id,
          target: simpleData[i+1].id,
          lineStyle: {
            width: 2,
            color: '#94a3b8'
          }
        });
      }
      
      const simpleOption = {
        backgroundColor: '#ffffff',
        tooltip: {
          formatter: (params: any) => {
            if (params.dataType === 'node') {
              return `
                <div style="padding: 10px">
                  <h4>${params.data.name}</h4>
                  <div>类型: ${getNodeTypeName(params.data.type)}</div>
                </div>
              `;
            }
            return '';
          }
        },
        series: [{
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          force: {
            repulsion: 400,
            edgeLength: 100,
            gravity: 0.1,
            layoutAnimation: true
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          data: simpleData,
          edges: simpleLinks
        }]
      };
      
      chart.setOption(simpleOption);
      console.log("图表重绘完成 - 简化版本");
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("重绘图表错误:", err);
    }
  };

  // 在组件加载后自动尝试简化渲染
  useEffect(() => {
    // 5秒后如果仍在加载，尝试简化渲染
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("超时自动切换到简化模式");
        handleRedraw();
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">网络拓扑</h2>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={filterLevel.toString()}
              onChange={(e) => setFilterLevel(parseInt(e.target.value))}
              className="w-36 border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="0">全部层级</option>
              <option value="1">数据中心</option>
              <option value="2">机房</option>
              <option value="3">机架</option>
              <option value="4">设备</option>
              <option value="5">模块</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索设备..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={handleSearch} 
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <Search className="w-4 h-4 mr-2" />
            搜索
          </button>
          <button 
            onClick={handleRedraw} 
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重绘
          </button>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="grow">
          {isLoading ? (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">正在加载拓扑图...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <p className="text-gray-700 font-medium mb-2">加载失败</p>
                <p className="text-gray-500 text-sm">{error}</p>
                <button 
                  onClick={handleRedraw} 
                  className="mt-4 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  重试
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[600px] bg-gray-50 rounded-lg">
              <div ref={chartRef} className="w-full h-full"></div>
              <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <button
                  onClick={() => handleZoom('in')}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              {filteredNodes.length > 0 && searchTerm && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow p-2 max-h-60 overflow-y-auto w-64">
                  <p className="text-xs text-gray-500 mb-2">找到 {filteredNodes.length} 个结果</p>
                  {filteredNodes.map((node) => (
                    <button
                      key={node.id}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                      onClick={() => handleNodeSelect(node)}
                    >
                      <span className="font-medium">{node.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{getNodeTypeName(node.type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-72 bg-gray-50 rounded-lg p-4 shrink-0">
          {!selectedNode ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Info className="w-10 h-10 mb-4" />
              <p className="text-sm">在拓扑图中选择一个节点查看详情</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">详细信息</h3>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">名称</label>
                  <p className="text-sm font-medium text-gray-900">{selectedNode.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">类型</label>
                  <p className="text-sm font-medium text-gray-900">
                    {getNodeTypeName(selectedNode.type)}
                  </p>
                </div>
                {selectedNode.level && (
                  <div>
                    <label className="text-xs text-gray-500">层级</label>
                    <p className="text-sm font-medium text-gray-900">L{selectedNode.level}</p>
                  </div>
                )}
                {selectedNode.parent && (
                  <div>
                    <label className="text-xs text-gray-500">所属设备</label>
                    <p className="text-sm font-medium text-gray-900">{selectedNode.parent}</p>
                  </div>
                )}
                {selectedNode.health !== undefined && (
                  <div>
                    <label className="text-xs text-gray-500">健康分</label>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          selectedNode.health >= 80 ? 'bg-green-500' : 
                          selectedNode.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${selectedNode.health}%` }}
                      />
                    </div>
                    <p className="text-xs text-right mt-1">{selectedNode.health}/100</p>
                  </div>
                )}
                {selectedNode.temperature && (
                  <div>
                    <label className="text-xs text-gray-500">温度</label>
                    <p className="text-sm font-medium text-gray-900">{selectedNode.temperature}°C</p>
                  </div>
                )}
                {selectedNode.portIndex && (
                  <div>
                    <label className="text-xs text-gray-500">端口号</label>
                    <p className="text-sm font-medium text-gray-900">{selectedNode.portIndex}</p>
                  </div>
                )}
                {selectedNode.type === 'module' && (
                  <div>
                    <label className="text-xs text-gray-500">光功率</label>
                    <p className="text-sm font-medium text-gray-900">-{(Math.random() * 5 + 1).toFixed(1)} dBm</p>
                  </div>
                )}
                {['spine', 'leaf', 'core', 'border'].includes(selectedNode.type) && (
                  <div>
                    <label className="text-xs text-gray-500">端口数量</label>
                    <p className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 24) + 24}</p>
                  </div>
                )}
                {['spine', 'leaf', 'core', 'border'].includes(selectedNode.type) && (
                  <div>
                    <label className="text-xs text-gray-500">链路利用率</label>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.floor(Math.random() * 70) + 20}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}