import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateThresholdsSchema } from '@/lib/schemas'
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

    const userThresholds = await prisma.threshold.findMany({
      where: { userId: session.user.id }
    })

    // Build response with defaults for missing labels
    const thresholds: Record<string, number> = {}
    LABELS.forEach(label => {
      const threshold = userThresholds.find(t => t.label === label)
      thresholds[label] = threshold?.value ?? 0.5
    })

    return NextResponse.json(thresholds)
  } catch (error) {
    console.error('Get thresholds error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = UpdateThresholdsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { thresholds } = validation.data

    // Update thresholds
    for (const [label, value] of Object.entries(thresholds)) {
      await prisma.threshold.upsert({
        where: {
          label_userId: {
            label,
            userId: session.user.id
          }
        },
        update: { value },
        create: {
          label,
          value,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update thresholds error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
