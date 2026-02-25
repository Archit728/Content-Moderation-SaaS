'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function AnalyticsTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const analyticsData = await res.json()
        setData(analyticsData)
      } catch (error) {
        toast.error('Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) return null

  const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#f87171']

  const labelChartData = data.summary.labels.map((item: any) => ({
    name: item.name.replace(/_/g, ' '),
    count: item.value
  }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Scanned"
          value={data.totalModerated.toLocaleString()}
          icon={TrendingUp}
          description="Content items analyzed"
        />
        <StatCard
          label="Total Flagged"
          value={data.totalFlagged.toLocaleString()}
          icon={AlertCircle}
          trend={{
            value: data.flaggedPercentage,
            isPositive: false
          }}
          description="Flagged items"
        />
        <StatCard
          label="Safe Content"
          value={(data.totalModerated - data.totalFlagged).toLocaleString()}
          icon={CheckCircle2}
          description="Content cleared"
        />
        <StatCard
          label="Flagged %"
          value={`${data.flaggedPercentage.toFixed(1)}%`}
          description="Percentage flagged"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="p-6 border border-border/40">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">30-Day Trend</h3>
            <p className="text-xs text-muted-foreground">Content flagged over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: 12 }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="flagged"
                stroke="#60a5fa"
                dot={{ fill: '#60a5fa' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#a78bfa"
                dot={{ fill: '#a78bfa' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 border border-border/40">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Category Distribution</h3>
            <p className="text-xs text-muted-foreground">Count by toxicity label</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={labelChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--radius)'
                }}
              />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">Category Stats</h3>
        <div className="space-y-3">
          {data.summary.labels.map((label: any, idx: number) => (
            <div key={label.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-sm font-medium capitalize">
                  {label.name.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {label.value} items
                </span>
                <span className="text-sm font-semibold">
                  {label.avgScore.toFixed(3)}% avg
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
