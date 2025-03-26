import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"

export function DataCollectionConfig() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="snmp">
        <AccordionTrigger>SNMP 配置</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-snmp">启用 SNMP 采集</Label>
              <Switch id="enable-snmp" />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="snmp-devices">设备地址 (IP)</Label>
                <Input id="snmp-devices" placeholder="192.168.1.1,192.168.1.2" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="snmp-version">SNMP 版本</Label>
                <Select defaultValue="v2c">
                  <SelectTrigger>
                    <SelectValue placeholder="选择SNMP版本" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="v1">v1</SelectItem>
                    <SelectItem value="v2c">v2c</SelectItem>
                    <SelectItem value="v3">v3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="community">Community (团体名)</Label>
                <Input id="community" placeholder="public" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="snmp-interval">采集频率</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue placeholder="选择采集频率" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">1分钟</SelectItem>
                    <SelectItem value="5">5分钟</SelectItem>
                    <SelectItem value="15">15分钟</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="oid-list">要采集的 OID 列表</Label>
                <Textarea 
                  id="oid-list" 
                  placeholder="ifOperStatus&#10;ifLastChange&#10;ifInErrors" 
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="grpc">
        <AccordionTrigger>gRPC (gNMI) 配置</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-grpc">启用 gRPC 采集</Label>
              <Switch id="enable-grpc" />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grpc-devices">目标设备地址 (IP)</Label>
                <Input id="grpc-devices" placeholder="10.10.10.1,10.10.10.2" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="grpc-port">端口号</Label>
                <Input id="grpc-port" type="number" placeholder="57400" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="grpc-interval">采集频率</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="选择采集频率" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="10">10秒</SelectItem>
                    <SelectItem value="30">30秒</SelectItem>
                    <SelectItem value="60">1分钟</SelectItem>
                    <SelectItem value="300">5分钟</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gnmi-paths">订阅内容 (gNMI配置)</Label>
                <Textarea 
                  id="gnmi-paths" 
                  placeholder={`{
  "subscription": [
    {
      "path": "/interfaces/interface[name=Ethernet0]/state/counters",
      "mode": "SAMPLE",
      "sample_interval": 10000000000  // 10s in nanoseconds
    }
  ],
  "mode": "STREAM"
}`}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  使用JSON格式定义订阅路径和采样间隔，仅支持STREAM模式
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="syslog">
        <AccordionTrigger>Syslog 配置</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-syslog">启用 Syslog 接收</Label>
              <Switch id="enable-syslog" />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="syslog-port">接收端口</Label>
                <Input id="syslog-port" type="number" placeholder="514" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="log-level">过滤级别</Label>
                <Select defaultValue="warning">
                  <SelectTrigger>
                    <SelectValue placeholder="选择日志级别" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="debug">debug</SelectItem>
                    <SelectItem value="info">info</SelectItem>
                    <SelectItem value="warning">warning</SelectItem>
                    <SelectItem value="error">error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ip-whitelist">来源 IP 白名单</Label>
                <Input id="ip-whitelist" placeholder="10.10.1.1,10.10.1.2" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="save-raw-logs">保存原始日志</Label>
                <Switch id="save-raw-logs" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cleanup-policy">自动清理策略</Label>
                <Select defaultValue="7">
                  <SelectTrigger>
                    <SelectValue placeholder="选择保留时间" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">保留1天</SelectItem>
                    <SelectItem value="7">保留7天</SelectItem>
                    <SelectItem value="30">保留30天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
} 