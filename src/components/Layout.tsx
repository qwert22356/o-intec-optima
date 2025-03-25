import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Server, BarChart2, MessageSquare, Database } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navigation = [
    { name: '仪表盘', href: '/', icon: Home },
    { name: '光模块监控', href: '/module-monitor', icon: Server },
    { name: '预测分析', href: '/predictive', icon: BarChart2 },
    { name: '数据统计', href: '/analytics', icon: Database },
    { name: 'LLM控制台', href: '/llm-console', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-lg">O-intecOptima</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}