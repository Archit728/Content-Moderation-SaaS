'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThresholdSlider } from '@/components/ThresholdSlider'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { LABELS } from '@/lib/moderation'

const DEFAULT_THRESHOLDS: Record<string, number> = {
  toxic: 0.5,
  severe_toxic: 0.4,
  obscene: 0.5,
  threat: 0.6,
  insult: 0.5,
  identity_hate: 0.4
}

export function SettingsTab() {
  const [thresholds, setThresholds] = useState<Record<string, number>>(DEFAULT_THRESHOLDS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchThresholds()
  }, [])

  const fetchThresholds = async () => {
    try {
      const res = await fetch('/api/thresholds')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setThresholds(data)
      setIsLoading(false)
    } catch (error) {
      toast.error('Failed to load thresholds')
      setIsLoading(false)
    }
  }

  const handleThresholdChange = (label: string, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [label]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholds })
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success('Thresholds saved successfully')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save thresholds')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS)
    setHasChanges(true)
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
      {/* Info Card */}
      <Card className="p-6 border border-accent/30 bg-accent/5">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Customize Detection Sensitivity
        </h3>
        <p className="text-sm text-muted-foreground">
          Adjust the confidence thresholds for each toxicity category. Higher values = stricter filtering.
        </p>
      </Card>

      {/* Thresholds */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Toxicity Thresholds
        </h3>
        {LABELS.map(label => (
          <ThresholdSlider
            key={label}
            label={label}
            value={thresholds[label] ?? 0.5}
            onChange={(value) => handleThresholdChange(label, value)}
            description={`Adjust sensitivity for ${label.replace(/_/g, ' ')}`}
          />
        ))}
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
          disabled={isSaving}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </Button>
      </div>

      {hasChanges && (
        <Card className="p-4 border border-yellow-500/30 bg-yellow-500/5">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </Card>
      )}

      {/* Documentation */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          About Thresholds
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-medium text-foreground flex-shrink-0">0% (Allow All)</span>
            <span>Flag nothing - content is never blocked</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground flex-shrink-0">50% (Medium)</span>
            <span>Balanced approach - blocks obvious violations</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground flex-shrink-0">100% (Block All)</span>
            <span>Block everything - no content passes</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
