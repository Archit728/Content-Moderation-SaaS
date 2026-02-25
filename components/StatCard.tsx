'use client'

import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  description
}: StatCardProps) {
  return (
    <Card className="p-6 border border-border/40 hover:border-border/60 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">
              {value}
            </h3>
            {trend && (
              <span className={`text-xs font-semibold ${
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4 p-3 rounded-lg bg-accent/10">
            <Icon className="w-6 h-6 text-accent" />
          </div>
        )}
      </div>
    </Card>
  )
}
