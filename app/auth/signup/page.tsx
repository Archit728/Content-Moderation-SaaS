'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        setIsLoading(false)
        return
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        setIsLoading(false)
        return
      }

      // Sign up
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      if (!signupRes.ok) {
        const error = await signupRes.json()
        toast.error(error.error || 'Failed to sign up')
        setIsLoading(false)
        return
      }

      toast.success('Account created! Signing you in...')

      // Sign in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        toast.error('Sign up successful, but auto-login failed. Please sign in manually.')
        router.push('/auth/signin')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8 border border-border/40 shadow-xl">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold mx-auto mb-4">
            CG
          </div>
          <h1 className="text-2xl font-bold text-foreground">Get Started</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create your ContentGuard account today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              At least 6 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-accent hover:text-accent/80 font-medium">
            Sign in
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  )
}
