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
          flex items-center px-3 py-2 mb-1 rounded-md
          ${isActive 
            ? 'bg-blue-50 text-blue-700 font-medium' 
            : 'text-gray-600 hover:bg-gray-100'
          }
        `}
      >
        <Icon size={18} className={`mr-2 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
        <span>{label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="text-lg font-semibold text-gray-900">O-Intec Optima</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <NavItem to="/" icon={Home} label="仪表盘" />
          <NavItem to="/module-monitor" icon={Router} label="光模块监控" />
          <NavItem to="/module-predictive" icon={Activity} label="预测分析" />
          <NavItem to="/analytics" icon={BarChart2} label="数据统计" />
          <NavItem to="/llm-console" icon={MessageSquareText} label="LLM控制台" />
          <NavItem to="/device-connections" icon={Network} label="设备连接" />
          <NavItem to="/configuration" icon={Settings} label="配置管理" />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              A
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-700">Admin User</div>
              <div className="text-xs text-gray-500">admin@example.com</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}