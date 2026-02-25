'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/StatCard'
import { Loader2, Users, FileText, Zap, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface User {
  id: string
  email: string
  role: string
  totalTexts: number
  batchJobs: number
  createdAt: string
}

interface AdminStats {
  users: number
  moderationLogs: number
  flaggedLogs: number
  batchJobs: number
  completedBatchJobs: number
  avgResponseTime: number
  flaggedPercentage: number
  activity: Array<{ date: string; total: number; flagged: number }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ])

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      setStats(statsData)
      setUsers(usersData)
    } catch (error) {
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load admin data</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Platform-wide statistics and user management
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              label="Total Users"
              value={stats.users}
              icon={Users}
            />
            <StatCard
              label="Moderation Logs"
              value={stats.moderationLogs.toLocaleString()}
              icon={FileText}
            />
            <StatCard
              label="Flagged Items"
              value={stats.flaggedLogs.toLocaleString()}
            />
            <StatCard
              label="Batch Jobs"
              value={stats.completedBatchJobs + '/' + stats.batchJobs}
            />
            <StatCard
              label="Avg Response"
              value={stats.avgResponseTime + 'ms'}
              icon={Zap}
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Chart */}
            <Card className="p-6 border border-border/40">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Platform Activity</h3>
                <p className="text-xs text-muted-foreground">30-day trend</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.activity}>
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
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#60a5fa"
                    dot={{ fill: '#60a5fa' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="flagged"
                    stroke="#f87171"
                    dot={{ fill: '#f87171' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Stats Summary */}
            <Card className="p-6 border border-border/40 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Flagged Percentage</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats.flaggedPercentage.toFixed(1)}%</span>
                  <span className="text-sm text-muted-foreground">of all moderated content</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${stats.flaggedPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Safe Content</p>
                  <p className="text-lg font-bold">
                    {(stats.moderationLogs - stats.flaggedLogs).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Batch Success Rate</p>
                  <p className="text-lg font-bold">
                    {stats.batchJobs > 0
                      ? ((stats.completedBatchJobs / stats.batchJobs) * 100).toFixed(0)
                      : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="p-6 border border-border/40 overflow-x-auto">
            <h3 className="text-sm font-semibold text-foreground mb-4">Users</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total Texts</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Batch Jobs</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium text-foreground">{user.email}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {user.totalTexts.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {user.batchJobs}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users yet</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
