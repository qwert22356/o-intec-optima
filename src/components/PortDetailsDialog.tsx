import React from 'react';
import type { Port } from './SwitchPanel';
import { formatBytes } from '../lib/utils';
import { X, ArrowDown, ArrowUp, Info, Server, MapPin, Zap, Battery } from 'lucide-react';

interface PortDetailsDialogProps {
  port: Port;
  onClose: () => void;
  selectedDevice?: { name: string };
}

const PortDetailsDialog: React.FC<PortDetailsDialogProps> = ({ port, onClose, selectedDevice }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
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
          
          {/* 光模块信息区域 */}
          {port.moduleInfo && (
            <>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  光模块信息
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-gray-600">厂商</span>
                    <span className="font-medium text-blue-700">{port.moduleInfo.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">序列号</span>
                    <span className="font-medium">{port.moduleInfo.serialNumber}</span>
                  </div>
                  {port.moduleInfo.partNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">零件号</span>
                      <span className="font-medium">{port.moduleInfo.partNumber}</span>
                    </div>
                  )}
                  {port.moduleInfo.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">温度</span>
                      <span className={`font-medium ${
                        parseFloat(port.moduleInfo.temperature) > 70 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {port.moduleInfo.temperature}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 光模块功率和电气参数区域 */}
              <div className="mt-4 pt-2">
                <h4 className="font-medium mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  参数指标
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-green-50 p-3 rounded-md">
                  {port.moduleInfo.voltage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">电压</span>
                      <span className="font-medium">{port.moduleInfo.voltage}</span>
                    </div>
                  )}
                  {port.moduleInfo.current && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">电流</span>
                      <span className="font-medium">{port.moduleInfo.current}</span>
                    </div>
                  )}
                  {port.moduleInfo.rxPower && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">接收功率</span>
                      <span className={`font-medium ${
                        parseFloat(port.moduleInfo.rxPower) < -10 ? 'text-amber-600' : 'text-gray-700'
                      }`}>
                        {port.moduleInfo.rxPower}
                      </span>
                    </div>
                  )}
                  {port.moduleInfo.txPower && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">发送功率</span>
                      <span className={`font-medium ${
                        parseFloat(port.moduleInfo.txPower) < -8 ? 'text-amber-600' : 'text-gray-700'
                      }`}>
                        {port.moduleInfo.txPower}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 位置信息区域 */}
              {port.moduleInfo.location && (
                <div className="mt-4 pt-2">
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    位置信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-purple-50 p-3 rounded-md">
                    {port.moduleInfo.location.device && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">设备</span>
                        <span className="font-medium">{port.moduleInfo.location.device}</span>
                      </div>
                    )}
                    {port.moduleInfo.location.rack && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">机架</span>
                        <span className="font-medium">{port.moduleInfo.location.rack}</span>
                      </div>
                    )}
                    {port.moduleInfo.location.room && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">机房</span>
                        <span className="font-medium">{port.moduleInfo.location.room}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">交换机</span>
                      <span className="font-medium">{selectedDevice?.name || "核心交换机"}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              错误统计
            </h4>
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