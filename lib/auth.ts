import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Role } from '@prisma/client'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(role: Role) {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  if (session.user.role !== role && session.user.role !== Role.ADMIN) {
    throw new Error('Forbidden')
  }
  return session
}
