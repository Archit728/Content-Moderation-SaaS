'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ModerationCard } from '@/components/ModerationCard'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

interface ModerationResult {
  id: string
  probabilities: Record<string, number>
  flagged: boolean
  maxLabel: string
  maxScore: number
  createdAt: string
}

export function ModerationTab() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ModerationResult | null>(null)
  const [thresholds, setThresholds] = useState<Record<string, number>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!res.ok) {
        throw new Error('Failed to moderate text')
      }

      const data = await res.json()
      setResult(data)
      toast.success('Text analyzed successfully')

      // Fetch thresholds for display
      const thresholdRes = await fetch('/api/thresholds')
      if (thresholdRes.ok) {
        const thresholdData = await thresholdRes.json()
        setThresholds(thresholdData)
      }
    } catch (error) {
      toast.error('Failed to moderate text')
    } finally {
      setIsLoading(false)
    }
  }

  const charCount = text.length
  const maxChars = 5000

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="text" className="block text-sm font-medium text-foreground">
              Content to Moderate
            </label>
            <span className={`text-xs font-medium ${
              charCount > maxChars * 0.9
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'
            }`}>
              {charCount} / {maxChars} characters
            </span>
          </div>
          <Textarea
            id="text"
            placeholder="Paste or type the content you want to moderate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={maxChars}
            disabled={isLoading}
            className="min-h-32 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="gap-2 w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analyze Content
            </>
          )}
        </Button>
      </form>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Analysis Result
            </h3>
          </div>
          <ModerationCard
            text={result.id ? text : result.probabilities ? text : ''}
            probabilities={result.probabilities}
            flagged={result.flagged}
            maxLabel={result.maxLabel}
            maxScore={result.maxScore}
            thresholds={thresholds}
          />
        </div>
      )}
    </div>
  )
}
