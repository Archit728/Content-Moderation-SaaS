"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Copy, Eye, EyeOff, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ApiStats {
  apiKey: string;
  currentMonthApiCalls: number;
  monthlyApiLimit: number;
  currentMonthBatchCalls: number;
  monthlyBatchLimit: number;
  subscriptionTier: string;
}

export function APIAccessTab() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // NEW: Fetch real API key and usage stats from database
    fetchApiStats();
  }, []);

  const fetchApiStats = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();

      // NEW: Set API stats from database
      setStats({
        apiKey: data.user.apiKey ?? "********",
        currentMonthApiCalls: data.apiUsage?.currentMonthApiCalls || 0,
        monthlyApiLimit: data.subscription?.monthlyApiLimit || 500,
        currentMonthBatchCalls: data.apiUsage?.currentMonthBatchCalls || 0,
        monthlyBatchLimit: data.subscription?.monthlyBatchLimit || 1000,
        subscriptionTier: data.subscription?.tier || "FREE",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching API stats:", error);
      toast.error("Failed to load API stats");
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // // Mask API key for display
  // const maskedKey = stats?.apiKey
  //   ? stats.apiKey
  //       .split("")
  //       .map((char, idx) =>
  //         idx < 8 || idx >= stats.apiKey.length - 4 ? char : "*",
  //       )
  //       .join("")
  //   : "";
  const maskedKey = useMemo(() => {
    if (!stats?.apiKey) return "";

    const key = stats.apiKey;

    if (key.length <= 12) return key;

    return key.slice(0, 8) + "*".repeat(key.length - 12) + key.slice(-4);
  }, [stats?.apiKey]);
  // Calculate usage percentages
  const apiUsagePercent = stats?.monthlyApiLimit
    ? (stats.currentMonthApiCalls / stats.monthlyApiLimit) * 100
    : 0;

  const batchUsagePercent = stats?.monthlyBatchLimit
    ? (stats.currentMonthBatchCalls / stats.monthlyBatchLimit) * 100
    : 0;
  const apiRemaining = stats
    ? stats.monthlyApiLimit - stats.currentMonthApiCalls
    : 0;
  const batchRemaining = stats
    ? stats.monthlyBatchLimit - stats.currentMonthBatchCalls
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border border-border/40 animate-pulse bg-muted" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">
            Failed to load API stats
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Key Section - NEW: Now shows actual API key from database */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">API Key</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-muted p-4 rounded-lg font-mono text-sm">
            <span className="flex-1 select-all">
              {showKey ? stats.apiKey : maskedKey}
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
              onClick={() => copyToClipboard(stats.apiKey)}
              className="h-8 w-8"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep this key secret. Anyone with access to it can use your API
            quota.
          </p>
        </div>
      </Card>

      {/* NEW: Usage & Limits - Now pulls real data from database */}
      <Card className="p-6 border border-border/40">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">
            Usage & Limits
          </h3>
        </div>
        <div className="space-y-4">
          {/* Subscription tier */}
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="inline-block px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
              {stats.subscriptionTier}
            </span>
          </div>

          {/* API Calls usage */}
          <div className="py-2 border-b border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">API Calls</span>
              <span className="text-sm font-medium">
                {stats.currentMonthApiCalls} / {stats.monthlyApiLimit}
              </span>
            </div>
            {/* Progress bar for API usage */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${Math.min(apiUsagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {apiRemaining} calls remaining
            </p>
          </div>

          {/* Batch Requests usage */}
          <div className="py-2 border-b border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Batch Requests
              </span>
              <span className="text-sm font-medium">
                {stats.currentMonthBatchCalls} / {stats.monthlyBatchLimit}
              </span>
            </div>
            {/* Progress bar for batch usage */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${Math.min(batchUsagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {batchRemaining} requests remaining
            </p>
          </div>

          {/* Rate limiting info */}
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-muted-foreground">Rate Limit</span>
            <span className="text-sm font-medium">10 req/sec</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Batch Size</span>
            <span className="text-sm font-medium">100 items/req</span>
          </div>

          {/* Alert when quota is low */}
          {(apiUsagePercent >= 80 || batchUsagePercent >= 80) && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs text-destructive">
                <p className="font-medium">Usage Warning</p>
                <p className="text-destructive/80 mt-0.5">
                  You're approaching your monthly quota limit.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Code Examples */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Example: cURL
        </h3>
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
  -H "Authorization: Bearer ${stats.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your content here"
  }'`);
          }}
        >
          <Copy className="w-4 h-4" />
          Copy cURL
        </Button>
      </Card>

      {/* JavaScript Example */}
      <Card className="p-6 border border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Example: JavaScript
        </h3>
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
      'Authorization': 'Bearer ${stats.apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Your content here'
    })
  }
);
const result = await response.json();`);
          }}
        >
          <Copy className="w-4 h-4" />
          Copy Code
        </Button>
      </Card>

      {/* Documentation Link */}
      <Card className="p-6 border border-accent/30 bg-accent/5">
        <p className="text-sm text-foreground">
          For complete documentation, visit{" "}
          <a href="#" className="text-accent hover:text-accent/80 font-medium">
            our API docs
          </a>
        </p>
      </Card>
    </div>
  );
}
