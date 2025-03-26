import React from 'react'
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export function DatabaseConfig() {
  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="db-type">存储类型选择</Label>
        <Select defaultValue="sqlite">
          <SelectTrigger>
            <SelectValue placeholder="选择数据库类型" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="sqlite">SQLite</SelectItem>
            <SelectItem value="influxdb">InfluxDB</SelectItem>
            <SelectItem value="timescaledb">TimescaleDB</SelectItem>
            <SelectItem value="parquet">Parquet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="db-connection">数据库连接地址</Label>
        <Input 
          id="db-connection" 
          placeholder="postgresql://user:pass@host/db" 
        />
        <p className="text-sm text-muted-foreground">
          对于SQLite，可以留空使用默认本地文件
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="retention-days">数据存储保留天数</Label>
        <Input 
          id="retention-days" 
          type="number" 
          placeholder="30" 
          min="1" 
          max="365"
        />
        <p className="text-sm text-muted-foreground">
          超过设定天数的历史数据将被自动清理
        </p>
      </div>
    </div>
  )
} 