'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export function APIAccessTab() {
  const { data: session } = useSession()
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApiKey()
  }, [])

  const fetchApiKey = async () => {
    try {
      // In a real app, this would fetch from the user's profile
      // For now, we'll use a demo key
      setApiKey('sk_live_' + Math.random().toString(36).substring(2, 15))
      setIsLoading(false)
    } catch (error) {
      toast.error('Failed to load API key')
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const maskedKey = apiKey
    .split('')
    .map((char, idx) => (idx < 8 || idx >= apiKey.length - 4 ? char : '*'))
    .join('')

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">API Key</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-muted p-4 rounded-lg font-mono text-sm">
            <span className="flex-1 select-all">
              {showKey ? apiKey : maskedKey}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              className="h-8 w-8"
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(apiKey)}
              className="h-8 w-8"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep this key secret. Anyone with access to it can use your API quota.
          </p>
        </div>
      </Card>

      {/* Usage & Limits */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">Usage & Limits</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium">Free</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Requests/Month</span>
            <span className="text-sm font-medium">1,000 / 1,000</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Rate Limit</span>
            <span className="text-sm font-medium">10 req/sec</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Batch Size</span>
            <span className="text-sm font-medium">100 items/req</span>
          </div>
        </div>
      </Card>

      {/* Code Examples */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">Example: cURL</h3>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs font-mono text-muted-foreground">
            {`curl -X POST https://api.contentguard.dev/api/moderate \\
  -H "Authorization: Bearer ${maskedKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your content here"
  }'`}
          </pre>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-2"
          onClick={() => {
            copyToClipboard(`curl -X POST https://api.contentguard.dev/api/moderate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your content here"
  }'`)
          }}
        >
          <Copy className="w-4 h-4" />
          Copy cURL
        </Button>
      </Card>

      {/* JavaScript Example */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">Example: JavaScript</h3>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs font-mono text-muted-foreground">
            {`const response = await fetch(
  'https://api.contentguard.dev/api/moderate',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${maskedKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Your content here'
    })
  }
);
const result = await response.json();`}
          </pre>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-2"
          onClick={() => {
            copyToClipboard(`const response = await fetch(
  'https://api.contentguard.dev/api/moderate',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Your content here'
    })
  }
);
const result = await response.json();`)
          }}
        >
          <Copy className="w-4 h-4" />
          Copy Code
        </Button>
      </Card>

      {/* Documentation Link */}
      <Card className="p-6 border border-accent/30 bg-accent/5">
        <p className="text-sm text-foreground">
          For complete documentation, visit{' '}
          <a href="#" className="text-accent hover:text-accent/80 font-medium">
            our API docs
          </a>
        </p>
      </Card>
    </div>
  )
}
