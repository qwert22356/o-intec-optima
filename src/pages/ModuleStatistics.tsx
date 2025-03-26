import React, { useState, useEffect } from 'react';
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';

export default function ModuleStatistics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [moduleData, setModuleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setModuleData([
        // ... 模拟数据
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Container>
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">数据统计</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="border-b">
                <div className="space-x-4">
                  <button
                    className={`px-4 py-3 font-medium ${
                      activeTab === 'overview' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    总览
                  </button>
                  <button
                    className={`px-4 py-3 font-medium ${
                      activeTab === 'details' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    详细数据
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2 items-center">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索模块..."
                        className="px-3 py-2 border border-gray-300 rounded-md pr-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                    </div>
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-md"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="24h">最近24小时</option>
                      <option value="7d">最近7天</option>
                      <option value="30d">最近30天</option>
                      <option value="custom">自定义</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div>
                    {/* 根据activeTab显示不同的内容 */}
                    {activeTab === 'overview' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-4">温度分布</h3>
                          {/* 温度分布图表 */}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-4">功率分布</h3>
                          {/* 功率分布图表 */}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-4">电压分布</h3>
                          {/* 电压分布图表 */}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-4">电流分布</h3>
                          {/* 电流分布图表 */}
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                模块名称
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                位置
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                温度
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                功率
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                电压
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                电流
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {/* 模块数据行 */}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>数据概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">总模块数</span>
                    <span className="text-xl font-bold">128</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">在线模块</span>
                    <span className="text-xl font-bold text-green-600">120</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">离线模块</span>
                    <span className="text-xl font-bold text-red-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>告警统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">温度告警</span>
                    <span className="text-xl font-bold text-yellow-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">功率告警</span>
                    <span className="text-xl font-bold text-yellow-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">电压告警</span>
                    <span className="text-xl font-bold text-yellow-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
} 