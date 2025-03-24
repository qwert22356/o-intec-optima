import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define interfaces for topology data
export interface TopologyNode {
  id: string;
  name: string;
  type: string;
  parent?: string;
  health?: number;
  temperature?: string;
  portIndex?: number;
  level?: number; // 节点层级，用于分层布局
}

export interface TopologyLink {
  source: string;
  target: string;
  ber: string;
}

export interface Topology {
  nodes: TopologyNode[];
  links: TopologyLink[];
}

// 构建复杂的拓扑数据
function createMockTopology(): Topology {
  console.log("开始创建层次化网络拓扑数据...");
  
  const mockTopology: Topology = {
    nodes: [],
    links: []
  };

  try {
    // 添加数据中心节点
    mockTopology.nodes.push({
      id: 'DC',
      name: '北京数据中心',
      type: 'datacenter',
      level: 1
    });

    // 添加机房节点
    const roomCount = 2;
    for (let r = 1; r <= roomCount; r++) {
      const roomId = `Room${r.toString().padStart(2, '0')}`;
      mockTopology.nodes.push({
        id: roomId,
        name: `${r === 1 ? '主' : '备'}机房`,
        type: 'room',
        parent: 'DC',
        level: 2
      });
      
      // 数据中心到机房的连接
      mockTopology.links.push({
        source: 'DC',
        target: roomId,
        ber: '1e-12'
      });

      // 每个机房添加机柜
      const rackCount = 3;
      for (let k = 1; k <= rackCount; k++) {
        const rackId = `${roomId}-Rack${k.toString().padStart(2, '0')}`;
        mockTopology.nodes.push({
          id: rackId,
          name: `${r === 1 ? '主' : '备'}${k}号机柜`,
          type: 'rack',
          parent: roomId,
          level: 3
        });
        
        // 机房到机柜的连接
        mockTopology.links.push({
          source: roomId,
          target: rackId,
          ber: '1e-12'
        });
      }
    }

    // 为每个机柜添加Core层交换机
    const corePerRack = 2;
    mockTopology.nodes.forEach(node => {
      if (node.type === 'rack') {
        for (let c = 1; c <= corePerRack; c++) {
          const coreId = `${node.id}-Core${c.toString().padStart(2, '0')}`;
          mockTopology.nodes.push({
            id: coreId,
            name: `Core-${coreId.split('-').pop()}`,
            type: 'core',
            parent: node.id,
            level: 4,
            health: 90 + Math.floor(Math.random() * 10)
          });
          
          // 机柜到Core层的连接
          mockTopology.links.push({
            source: node.id,
            target: coreId,
            ber: '1e-12'
          });
        }
      }
    });

    // 为Core层添加Border层
    const borderPerCore = 2;
    mockTopology.nodes.forEach(node => {
      if (node.type === 'core') {
        for (let b = 1; b <= borderPerCore; b++) {
          const borderId = `${node.id}-Border${b.toString().padStart(2, '0')}`;
          mockTopology.nodes.push({
            id: borderId,
            name: `Border-${borderId.split('-').pop()}`,
            type: 'border',
            parent: node.id,
            level: 5,
            health: 85 + Math.floor(Math.random() * 10)
          });
          
          // Core到Border层的连接
          mockTopology.links.push({
            source: node.id,
            target: borderId,
            ber: '1e-12'
          });
        }
      }
    });

    // 为Border层添加Spine层
    const spinePerBorder = 2;
    mockTopology.nodes.forEach(node => {
      if (node.type === 'border') {
        for (let s = 1; s <= spinePerBorder; s++) {
          const spineId = `${node.id}-Spine${s.toString().padStart(2, '0')}`;
          mockTopology.nodes.push({
            id: spineId,
            name: `Spine-${spineId.split('-').pop()}`,
            type: 'spine',
            parent: node.id,
            level: 6,
            health: 80 + Math.floor(Math.random() * 15)
          });
          
          // Border到Spine层的连接
          mockTopology.links.push({
            source: node.id,
            target: spineId,
            ber: '1e-12'
          });
        }
      }
    });

    // 为Spine层添加Leaf层
    const leafPerSpine = 2;
    mockTopology.nodes.forEach(node => {
      if (node.type === 'spine') {
        for (let l = 1; l <= leafPerSpine; l++) {
          const leafId = `${node.id}-Leaf${l.toString().padStart(2, '0')}`;
          mockTopology.nodes.push({
            id: leafId,
            name: `Leaf-${leafId.split('-').pop()}`,
            type: 'leaf',
            parent: node.id,
            level: 7,
            health: 75 + Math.floor(Math.random() * 20)
          });
          
          // Spine到Leaf层的连接
          mockTopology.links.push({
            source: node.id,
            target: leafId,
            ber: '1e-11'
          });
        }
      }
    });

    // 为Leaf层添加光模块
    const modulePerLeaf = 3; // 每个Leaf有3个光模块
    mockTopology.nodes.forEach(node => {
      if (node.type === 'leaf') {
        for (let m = 1; m <= modulePerLeaf; m++) {
          const moduleId = `${node.id}-MOD${m.toString().padStart(2, '0')}`;
          const health = Math.floor(Math.random() * 100); // 0-99
          const temperature = (Math.random() * 30 + 40).toFixed(1); // 40.0 - 70.0
          const portIndex = Math.floor(Math.random() * 50) + 1; // 1-50

          mockTopology.nodes.push({
            id: moduleId,
            name: `模块-${moduleId.split('-').pop()}`,
            type: 'module',
            parent: node.id,
            level: 8,
            health: health,
            temperature: temperature,
            portIndex: portIndex
          });

          // Leaf到光模块的连接
          mockTopology.links.push({
            source: node.id,
            target: moduleId,
            ber: `1e-${Math.floor(Math.random() * 4) + 9}` // 1e-9 ~ 1e-12
          });
        }
      }
    });

    // 添加同级连接，形成网状结构
    // 连接同一级别的Core
    const coreNodes = mockTopology.nodes.filter(node => node.type === 'core');
    for (let i = 0; i < coreNodes.length; i+=2) {
      if (i+1 < coreNodes.length) {
        mockTopology.links.push({
          source: coreNodes[i].id,
          target: coreNodes[i+1].id,
          ber: '1e-12'
        });
      }
    }

    // 连接同一级别的Spine
    const spineNodes = mockTopology.nodes.filter(node => node.type === 'spine');
    for (let i = 0; i < spineNodes.length; i+=2) {
      if (i+1 < spineNodes.length) {
        mockTopology.links.push({
          source: spineNodes[i].id,
          target: spineNodes[i+1].id,
          ber: '1e-11'
        });
      }
    }

    // 随机添加一些模块之间的连接
    const moduleNodes = mockTopology.nodes.filter(node => node.type === 'module');
    const moduleConnections = Math.min(10, moduleNodes.length / 3);
    for (let i = 0; i < moduleConnections; i++) {
      const mod1Index = Math.floor(Math.random() * moduleNodes.length);
      let mod2Index = Math.floor(Math.random() * moduleNodes.length);
      
      // 确保不会自己连接自己
      while (mod2Index === mod1Index) {
        mod2Index = Math.floor(Math.random() * moduleNodes.length);
      }
      
      mockTopology.links.push({
        source: moduleNodes[mod1Index].id,
        target: moduleNodes[mod2Index].id,
        ber: '1e-10'
      });
    }

    console.log(`层次化拓扑数据创建完成: ${mockTopology.nodes.length} 个节点, ${mockTopology.links.length} 个连接`);
  } catch (error) {
    console.error("创建拓扑数据时出错:", error);
  }

  return mockTopology;
}

// Mock data for demonstration
export const MOCK_DATA = {
  healthScore: 85,
  criticalModules: 3,
  totalModules: 200, // 更新为实际数量
  recentAlerts: [
    { id: 1, message: '模块 MOD-001 温度过高', severity: 'high', timestamp: new Date().toISOString() },
    { id: 2, message: '模块 MOD-002 光功率异常', severity: 'medium', timestamp: new Date().toISOString() },
  ],
  topology: createMockTopology(),
  lifePrediction: {
    modules: [
      {
        id: 'MOD-001',
        predictions: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          remainingDays: Math.max(0, 365 - i * 28 + Math.random() * 10)
        }))
      },
      {
        id: 'MOD-002',
        predictions: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          remainingDays: Math.max(0, 280 - i * 22 + Math.random() * 10)
        }))
      }
    ],
    warningModules: [
      { id: 'MOD-001', prediction: '30天', temp: '75°C', status: 'warning' },
      { id: 'MOD-003', prediction: '15天', temp: '80°C', status: 'danger' }
    ],
    statistics: {
      averageLifespan: '4.5年',
      replacementRate: '2.3%',
      previousMonthLifespan: '4.3年',
      previousMonthRate: '2.8%'
    }
  }
};