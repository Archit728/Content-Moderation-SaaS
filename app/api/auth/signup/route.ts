import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SignUpSchema } from '@/lib/schemas'
import bcryptjs from 'bcryptjs'
import { LABELS } from '@/lib/moderation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = SignUpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER'
      }
    })

    // Create default thresholds for new user
    const defaultThresholds: Record<string, number> = {
      toxic: 0.5,
      severe_toxic: 0.4,
      obscene: 0.5,
      threat: 0.6,
      insult: 0.5,
      identity_hate: 0.4
    }

    for (const [label, value] of Object.entries(defaultThresholds)) {
      await prisma.threshold.create({
        data: {
          label,
          value,
          userId: user.id
        }
      })
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
