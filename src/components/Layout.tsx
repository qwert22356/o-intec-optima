import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, MessageSquare, LineChart, CreditCard, Menu, Cpu, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: '仪表盘', to: '/', icon: LayoutDashboard },
  { name: '拓扑视图', to: '/topology', icon: Network },
  { name: '光模块监控', to: '/modules', icon: Cpu },
  { name: '预测分析', to: '/predictive', icon: Activity },
  { name: 'LLM控制台', to: '/llm', icon: MessageSquare },
  { name: '数据统计', to: '/analytics', icon: LineChart },
  { name: 'MaaS计费', to: '/billing', icon: CreditCard },
];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0",
        !isSidebarOpen && '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">OptiSmart MVP</h1>
        </div>
        <nav className="mt-4 px-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg hover:bg-gray-50',
                isActive && 'bg-blue-50 text-blue-600'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center px-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-xl font-bold text-gray-900">OptiSmart MVP</h1>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        "md:ml-64 pt-16 md:pt-0"
      )}>
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}