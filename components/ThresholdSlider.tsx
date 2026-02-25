'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { AlertCircle, Info } from 'lucide-react'

interface ThresholdSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  description?: string
}

export function ThresholdSlider({
  label,
  value,
  onChange,
  description
}: ThresholdSliderProps) {
  const [localValue, setLocalValue] = useState(value * 100)

  useEffect(() => {
    setLocalValue(value * 100)
  }, [value])

  const handleChange = (newValue: number[]) => {
    const newVal = newValue[0] / 100
    setLocalValue(newValue[0])
    onChange(newVal)
  }

  const getRiskColor = (val: number) => {
    if (val >= 0.7) return 'text-red-500'
    if (val >= 0.5) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskLabel = (val: number) => {
    if (val >= 0.7) return 'High Risk'
    if (val >= 0.5) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <Card className="p-4 border border-border/40 bg-card">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground capitalize">
              {label.replace(/_/g, ' ')}
            </h3>
            {description && (
              <Info className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${getRiskColor(value)}`}>
              {(value * 100).toFixed(0)}%
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
              value >= 0.7
                ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                : value >= 0.5
                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
            }`}>
              {getRiskLabel(value)}
            </span>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <Slider
        value={[localValue]}
        onValueChange={handleChange}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>0% (Allow All)</span>
        <span>50% (Medium)</span>
        <span>100% (Block All)</span>
      </div>
    </Card>
  )
}
