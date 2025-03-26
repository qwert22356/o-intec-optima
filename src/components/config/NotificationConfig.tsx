import React from 'react'
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export function NotificationConfig() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>告警推送方式</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "email", label: "邮件" },
            { id: "webhook", label: "Webhook" },
            { id: "slack", label: "Slack" },
            { id: "teams", label: "Teams" }
          ].map((method) => (
            <div key={method.id} className="flex items-center space-x-2">
              <Checkbox id={method.id} />
              <Label htmlFor={method.id}>{method.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-enabled">邮件通知</Label>
          <Switch id="email-enabled" defaultChecked />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email-recipients">收件人列表</Label>
            <Input 
              id="email-recipients" 
              placeholder="admin@example.com, tech@example.com" 
            />
            <p className="text-sm text-muted-foreground">
              多个邮箱地址请用逗号分隔
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-template">邮件模板</Label>
            <Textarea 
              id="email-template" 
              className="min-h-[200px]"
              placeholder={`告警主题: [${"{severity}"} 告警] ${"{device_name}"} - ${"{alert_type}"}

告警详情:
- 设备: ${"{device_name}"}
- 位置: ${"{location}"}
- 时间: ${"{timestamp}"}
- 类型: ${"{alert_type}"}
- 级别: ${"{severity}"}
- 描述: ${"{description}"}

当前值: ${"{current_value}"} ${"{unit}"}
阈值: ${"{threshold}"} ${"{unit}"}

请及时处理！`}
            />
            <p className="text-sm text-muted-foreground">
              支持变量: {"{severity}"}, {"{device_name}"}, {"{alert_type}"}, {"{timestamp}"}, {"{description}"}, {"{current_value}"}, {"{threshold}"}, {"{unit}"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="webhook-enabled">Webhook 通知</Label>
          <Switch id="webhook-enabled" />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input 
              id="webhook-url" 
              placeholder="https://api.example.com/webhook" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="webhook-template">JSON Payload 模板</Label>
            <Textarea 
              id="webhook-template" 
              className="min-h-[150px]" 
              placeholder={`{
  "alert": {
    "device": "${"{device_name}"}",
    "type": "${"{alert_type}"}",
    "severity": "${"{severity}"}",
    "timestamp": "${"{timestamp}"}",
    "value": "${"{current_value}"}",
    "threshold": "${"{threshold}"}",
    "description": "${"{description}"}"
  }
}`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="slack-enabled">Slack 通知</Label>
          <Switch id="slack-enabled" />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="slack-webhook">Webhook URL</Label>
            <Input 
              id="slack-webhook" 
              placeholder="https://hooks.slack.com/services/..." 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slack-channel">Channel</Label>
            <Input 
              id="slack-channel" 
              placeholder="#alerts" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="teams-enabled">Teams 通知</Label>
          <Switch id="teams-enabled" />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="teams-webhook">Webhook URL</Label>
            <Input 
              id="teams-webhook" 
              placeholder="https://outlook.office.com/webhook/..." 
            />
          </div>
        </div>
      </div>
    </div>
  )
} 