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
  totalModules: 200,
  recentAlerts: [
    { id: 1, message: '模块 MOD-001 温度过高', severity: 'high', timestamp: new Date().toISOString() },
    { id: 2, message: '模块 MOD-002 光功率异常', severity: 'medium', timestamp: new Date().toISOString() },
  ],
  topology: createMockTopology(),
  // 仪表盘数据
  devices: [
    { id: 'dev1', name: 'Switch-01', type: 'Spine', interfaces: 48, status: 'active' },
    { id: 'dev2', name: 'Switch-02', type: 'Leaf', interfaces: 32, status: 'active' },
    { id: 'dev3', name: 'Switch-03', type: 'Border', interfaces: 24, status: 'warning' }
  ],
  // 光模块监控数据
  modules: Array.from({ length: 20 }, (_, i) => ({
    id: `MOD-${(i + 1).toString().padStart(3, '0')}`,
    name: `光模块-${i + 1}`,
    health: Math.floor(Math.random() * 100),
    temperature: (Math.random() * 30 + 40).toFixed(1),
    rxPower: (-Math.random() * 5 - 5).toFixed(2),
    txPower: (-Math.random() * 3 - 3).toFixed(2),
    voltage: (3.2 + Math.random() * 0.3).toFixed(2),
    current: (Math.random() * 50 + 20).toFixed(1),
    portIndex: i + 1,
    device: {
      id: `dev${Math.floor(i/8) + 1}`,
      name: `Switch-${Math.floor(i/8) + 1}`,
      type: ['Spine', 'Leaf', 'Border'][Math.floor(i/8)],
      ip: `192.168.1.${Math.floor(i/8) + 1}`
    },
    rack: {
      id: `rack${Math.floor(i/4) + 1}`,
      name: `机架-${Math.floor(i/4) + 1}`
    },
    room: {
      id: `room${Math.floor(i/10) + 1}`,
      name: `机房-${Math.floor(i/10) + 1}`
    },
    dataCenter: {
      id: 'dc1',
      name: '北京数据中心'
    },
    lastUpdated: new Date(Date.now() - Math.random() * 86400000).toISOString()
  })),
  // 预测分析数据
  lifePrediction: {
    modules: [
      {
        id: "Module-A",
        predictions: [
          { date: "2024-03-01", remainingDays: 365 },
          { date: "2024-03-15", remainingDays: 350 },
          { date: "2024-04-01", remainingDays: 335 },
          { date: "2024-04-15", remainingDays: 320 },
          { date: "2024-05-01", remainingDays: 305 },
        ]
      },
      {
        id: "Module-B",
        predictions: [
          { date: "2024-03-01", remainingDays: 280 },
          { date: "2024-03-15", remainingDays: 265 },
          { date: "2024-04-01", remainingDays: 250 },
          { date: "2024-04-15", remainingDays: 235 },
          { date: "2024-05-01", remainingDays: 220 },
        ]
      }
    ],
    warningModules: [
      { id: "Module-C", prediction: "180天", temp: "75°C", status: "warning" },
      { id: "Module-D", prediction: "90天", temp: "85°C", status: "danger" },
      { id: "Module-E", prediction: "150天", temp: "78°C", status: "warning" }
    ],
    statistics: {
      averageLifespan: "3.2年",
      replacementRate: "2.8%"
    }
  },
  // 数据统计
  statistics: {
    errorRates: {
      daily: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
      weekly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 500)),
      monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 2000))
    },
    performance: {
      uptime: "99.98%",
      avgResponseTime: "2.3ms",
      throughput: "45.6Gbps"
    }
  }
};

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}