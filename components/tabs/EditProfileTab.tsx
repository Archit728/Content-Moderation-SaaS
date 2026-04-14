'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Save, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface ProfileData {
  firstName: string | null
  lastName: string | null
  username: string | null
  email: string
}

export function EditProfileTab() {
  const { data: session } = useSession()
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  // FEATURE: Fetch current profile data from database
  const fetchProfileData = async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      
      const profile = {
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        username: data.user.username || '',
        email: data.user.email
      }
      
      setProfileData(profile)
      setOriginalData(profile)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
      setIsLoading(false)
    }
  }

  // FEATURE: Handle input changes and track if data was modified
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Check if current state differs from original
    const newData = { ...profileData, [field]: value }
    const changed = JSON.stringify(newData) !== JSON.stringify(originalData)
    setHasChanges(changed)
  }

  // FEATURE: Save profile changes to database via PUT endpoint
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileData.firstName || undefined,
          lastName: profileData.lastName || undefined,
          username: profileData.username || undefined
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save profile')
      }

      const result = await res.json()
      
      // Update original data to reflect saved state
      setOriginalData({
        ...profileData
      })
      setHasChanges(false)
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // FEATURE: Reset form to original data
  const handleReset = () => {
    setProfileData(originalData)
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Info Header */}
      <Card className="p-6 border border-accent/30 bg-accent/5">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Edit Your Profile
        </h3>
        <p className="text-sm text-muted-foreground">
          Update your personal information. Email cannot be changed.
        </p>
      </Card>

      {/* Email Field (Read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <Input
          type="email"
          value={profileData.email}
          disabled
          className="bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support if you need to update it.
        </p>
      </div>

      {/* First Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          First Name
        </label>
        <Input
          type="text"
          value={profileData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="Enter your first name"
          className="border border-border"
        />
      </div>

      {/* Last Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Last Name
        </label>
        <Input
          type="text"
          value={profileData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Enter your last name"
          className="border border-border"
        />
      </div>

      {/* Username Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Username
        </label>
        <Input
          type="text"
          value={profileData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Enter your username"
          className="border border-border"
          minLength={3}
          maxLength={30}
        />
        <p className="text-xs text-muted-foreground">
          3-30 characters, must be unique
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving || !hasChanges}
          className="gap-2"
        >
          Cancel
        </Button>
      </div>

      {hasChanges && (
        <Card className="p-4 border border-yellow-500/30 bg-yellow-500/5">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </Card>
      )}

      {/* Subscription CTA */}
      <Card className="p-6 border border-accent/50 bg-accent/10">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
              Upgrade Your Plan
            </h3>
            <p className="text-sm text-muted-foreground">
              Unlock higher API limits and batch request quotas with a premium subscription.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Current Plan</p>
              <p className="font-medium text-foreground">Free</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">API Limit</p>
              <p className="font-medium text-foreground">500/mo</p>
            </div>
          </div>
          
          <Button className="w-full gap-2">
            View Subscription Plans
          </Button>
        </div>
      </Card>

      {/* Profile Information Card */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Account Information
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex justify-between">
            <span>Account Status:</span>
            <span className="font-medium text-foreground">Active</span>
          </li>
          <li className="flex justify-between">
            <span>Member Since:</span>
            <span className="font-medium text-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Subscription Tier:</span>
            <span className="inline-block px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
              FREE
            </span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
