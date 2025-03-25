import React from 'react';
import type { Port } from './SwitchPanel';
import { formatBytes } from '../lib/utils';
import { X, ArrowDown, ArrowUp } from 'lucide-react';

interface PortDetailsDialogProps {
  port: Port;
  onClose: () => void;
}

const PortDetailsDialog: React.FC<PortDetailsDialogProps> = ({ port, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">端口详情 - {port.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">状态</span>
                <span className={port.status === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {port.status === 'up' ? '正常' : '异常'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">速率</span>
                <span>{port.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MTU</span>
                <span>{port.mtu}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">接收字节</span>
                <div className="flex items-center">
                  <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                  <span>{formatBytes(port.stats.rxBytes)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">发送字节</span>
                <div className="flex items-center">
                  <ArrowUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span>{formatBytes(port.stats.txBytes)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">丢包数量</span>
                <span className={port.stats.drops > 0 ? 'text-red-600' : ''}>
                  {port.stats.drops}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">错误统计</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">CRC错误</span>
                <span className={port.stats.crcErrors > 0 ? 'text-red-600' : ''}>
                  {port.stats.crcErrors}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">帧错误</span>
                <span className={port.stats.frameErrors > 0 ? 'text-red-600' : ''}>
                  {port.stats.frameErrors}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">抖动次数</span>
                <span className={port.stats.flopCount > 0 ? 'text-red-600' : ''}>
                  {port.stats.flopCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortDetailsDialog; 