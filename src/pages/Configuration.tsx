import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { toast } from "../components/ui/use-toast"
import { DataCollectionConfig } from '../components/config/DataCollectionConfig'
import { DatabaseConfig } from '../components/config/DatabaseConfig'
import { AlertConfig } from '../components/config/AlertConfig'
import { NotificationConfig } from '../components/config/NotificationConfig'
import { Settings, Save, RotateCcw, Database, Activity, Bell, MailCheck, Cog } from 'lucide-react'

export default function Configuration() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveConfig = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement save configuration logic
      setTimeout(() => {
        toast({
          title: "配置已保存",
          description: "所有配置项已成功保存到系统",
        })
        setIsLoading(false)
      }, 800)
    } catch (error) {
      toast({
        title: "保存失败",
        description: "保存配置时发生错误，请重试",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-blue-500 mr-2" />
          <h1 className="text-2xl font-semibold">配置管理</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            恢复默认
          </Button>
          <Button size="sm" onClick={handleSaveConfig} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存配置
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <p className="text-gray-600">
          配置系统的数据采集方式、存储选项、告警阈值以及通知方式。所有设置将在保存后生效。
        </p>
      </div>

      <Tabs defaultValue="data-collection" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
          <TabsTrigger 
            value="data-collection" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            <Database className="h-4 w-4 mr-2" />
            数据采集
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            <Cog className="h-4 w-4 mr-2" />
            数据库
          </TabsTrigger>
          <TabsTrigger 
            value="alert" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            <Bell className="h-4 w-4 mr-2" />
            告警策略
          </TabsTrigger>
          <TabsTrigger 
            value="notification" 
            className="bg-white shadow-sm data-[state=active]:bg-blue-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-t-lg"
          >
            <MailCheck className="h-4 w-4 mr-2" />
            告警推送
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-collection" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">数据采集配置</h2>
          <p className="text-muted-foreground mb-4">配置SNMP、gRPC和Syslog相关的数据采集参数</p>
          <DataCollectionConfig />
        </TabsContent>

        <TabsContent value="database" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">数据库配置</h2>
          <p className="text-muted-foreground mb-4">配置数据存储和管理相关参数</p>
          <DatabaseConfig />
        </TabsContent>

        <TabsContent value="alert" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">告警策略</h2>
          <p className="text-muted-foreground mb-4">配置各类监控指标的告警规则</p>
          <AlertConfig />
        </TabsContent>

        <TabsContent value="notification" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">告警推送</h2>
          <p className="text-muted-foreground mb-4">配置告警通知方式和接收人</p>
          <NotificationConfig />
        </TabsContent>
      </Tabs>
    </div>
  )
} 