import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export function AlertConfig() {
  return (
    <Accordion type="multiple" className="w-full space-y-4">
      <AccordionItem value="environment">
        <AccordionTrigger>🌡️ 运行环境类</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="temp-alert">温度告警</Label>
                <Switch id="temp-alert" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="temp-threshold">温度阈值 (℃)</Label>
                <Input id="temp-threshold" type="number" placeholder="75" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="temp-duration">持续时间 (分钟)</Label>
                <Input id="temp-duration" type="number" placeholder="5" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="temp-level">告警级别</Label>
                <Select defaultValue="warning">
                  <SelectTrigger>
                    <SelectValue placeholder="选择告警级别" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="warning">warning</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="power">
        <AccordionTrigger>⚡ 电源类</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="voltage-alert">电压告警</Label>
                <Switch id="voltage-alert" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="voltage-upper">上限 (V)</Label>
                  <Input id="voltage-upper" type="number" placeholder="3.6" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="voltage-lower">下限 (V)</Label>
                  <Input id="voltage-lower" type="number" placeholder="3.0" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="voltage-duration">持续时间 (分钟)</Label>
                <Input id="voltage-duration" type="number" placeholder="1" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="voltage-level">告警级别</Label>
                <Select defaultValue="critical">
                  <SelectTrigger>
                    <SelectValue placeholder="选择告警级别" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="warning">warning</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="current-alert">电流告警</Label>
                <Switch id="current-alert" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-upper">上限 (mA)</Label>
                  <Input id="current-upper" type="number" placeholder="50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="current-lower">下限 (mA)</Label>
                  <Input id="current-lower" type="number" placeholder="5" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current-duration">持续时间 (分钟)</Label>
                <Input id="current-duration" type="number" placeholder="1" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current-level">告警级别</Label>
                <Select defaultValue="critical">
                  <SelectTrigger>
                    <SelectValue placeholder="选择告警级别" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="warning">warning</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="optical">
        <AccordionTrigger>🔦 光功率类</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="rx-power-alert">Rx 光功率告警</Label>
                <Switch id="rx-power-alert" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="rx-power-threshold">下限 (dBm)</Label>
                <Input id="rx-power-threshold" type="number" placeholder="-20" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rx-power-duration">持续时间 (分钟)</Label>
                <Input id="rx-power-duration" type="number" placeholder="1" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rx-power-level">告警级别</Label>
                <Select defaultValue="warning">
                  <SelectTrigger>
                    <SelectValue placeholder="选择告警级别" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="warning">warning</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="tx-power-alert">Tx 光功率告警</Label>
                <Switch id="tx-power-alert" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tx-power-threshold">下限 (dBm)</Label>
                <Input id="tx-power-threshold" type="number" placeholder="-8" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tx-power-duration">持续时间 (分钟)</Label>
                <Input id="tx-power-duration" type="number" placeholder="1" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tx-power-level">告警级别</Label>
                <Select defaultValue="warning">
                  <SelectTrigger>
                    <SelectValue placeholder="选择告警级别" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="warning">warning</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="errors">
        <AccordionTrigger>🚨 错误类</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {["CRC 错误", "FCS 错误", "Rx 丢包"].map((errorType) => (
              <div key={errorType} className="grid gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${errorType}-alert`}>{errorType}告警</Label>
                  <Switch id={`${errorType}-alert`} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor={`${errorType}-threshold`}>阈值 (次/分钟)</Label>
                  <Input id={`${errorType}-threshold`} type="number" placeholder="100" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${errorType}-level`}>告警级别</Label>
                  <Select defaultValue="warning">
                    <SelectTrigger>
                      <SelectValue placeholder="选择告警级别" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="warning">warning</SelectItem>
                      <SelectItem value="critical">critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="behavior">
        <AccordionTrigger>🔁 行为类</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {[
              { name: "Flap 次数", unit: "次/小时" },
              { name: "持续 down 时间", unit: "分钟" },
              { name: "插拔次数", unit: "次/天" }
            ].map((item) => (
              <div key={item.name} className="grid gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${item.name}-alert`}>{item.name}告警</Label>
                  <Switch id={`${item.name}-alert`} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor={`${item.name}-threshold`}>阈值 ({item.unit})</Label>
                  <Input id={`${item.name}-threshold`} type="number" placeholder="5" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${item.name}-level`}>告警级别</Label>
                  <Select defaultValue="warning">
                    <SelectTrigger>
                      <SelectValue placeholder="选择告警级别" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="warning">warning</SelectItem>
                      <SelectItem value="critical">critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
} 