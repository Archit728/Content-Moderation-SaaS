import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LABELS } from '@/lib/moderation'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get total moderated texts
    const totalModerated = await prisma.moderationLog.count({
      where: { userId }
    })

    // Get total flagged texts
    const totalFlagged = await prisma.moderationLog.count({
      where: { userId, flagged: true }
    })

    // Get label distribution
    const allLogs = await prisma.moderationLog.findMany({
      where: { userId },
      select: { probabilities: true }
    })

    // Calculate average scores per label
    const labelStats: Record<string, { avg: number; count: number }> = {}
    LABELS.forEach(label => {
      labelStats[label] = { avg: 0, count: 0 }
    })

    allLogs.forEach(log => {
      const probs = log.probabilities as Record<string, number>
      Object.entries(probs).forEach(([label, score]) => {
        if (labelStats[label]) {
          labelStats[label].avg += score
          labelStats[label].count++
        }
      })
    })

    // Calculate averages
    Object.keys(labelStats).forEach(label => {
      if (labelStats[label].count > 0) {
        labelStats[label].avg /= labelStats[label].count
      }
    })

    // Get trend data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const trendData = await prisma.moderationLog.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true, flagged: true }
    })

    // Group by date
    const trendByDate: Record<string, { total: number; flagged: number }> = {}

    trendData.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0]
      if (!trendByDate[date]) {
        trendByDate[date] = { total: 0, flagged: 0 }
      }
      trendByDate[date].total++
      if (log.flagged) {
        trendByDate[date].flagged++
      }
    })

    // Convert to array and sort
    const trend = Object.entries(trendByDate)
      .map(([date, data]) => ({
        date,
        total: data.total,
        flagged: data.flagged,
        percentage: data.total > 0 ? (data.flagged / data.total) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      totalModerated,
      totalFlagged,
      flaggedPercentage: totalModerated > 0 ? (totalFlagged / totalModerated) * 100 : 0,
      labelStats,
      trend,
      summary: {
        labels: LABELS.map(label => ({
          name: label,
          value: labelStats[label].count,
          avgScore: Math.round(labelStats[label].avg * 100) / 100
        }))
      }
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
