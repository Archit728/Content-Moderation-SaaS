import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)

    // Get system-wide statistics
    const totalUsers = await prisma.user.count()
    const totalModerationLogs = await prisma.moderationLog.count()
    const totalFlaggedLogs = await prisma.moderationLog.count({
      where: { flagged: true }
    })
    const totalBatchJobs = await prisma.batchJob.count()
    const completedBatchJobs = await prisma.batchJob.count({
      where: { status: 'COMPLETED' }
    })

    // Calculate average response time (mock data)
    const avgResponseTime = 234 // milliseconds

    // Get activity data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.moderationLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true, flagged: true }
    })

    // Group by date
    const activityByDate: Record<string, { total: number; flagged: number }> = {}

    recentActivity.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0]
      if (!activityByDate[date]) {
        activityByDate[date] = { total: 0, flagged: 0 }
      }
      activityByDate[date].total++
      if (log.flagged) {
        activityByDate[date].flagged++
      }
    })

    const activity = Object.entries(activityByDate)
      .map(([date, data]) => ({
        date,
        total: data.total,
        flagged: data.flagged
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      users: totalUsers,
      moderationLogs: totalModerationLogs,
      flaggedLogs: totalFlaggedLogs,
      batchJobs: totalBatchJobs,
      completedBatchJobs: completedBatchJobs,
      avgResponseTime: avgResponseTime,
      flaggedPercentage: totalModerationLogs > 0
        ? (totalFlaggedLogs / totalModerationLogs) * 100
        : 0,
      activity
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
