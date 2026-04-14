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

  // MUST FIX: restore threshold-based coloring
  const getScoreColor = (label: string, score: number) => {
    const threshold = thresholds[label] ?? 0.5;

    if (score >= threshold) return "bg-red-500";
    if (score >= threshold * 0.8) return "bg-yellow-500";
    return "bg-green-500";
  };

  const sortedLabels = Object.entries(probabilities).sort(
    ([, a], [, b]) => b - a,
  );

  const hasMeaningfulRisk = maxScore >= 0.01;

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

        <Button variant="outline" size="sm" onClick={handleCopy}>
          Copy Text
        </Button>
      </div>

      {/* Text */}
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

          <span
            className={`text-lg font-bold ${
              maxScore >= (thresholds[maxLabel] ?? 0.5)
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {hasMeaningfulRisk ? (maxScore * 100).toFixed(2) + "%" : "0%"}
          </span>
        </div>

        <p className="text-sm text-muted-foreground capitalize">
          {hasMeaningfulRisk
            ? maxLabel.replace(/_/g, " ")
            : "No significant risk"}
        </p>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Category Scores</p>

        {sortedLabels.map(([label, score]) => {
          const threshold = thresholds[label] ?? 0.5;

          return (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground capitalize">
                  {label.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-bold">
                  {(score * 100).toFixed(2)}%
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getScoreColor(label, score)}`}
                  style={{ width: `${Math.max(score * 100, 0.5)}%` }}
                />
              </div>

              {thresholds[label] && (
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Threshold
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(threshold * 100).toFixed(0)}%
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
