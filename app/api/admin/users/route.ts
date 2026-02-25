import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.ADMIN)

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            moderationLogs: true,
            batchJobs: true
          }
        }
      }
    })

    const usersWithStats = users.map(user => {
      const flaggedLogs = prisma.moderationLog.count({
        where: {
          userId: user.id,
          flagged: true
        }
      })

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        totalTexts: user._count.moderationLogs,
        batchJobs: user._count.batchJobs,
        createdAt: user.createdAt
      }
    })

    return NextResponse.json(usersWithStats)
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
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
