'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, LogOut, Zap } from 'lucide-react'

interface UserProfile {
  firstName: string | null
  lastName: string | null
  username: string | null
  email: string
}

interface SubscriptionInfo {
  tier: string
  startDate: string | null
  endDate: string | null
  monthlyApiLimit: number
  monthlyBatchLimit: number
}

export default function EditProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Fetch user profile and subscription info on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const data = await response.json()
        setProfile({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          username: data.user.username || '',
          email: data.user.email
        })
        
        // Set subscription info if available
        if (data.subscription) {
          setSubscription({
            tier: data.subscription.tier,
            startDate: data.subscription.startDate,
            endDate: data.subscription.endDate,
            monthlyApiLimit: data.subscription.monthlyApiLimit,
            monthlyBatchLimit: data.subscription.monthlyBatchLimit
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  // Handle profile update (first name, last name, username)
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName || undefined,
          lastName: profile.lastName || undefined,
          username: profile.username || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      // Update session with new profile data
      await updateSession()
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change password')
      }

      toast.success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const isFreeTier = subscription?.tier === 'FREE'
  const subscriptionStatus = subscription?.tier ? `${subscription.tier} Tier` : 'Free'
  const daysUntilExpiry = subscription?.endDate
    ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mt-4 text-balance">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {/* Email - Read only */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm">
                {profile.email}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">First Name</label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last Name</label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </Button>
          </form>
        </Card>

        {/* Password Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">Current Password</label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm New Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full"
                required
              />
            </div>

            {/* Change Password Button */}
            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Card>

        {/* Subscription Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <h2 className="text-xl font-semibold">Subscription</h2>
                <p className="text-sm text-muted-foreground">Current plan and usage limits</p>
              </div>
            </div>
          </div>

          {subscription && (
            <div className="space-y-4">
              {/* Tier Badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm font-medium">Current Tier</span>
                <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  {subscription.tier}
                </span>
              </div>

              {/* Subscription Status */}
              {subscription.tier !== 'FREE' && subscription.endDate && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm font-medium">Expires In</span>
                  <span className="text-sm font-semibold text-accent">
                    {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}

              {/* API Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">API Calls/Month</p>
                  <p className="text-lg font-bold text-foreground">{subscription.monthlyApiLimit}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Batch Requests/Month</p>
                  <p className="text-lg font-bold text-foreground">{subscription.monthlyBatchLimit}</p>
                </div>
              </div>

              {/* Upgrade CTA for FREE tier */}
              {isFreeTier && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ready for more? Upgrade to Pro or Enterprise for higher limits.
                  </p>
                  <Link href="/dashboard/upgrade">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Upgrade Your Plan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Sign Out Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
