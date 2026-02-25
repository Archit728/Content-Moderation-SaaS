'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: 'demo@example.com',
    password: 'demo@1234'
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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error || 'Failed to sign in')
      } else {
        toast.success('Signed in successfully')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'demo@1234'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8 border border-border/40 shadow-xl">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold mx-auto mb-4">
            CG
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to your ContentGuard account
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
              placeholder="demo@example.com"
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
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={fillDemoCredentials}
            disabled={isLoading}
          >
            Fill Demo Credentials
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Demo: demo@example.com / demo@1234
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-accent hover:text-accent/80 font-medium">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
