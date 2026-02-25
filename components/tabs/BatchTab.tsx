'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function BatchTab() {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[] | null>(null)
  const [batchId, setBatchId] = useState('')

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const parseCSV = (text: string): string[] => {
    const lines = text.trim().split('\n')
    return lines.slice(1).map(line => {
      const parts = line.split(',')
      return parts[0] ? parts[0].replace(/^"|"$/g, '') : ''
    }).filter(Boolean)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0])
    }
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    try {
      setIsLoading(true)
      setProgress(0)

      const text = await file.text()
      const texts = parseCSV(text)

      if (texts.length === 0) {
        toast.error('No valid rows found in CSV')
        return
      }

      if (texts.length > 1000) {
        toast.error('Maximum 1000 rows allowed')
        return
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 30
        })
      }, 100)

      const res = await fetch('/api/moderate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        throw new Error('Failed to process batch')
      }

      const data = await res.json()
      setProgress(100)
      setBatchId(data.batchId)
      setResults(data.results)
      toast.success(`Processed ${texts.length} items successfully`)
    } catch (error) {
      toast.error('Failed to process file')
      setProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!results ? (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 cursor-pointer ${
              isDragActive
                ? 'border-accent bg-accent/5'
                : 'border-border/40 bg-muted/20 hover:border-border/60'
            }`}
          >
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-foreground font-semibold">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click below to select
                </p>
              </div>
              <label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement
                    input?.click()
                  }}
                >
                  {isLoading ? 'Processing...' : 'Select File'}
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Maximum 1,000 rows. CSV format with content in first column.
              </p>
            </div>
          </div>

          {isLoading && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing batch...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card className="p-6 border-accent/30 bg-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Batch ID</p>
                <p className="font-mono text-sm font-medium">{batchId.slice(0, 8)}...</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold text-red-500">
                  {results.filter((r: any) => r.flagged).length}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Results Preview
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.slice(0, 10).map((result: any, idx: number) => (
                <Card
                  key={idx}
                  className={`p-3 border transition-colors ${
                    result.flagged
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-green-500/30 bg-green-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.maxLabel.replace(/_/g, ' ')} • {(result.maxScore * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                      result.flagged
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                        : 'bg-green-500/20 text-green-600 dark:text-green-400'
                    }`}>
                      {result.flagged ? 'Flagged' : 'Safe'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            {results.length > 10 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{results.length - 10} more items
              </p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setResults(null)
              setProgress(0)
              setBatchId('')
            }}
          >
            Process Another File
          </Button>
        </>
      )}
    </div>
  )
}
