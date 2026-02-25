'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModerationTab } from '@/components/tabs/ModerationTab'
import { BatchTab } from '@/components/tabs/BatchTab'
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab'
import { APIAccessTab } from '@/components/tabs/APIAccessTab'
import { SettingsTab } from '@/components/tabs/SettingsTab'
import {
  FileText,
  BarChart3,
  Code,
  Settings,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('moderation')

  const tabs = [
    {
      id: 'moderation',
      label: 'Single Text',
      icon: FileText,
      component: ModerationTab
    },
    {
      id: 'batch',
      label: 'Batch CSV',
      icon: Zap,
      component: BatchTab
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: AnalyticsTab
    },
    {
      id: 'api',
      label: 'API Access',
      icon: Code,
      component: APIAccessTab
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      component: SettingsTab
    }
  ]

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and moderate your content with AI-powered detection
            </p>
          </div>

          {/* Tabs */}
          <Card className="border border-border/40 p-6 shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-muted/30 p-1 rounded-lg border border-border/20 mb-6">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
                    >
                      <Icon className="w-4 h-4 hidden sm:inline" />
                      <span className="truncate">{tab.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {tabs.map(tab => {
                const Component = tab.component
                return (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                  >
                    <Component />
                  </TabsContent>
                )
              })}
            </Tabs>
          </Card>
        </div>
      </main>
    </>
  )
}
