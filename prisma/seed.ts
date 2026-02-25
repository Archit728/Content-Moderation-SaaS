import { PrismaClient, Role } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

const labels = [
  'toxic',
  'severe_toxic',
  'obscene',
  'threat',
  'insult',
  'identity_hate'
]

const defaultThresholds: Record<string, number> = {
  toxic: 0.5,
  severe_toxic: 0.4,
  obscene: 0.5,
  threat: 0.6,
  insult: 0.5,
  identity_hate: 0.4
}

async function main() {
  console.log('Starting database seed...')

  // Create demo user
  const hashedPassword = await bcryptjs.hash('demo@1234', 10)
  
  try {
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: hashedPassword,
        role: Role.USER,
        apiKey: 'demo_key_' + Math.random().toString(36).substring(2, 15)
      }
    })
    console.log('Created demo user:', demoUser.email)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: Role.ADMIN,
        apiKey: 'admin_key_' + Math.random().toString(36).substring(2, 15)
      }
    })
    console.log('Created admin user:', adminUser.email)

    // Create default thresholds for demo user
    for (const [label, value] of Object.entries(defaultThresholds)) {
      await prisma.threshold.create({
        data: {
          label,
          value,
          userId: demoUser.id
        }
      })
    }
    console.log('Created default thresholds for demo user')

    // Create sample moderation logs
    const sampleTexts = [
      'This is a great product!',
      'I hate this, worst service ever!',
      'You are stupid and deserve nothing',
      'Love the quality, highly recommend',
      'This is spam and waste of money'
    ]

    for (const text of sampleTexts) {
      await prisma.moderationLog.create({
        data: {
          userId: demoUser.id,
          text,
          probabilities: {
            toxic: Math.random() * 0.3,
            severe_toxic: Math.random() * 0.2,
            obscene: Math.random() * 0.25,
            threat: Math.random() * 0.1,
            insult: Math.random() * 0.4,
            identity_hate: Math.random() * 0.15
          },
          flagged: Math.random() > 0.6
        }
      })
    }
    console.log('Created sample moderation logs')

  } catch (error) {
    console.error('Seed error:', error)
    throw error
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
