import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Network, AlertCircle, Clock, RefreshCw } from "lucide-react"

// 设备连接状态类型
type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

// 设备协议类型
type Protocol = 'SNMP' | 'gRPC' | 'Syslog'

// 设备接口
interface Device {
  id: string
  ip: string
  protocol: Protocol
  status: ConnectionStatus
  lastSeen: string
  precision: string
  uptime: string
  errorCount: number
  packets: number
}

export default function DeviceConnections() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')

  // 模拟获取设备数据
  useEffect(() => {
    // 这里应该从后端API获取数据
    // 这里使用模拟数据演示
    const mockDevices: Device[] = [
      {
        id: '1',
        ip: '192.168.1.101',
        protocol: 'SNMP',
        status: 'connected',
        lastSeen: '2025-03-31 12:45:22',
        precision: '5分钟',
        uptime: '5天12小时',
        errorCount: 0,
        packets: 1234
      },
      {
        id: '2',
        ip: '192.168.1.102',
        protocol: 'SNMP',
        status: 'connected',
        lastSeen: '2025-03-31 12:44:15',
        precision: '1分钟',
        uptime: '3天8小时',
        errorCount: 2,
        packets: 5678
      },
      {
        id: '3',
        ip: '10.10.10.25',
        protocol: 'gRPC',
        status: 'connected',
        lastSeen: '2025-03-31 12:45:00',
        precision: '30秒',
        uptime: '7天3小时',
        errorCount: 0,
        packets: 9876
      },
      {
        id: '4',
        ip: '10.10.10.26',
        protocol: 'gRPC',
        status: 'error',
        lastSeen: '2025-03-31 12:30:45',
        precision: '30秒',
        uptime: '0天2小时',
        errorCount: 5,
        packets: 345
      },
      {
        id: '5',
        ip: '172.16.0.10',
        protocol: 'Syslog',
        status: 'connected',
        lastSeen: '2025-03-31 12:44:55',
        precision: '实时',
        uptime: '10天5小时',
        errorCount: 0,
        packets: 2345
      },
      {
        id: '6',
        ip: '172.16.0.11',
        protocol: 'Syslog',
        status: 'disconnected',
        lastSeen: '2025-03-31 11:20:10',
        precision: '实时',
        uptime: '0天0小时',
        errorCount: 1,
        packets: 120
      }
    ]
    
    setDevices(mockDevices)
  }, [])

  // 刷新设备列表
  const handleRefresh = () => {
    setIsLoading(true)
    
    // 模拟API请求延迟
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  // 根据协议过滤设备
  const filteredDevices = activeTab === 'all' 
    ? devices
    : devices.filter(device => device.protocol.toLowerCase() === activeTab)

  // 获取状态标签的颜色
  const getStatusColor = (status: ConnectionStatus) => {
    switch(status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-gray-500'
      case 'connecting': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Network className="h-6 w-6 text-blue-500 mr-2" />
          <h1 className="text-2xl font-semibold">设备连接管理</h1>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              刷新中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新状态
            </>
          )}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>设备连接概览</CardTitle>
          <CardDescription>
            显示所有通过SNMP、gRPC和Syslog连接的设备状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-500 mb-1">总设备数</div>
              <div className="text-2xl font-semibold">{devices.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-gray-500 mb-1">已连接</div>
              <div className="text-2xl font-semibold">{devices.filter(d => d.status === 'connected').length}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="text-sm text-gray-500 mb-1">错误/断连</div>
              <div className="text-2xl font-semibold">{devices.filter(d => d.status === 'error' || d.status === 'disconnected').length}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">数据包/分钟</div>
              <div className="text-2xl font-semibold">{devices.reduce((sum, device) => sum + device.packets, 0)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
          <TabsTrigger 
            value="all" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            全部设备
          </TabsTrigger>
          <TabsTrigger 
            value="snmp" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            SNMP设备
          </TabsTrigger>
          <TabsTrigger 
            value="grpc" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            gRPC设备
          </TabsTrigger>
          <TabsTrigger 
            value="syslog" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            Syslog设备
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">IP地址</th>
                    <th className="p-4 font-medium text-gray-500">协议</th>
                    <th className="p-4 font-medium text-gray-500">状态</th>
                    <th className="p-4 font-medium text-gray-500">采集精度</th>
                    <th className="p-4 font-medium text-gray-500">运行时间</th>
                    <th className="p-4 font-medium text-gray-500">最后可见</th>
                    <th className="p-4 font-medium text-gray-500">错误数</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDevices.map(device => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{device.ip}</td>
                      <td className="p-4">
                        {device.protocol}
                      </td>
                      <td className="p-4">
                        <Badge 
                          className={`${getStatusColor(device.status)} text-white`}
                        >
                          {device.status === 'connected' && '已连接'}
                          {device.status === 'disconnected' && '已断开'}
                          {device.status === 'connecting' && '连接中'}
                          {device.status === 'error' && '错误'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {device.precision}
                        </div>
                      </td>
                      <td className="p-4">{device.uptime}</td>
                      <td className="p-4 text-gray-500">{device.lastSeen}</td>
                      <td className="p-4">
                        {device.errorCount > 0 ? (
                          <div className="flex items-center text-red-500">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {device.errorCount}
                          </div>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredDevices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-500">
                        未找到符合条件的设备
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 