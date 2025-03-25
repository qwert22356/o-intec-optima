import React from 'react';
import { cn } from '@/lib/utils';

export interface Port {
  id: string;
  name: string;
  status: 'up' | 'error' | 'down';
  moduleInserted: boolean;
  speed: string;
  mtu: number;
  stats: {
    rxBytes: number;
    txBytes: number;
    drops: number;
    crcErrors: number;
    frameErrors: number;
    flopCount: number;
  };
}

interface SwitchPanelProps {
  ports: Port[];
  onPortClick: (port: Port) => void;
}

const SwitchPanel: React.FC<SwitchPanelProps> = ({ ports, onPortClick }) => {
  // 将端口分成两行，每行24个端口
  const topPorts = ports.slice(0, 24);
  const bottomPorts = ports.slice(24, 48);

  const getPortColor = (port: Port) => {
    if (!port.moduleInserted) return 'bg-gray-300'; // 未插入模块
    if (port.status === 'error') return 'bg-red-500'; // 错误状态
    if (port.status === 'up') return 'bg-green-500'; // 正常状态
    return 'bg-gray-500'; // 已插入但未启用
  };

  const renderPort = (port: Port) => (
    <button
      key={port.id}
      onClick={() => port.moduleInserted && onPortClick(port)}
      className={cn(
        "w-8 h-8 rounded-sm m-1 transition-colors",
        getPortColor(port),
        port.moduleInserted && "hover:opacity-80 cursor-pointer",
        !port.moduleInserted && "cursor-default"
      )}
      title={port.moduleInserted ? `${port.name} - 点击查看详情` : `${port.name} - 未插入模块`}
    />
  );

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-center mb-2">
          <div className="text-white text-sm mb-2">1-24</div>
        </div>
        <div className="flex flex-wrap justify-center mb-4">
          {topPorts.map(renderPort)}
        </div>
        <div className="flex justify-center mb-2">
          <div className="text-white text-sm mb-2">25-48</div>
        </div>
        <div className="flex flex-wrap justify-center">
          {bottomPorts.map(renderPort)}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-sm mr-2" />
          <span>正常</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-sm mr-2" />
          <span>异常</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded-sm mr-2" />
          <span>未插入</span>
        </div>
      </div>
    </div>
  );
};

export default SwitchPanel; 