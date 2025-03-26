import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Settings,
  PieChart,
  Activity,
  AlertTriangle,
  Database,
  LineChart,
  Home
} from "lucide-react";

interface Route {
  label: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const location = useLocation();

  const routes: Route[] = [
    {
      label: "主页",
      icon: <Home className="mr-2 h-4 w-4" />,
      href: "/",
      color: "text-sky-500",
    },
    {
      label: "数据统计",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      href: "/statistics",
      color: "text-violet-500",
    },
    {
      label: "预测分析",
      icon: <LineChart className="mr-2 h-4 w-4" />,
      href: "/predictive",
      color: "text-pink-700",
    },
    {
      label: "告警管理",
      icon: <AlertTriangle className="mr-2 h-4 w-4" />,
      href: "/alerts",
      color: "text-orange-700",
    },
    {
      label: "数据管理",
      icon: <Database className="mr-2 h-4 w-4" />,
      href: "/data",
      color: "text-emerald-500",
    },
    {
      label: "系统设置",
      icon: <Settings className="mr-2 h-4 w-4" />,
      href: "/settings",
      color: "text-gray-700",
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          to={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.href === location.pathname
              ? `${route.color} border-b-2 border-current pb-1`
              : "text-muted-foreground"
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </nav>
  );
} 