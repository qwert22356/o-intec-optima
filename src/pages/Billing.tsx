import React from 'react';
import { DollarSign, Clock, ArrowUpRight, Download } from 'lucide-react';

export default function Billing() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">本月费用</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">¥12,458</span>
            <span className="ml-2 text-sm text-green-600 flex items-center">
              <ArrowUpRight className="w-4 h-4" />
              8.2%
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">较上月增长</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">使用时长</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">2,845</span>
            <span className="ml-2 text-sm text-gray-500">小时</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">128个模块总计</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">平均成本</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">¥4.38</span>
            <span className="ml-2 text-sm text-gray-500">/小时</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">每模块计费</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">费用明细</h2>
            <p className="text-sm text-gray-500">按模块类型统计</p>
          </div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-sm font-medium text-gray-500">模块类型</th>
                <th className="pb-3 text-sm font-medium text-gray-500">数量</th>
                <th className="pb-3 text-sm font-medium text-gray-500">使用时长</th>
                <th className="pb-3 text-sm font-medium text-gray-500">单价</th>
                <th className="pb-3 text-sm font-medium text-gray-500">总计</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { type: '100G QSFP28', count: 64, hours: 1500, price: 5.2, total: 7800 },
                { type: '400G QSFP-DD', count: 32, hours: 800, price: 8.5, total: 6800 },
                { type: '40G QSFP+', count: 32, hours: 545, price: 3.8, total: 2071 },
              ].map((item) => (
                <tr key={item.type}>
                  <td className="py-4 text-sm text-gray-900">{item.type}</td>
                  <td className="py-4 text-sm text-gray-500">{item.count}</td>
                  <td className="py-4 text-sm text-gray-500">{item.hours}h</td>
                  <td className="py-4 text-sm text-gray-500">¥{item.price}/h</td>
                  <td className="py-4 text-sm font-medium text-gray-900">¥{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}