"use client";

import { ModerationCard } from "@/components/ModerationCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ModerationResult {
  id: string;
  text: string;
  probabilities: Record<string, number>;
  flagged: boolean;
  maxLabel: string;
  maxScore: number;
  createdAt: string;
  apiUsage?: {
    used: number;
    remaining: number;
    monthlyLimit: number;
    tier: string;
  };
}

export function ModerationTab() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [apiUsage, setApiUsage] = useState<{
    used: number;
    remaining: number;
    monthlyLimit: number;
    tier: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [history, setHistory] = useState<ModerationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/moderation-history");
      if (!res.ok) return;

      const data = await res.json();
      setHistory(data.logs || []);
    } catch (err) {
      console.error("History fetch failed:", err);
    }
  };
  const getStorageKey = (key: string) => {
    return userId ? `single_${userId}_${key}` : null;
  };
  // MUST FIX: load real API usage
  // useEffect(() => {
  //   const loadUsage = async () => {
  //     try {
  //       const res = await fetch("/api/profile");
  //       if (!res.ok) return;

  //       const data = await res.json();
  //       if (data.apiUsage) {
  //         setApiUsage(data.apiUsage);
  //       }
  //     } catch {
  //       // ignore silent fail
  //     }
  //   };

  //   loadUsage();
  // }, []);
  useEffect(() => {
    const loadUsage = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;

        const data = await res.json();

        if (data.apiUsage && data.subscription && data.user) {
          const used = data.apiUsage.currentMonthApiCalls;
          const monthlyLimit = data.subscription.monthlyApiLimit;

          setApiUsage({
            used,
            remaining: Math.max(monthlyLimit - used, 0),
            monthlyLimit,
            tier: data.subscription.tier,
          });

          setUserId(data.user.id); // IMPORTANT
        }
      } catch (err) {
        console.error("API usage fetch failed:", err);
      }
    };

    loadUsage();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    try {
      const savedResult = sessionStorage.getItem("temp_single_result");
      const savedText = sessionStorage.getItem("temp_single_text");
      const savedLoading = sessionStorage.getItem("temp_single_loading");

      if (savedLoading === "true") {
        setIsLoading(true);
      }
      if (savedResult && savedText) {
        setResult(JSON.parse(savedResult));
        setText(savedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (result) {
      sessionStorage.removeItem("temp_single_result");
      sessionStorage.removeItem("temp_single_text");
      sessionStorage.removeItem("temp_single_loading"); // FIX
      setIsLoading(false); // ensure UI unlocks
    }
  }, [result]);
  // useEffect(() => {
  //   if (!userId) return;

  //   const tempResult = sessionStorage.getItem("temp_single_result");
  //   const tempText = sessionStorage.getItem("temp_single_text");

  //   const resultKey = getStorageKey("result");
  //   const textKey = getStorageKey("text");

  //   if (tempResult && resultKey) {
  //     sessionStorage.setItem(resultKey, tempResult);
  //     sessionStorage.removeItem("temp_single_result");
  //   }

  //   if (tempText && textKey) {
  //     sessionStorage.setItem(textKey, tempText);
  //     sessionStorage.removeItem("temp_single_text");
  //   }
  // }, [userId]);
  useEffect(() => {
    if (result && !hasShownToast) {
      toast.success("Your analysis is ready");

      setHasShownToast(true);

      sessionStorage.removeItem("temp_single_result");
      sessionStorage.removeItem("temp_single_text");
      sessionStorage.removeItem("temp_single_loading");

      setIsLoading(false);
    }
  }, [result, hasShownToast]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (!apiUsage) {
      toast.error("Loading usage info...");
      return;
    }

    if (!apiUsage || apiUsage.remaining <= 0) {
      toast.error("You have reached your monthly API call limit");
      return;
    }
    // const loadingKey = getStorageKey("loading");
    // if (loadingKey) sessionStorage.setItem(loadingKey, "true");
    setIsLoading(true);
    setResult(null);
    sessionStorage.setItem("temp_single_loading", "true");
    sessionStorage.setItem("temp_single_text", text);

    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      let data;
      try {
        data = await res.json();
        // console.log("MODERATE API RESPONSE:", data);
        sessionStorage.setItem("temp_single_result", JSON.stringify(data));
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to moderate text");
      }
      if (isMounted.current) {
        setResult(data);
        fetchHistory();

        if (data.apiUsage) {
          setApiUsage(data.apiUsage);
        }

        sessionStorage.removeItem("temp_single_loading");
        const thresholdRes = await fetch("/api/thresholds");
        if (thresholdRes.ok) {
          setThresholds(await thresholdRes.json());
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to moderate text",
      );
    } finally {
      // if (loadingKey) sessionStorage.removeItem(loadingKey);
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const charCount = text.length;
  const isLimitReached = !apiUsage || apiUsage.remaining <= 0;

  const tier = apiUsage?.tier?.toUpperCase();

  const maxChars =
    tier === "PRO" ? 40000 : tier === "ENTERPRISE" ? 50000 : 20000;
  if (!isHydrated) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              API Calls Remaining
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {apiUsage
                ? `${apiUsage.remaining} of ${apiUsage.monthlyLimit} (${apiUsage.tier})`
                : "Loading..."}
            </p>
          </div>
          <p className="text-2xl font-bold text-accent">
            {apiUsage ? apiUsage.remaining : "-"}
          </p>{" "}
        </div>
      </div>
      <Button variant="outline" onClick={() => setShowHistory((prev) => !prev)}>
        {showHistory ? "Hide History" : "View History"}
      </Button>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Content to Moderate
            </label>
            <span
              className={`text-xs font-medium ${
                charCount > maxChars * 0.9
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {charCount} / {maxChars}
            </span>
          </div>

          <Textarea
            id="text"
            placeholder="Paste or type the content you want to moderate..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
            }}
            maxLength={maxChars}
            disabled={isLoading}
            className="min-h-32 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !text.trim() || isLimitReached}
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
      {showHistory && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No history available
            </p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 border rounded cursor-pointer hover:bg-muted"
                onClick={() => {
                  setResult(item);
                  setText(item.text);
                  const resultKey = getStorageKey("result");
                  const textKey = getStorageKey("text");

                  if (resultKey)
                    sessionStorage.setItem(resultKey, JSON.stringify(item));
                  if (textKey) sessionStorage.setItem(textKey, item.text);
                }}
              >
                <p className="text-sm truncate">{item.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
      {result && (
        <ModerationCard
          text={result.id ? text : result.probabilities ? text : ""}
          probabilities={result.probabilities}
          flagged={result.flagged}
          maxLabel={result.maxLabel}
          maxScore={result.maxScore}
          thresholds={thresholds}
        />
      )}
    </div>
  );
}
