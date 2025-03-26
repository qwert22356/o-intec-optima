// 简化版的toast工具，仅提供基本功能
import { useState } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast({ title, description, variant = "default" }: ToastProps) {
  console.log(`Toast (${variant}): ${title} - ${description}`);
  // 实际项目中这里应该触发toast组件的显示
  // 简化版只在控制台输出
}

// 简单实现，满足类型要求
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      // 简单实现，无实际功能
      setToasts((prevToasts) => prevToasts.filter((_, i) => i.toString() !== toastId));
    },
  };
} 