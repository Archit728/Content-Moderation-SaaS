"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ModerationCardProps {
  text: string;
  probabilities: Record<string, number>;
  flagged: boolean;
  maxLabel: string;
  maxScore: number;
  thresholds?: Record<string, number>;
}

export function ModerationCard({
  text,
  probabilities,
  flagged,
  maxLabel,
  maxScore,
  thresholds = {},
}: ModerationCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard");
  };

  // const getScoreColor = (score: number) => {
  //   if (score >= 0.7) return 'bg-red-500/20 text-red-600 dark:text-red-400'
  //   if (score >= 0.5) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
  //   return 'bg-green-500/20 text-green-600 dark:text-green-400'
  // }
  // Determine bar color based on threshold
  const getScoreColor = (label: string, score: number) => {
    const threshold = thresholds[label] ?? 0.5;
    if (score >= threshold)
      return "bg-red-500/20 text-red-600 dark:text-red-400";
    if (score >= threshold * 0.8)
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    return "bg-green-500/20 text-green-600 dark:text-green-400";
  };

  const sortedLabels = Object.entries(probabilities).sort(
    ([, a], [, b]) => b - a
  );

  // Check if maxScore is meaningful
  const hasMeaningfulRisk = maxScore >= 0.01; // 1%

  return (
    <Card className="p-6 border border-border/40 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {flagged ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <Badge variant="destructive" className="text-sm">
                Flagged
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <Badge variant="secondary" className="text-sm">
                Safe
              </Badge>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="text-xs"
        >
          Copy Text
        </Button>
      </div>

      {/* Text Preview */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">Text Content</p>
        <p className="text-sm font-medium text-foreground line-clamp-3 bg-muted p-3 rounded-md">
          {text}
        </p>
      </div>

      {/* Max Score */}
      <div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Highest Risk Category
          </span>
          {/* <span className={`text-lg font-bold ${getScoreColor(maxScore)}`}>
            {(maxScore * 100).toFixed(1)}%
          </span> */}
          <span
            className={`text-lg font-bold ${getScoreColor(maxLabel, maxScore)}`}
          >
            {hasMeaningfulRisk ? (maxScore * 100).toFixed(2) + "%" : "0%"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {/* {maxLabel.replace(/_/g, " ")} */}
          {hasMeaningfulRisk
            ? maxLabel.replace(/_/g, " ")
            : "No significant risk"}
        </p>
      </div>

      {/* Probability Bars */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Category Scores</p>
        {sortedLabels.map(([label, score]) => {
          const threshold = thresholds[label] ?? 0.5;
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {label.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {(score * 100).toFixed(2)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                {/* <div
                className={`h-full transition-all duration-300 ${
                  score >= 0.7
                    ? "bg-red-500"
                    : score >= 0.5
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${score * 100}%` }}
              /> */}
                <div
                  className={`h-full transition-all duration-300 ${getScoreColor(
                    label,
                    score
                  )}`}
                  style={{ width: `${Math.max(score * 100, 0.5)}%` }}
                />
              </div>
              {thresholds[label] && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Threshold
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(thresholds[label] * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
