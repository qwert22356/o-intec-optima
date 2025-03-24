import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Server } from 'lucide-react';
import { MOCK_DATA } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
    <div className="flex items-center">
      <div className="p-2 rounded-lg bg-blue-50">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="健康评分"
          value={`${MOCK_DATA.healthScore}%`}
          icon={Activity}
        />
        <StatCard
          title="在线模块"
          value={MOCK_DATA.totalModules}
          icon={Server}
        />
        <StatCard
          title="正常运行"
          value={`${MOCK_DATA.totalModules - MOCK_DATA.criticalModules}`}
          icon={CheckCircle}
        />
        <StatCard
          title="告警模块"
          value={MOCK_DATA.criticalModules}
          icon={AlertTriangle}
          className="bg-red-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近告警</h2>
        <div className="space-y-4">
          {MOCK_DATA.recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <AlertTriangle className={`w-5 h-5 ${
                alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
              }`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}