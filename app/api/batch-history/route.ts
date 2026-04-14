import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// FEATURE: GET - Fetch user's batch processing history
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // FEATURE: Retrieve all batch jobs for current user, ordered by most recent
    const batchJobs = await prisma.batchJob.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        fileName: true,
        status: true,
        totalRows: true,
        processedRows: true,
        flaggedCount: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50  // Limit to last 50 batch jobs
    })

    return NextResponse.json({
      batchJobs: batchJobs.map(job => ({
        ...job,
        completionPercent: job.status === 'COMPLETED' ? 100 : job.totalRows > 0 ? (job.processedRows / job.totalRows) * 100 : 0
      }))
    })
  } catch (error) {
    console.error('Batch history fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// FEATURE: GET - Fetch specific batch job details with full results
export async function GET_BATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get batchId from URL params
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId is required' },
        { status: 400 }
      )
    }

    // FEATURE: Fetch specific batch job with full results
    const batchJob = await prisma.batchJob.findUnique({
      where: { id: batchId },
      select: {
        id: true,
        fileName: true,
        status: true,
        totalRows: true,
        processedRows: true,
        flaggedCount: true,
        results: true,
        error: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!batchJob) {
      return NextResponse.json(
        { error: 'Batch job not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (batchJob.id) {
      const job = await prisma.batchJob.findUnique({
        where: { id: batchId },
        select: { userId: true }
      })

      if (job?.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      batchJob: {
        ...batchJob,
        completionPercent: batchJob.status === 'COMPLETED' ? 100 : batchJob.totalRows > 0 ? (batchJob.processedRows / batchJob.totalRows) * 100 : 0
      }
    })
  } catch (error) {
    console.error('Batch job fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
