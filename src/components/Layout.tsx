import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LucideIcon, Home, Router, Activity, BarChart2, MessageSquareText, Settings, Network } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export default function Layout() {
  const { pathname } = useLocation();

  const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
    const isActive = pathname === to || pathname === `/${to}`;
    
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `
          inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium
          ${isActive 
            ? 'border-blue-500 text-gray-900' 
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }
        `}
      >
        <Icon size={16} className="mr-1" />
        <span>{label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-2" />
                <span className="text-lg font-semibold text-gray-900">O-Intec Optima</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <NavItem to="/" icon={Home} label="仪表盘" />
                <NavItem to="/module-monitor" icon={Router} label="光模块监控" />
                <NavItem to="/module-predictive" icon={Activity} label="预测分析" />
                <NavItem to="/analytics" icon={BarChart2} label="数据统计" />
                <NavItem to="/llm-console" icon={MessageSquareText} label="LLM控制台" />
                <NavItem to="/device-connections" icon={Network} label="设备连接" />
                <NavItem to="/configuration" icon={Settings} label="配置管理" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  A
                </div>
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-medium text-gray-700">Admin User</div>
                  <div className="text-xs text-gray-500">admin@example.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}