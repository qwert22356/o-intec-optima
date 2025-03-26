import React from 'react'
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export function ModelConfig() {
  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="trend-model">趋势预测模型</Label>
        <Select defaultValue="arima">
          <SelectTrigger>
            <SelectValue placeholder="选择预测模型" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="arima">ARIMA</SelectItem>
            <SelectItem value="prophet">Prophet</SelectItem>
            <SelectItem value="disabled">不启用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="anomaly-model">异常检测模型</Label>
        <Select defaultValue="isolation-forest">
          <SelectTrigger>
            <SelectValue placeholder="选择检测模型" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="isolation-forest">Isolation Forest</SelectItem>
            <SelectItem value="moving-window">滑动窗口</SelectItem>
            <SelectItem value="disabled">不启用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="model-frequency">模型运行频率</Label>
        <Select defaultValue="hourly">
          <SelectTrigger>
            <SelectValue placeholder="选择运行频率" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="minute">每分钟</SelectItem>
            <SelectItem value="hourly">每小时</SelectItem>
            <SelectItem value="daily">每天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="health-score">模块健康打分</Label>
          <p className="text-sm text-muted-foreground">
            启用后将根据各项指标综合评估模块健康状况
          </p>
        </div>
        <Switch id="health-score" defaultChecked />
      </div>
    </div>
  )
} 