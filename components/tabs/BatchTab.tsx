"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Result {
  id: string;
  text: string;
  probabilities: Record<string, number>;
  flagged: boolean;
  maxLabel: string;
  maxScore: number;
}

interface BatchHistory {
  id: string;
  fileName: string;
  status: string;
  totalRows: number;
  flaggedCount: number;
  createdAt: string;
  completionPercent: number;
}

export function BatchTab() {
  const CURRENT_BATCH_ID_KEY = "currentBatchId";
  const CURRENT_BATCH_RESULTS_KEY = "currentBatchResults";
  const PENDING_UPLOAD_KEY = "batchUploadPending";
  const PENDING_UPLOAD_STARTED_AT_KEY = "batchUploadStartedAt";

  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [batchId, setBatchId] = useState("");
  const [batchUsage, setBatchUsage] = useState({
    remaining: 0,
    monthlyLimit: 1000,
    tier: "FREE",
  });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<BatchHistory[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showResultDetail, setShowResultDetail] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pendingBatchId, setPendingBatchId] = useState<string | null>(null);
  const [isRecoveringPending, setIsRecoveringPending] = useState(false);
  const isResolvingReadyRef = useRef(false);
  // const safeParse = (value: string | null) => {
  //   try {
  //     return value ? JSON.parse(value) : null;
  //   } catch {
  //     return null;
  //   }
  // };
  const [userId, setUserId] = useState<string | null>(null);
  const getKey = (key: string) => {
    if (!userId) return null;
    return `batch_${userId}_${key}`;
  };
  const safeSetItem = (key: string | null, value: string) => {
    if (!key) return;
    sessionStorage.setItem(key, value);
  };

  const safeGetItem = (key: string | null) => {
    if (!key) return null;
    return sessionStorage.getItem(key);
  };

  const safeRemoveItem = (key: string | null) => {
    if (!key) return;
    sessionStorage.removeItem(key);
  };
  useEffect(() => {
    const loadBatchUsage = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;

        const data = await res.json();

        if (data.apiUsage && data.subscription && data.user) {
          const used = data.apiUsage.currentMonthBatchCalls;
          const monthlyLimit = data.subscription.monthlyBatchLimit;
          setUserId(data.user.id);
          setBatchUsage({
            remaining: Math.max(monthlyLimit - used, 0),
            monthlyLimit,
            tier: data.subscription.tier,
          });
        }
      } catch (err) {
        console.error("Batch usage fetch failed:", err);
      }
    };

    loadBatchUsage();
  }, []);
  const loadBatchResults = async (targetBatchId: string, notify = false) => {
    if (isResolvingReadyRef.current) return false;
    isResolvingReadyRef.current = true;

    try {
      const res = await fetch(`/api/batch-history/${targetBatchId}`);
      if (!res.ok) throw new Error("Failed to fetch batch results");

      const data = await res.json();
      const loadedResults: Result[] = Array.isArray(data.results)
        ? data.results
        : [];

      if (!loadedResults.length) return false;

      setSelectedResult(null);
      setShowResultDetail(false);
      setBatchId(targetBatchId);
      setResults(loadedResults);
      setProgress(100);
      setProgressStatus("Complete");
      setIsLoading(false);
      setPendingBatchId(null);
      setIsRecoveringPending(false);
      sessionStorage.removeItem(PENDING_UPLOAD_KEY);
      sessionStorage.removeItem(PENDING_UPLOAD_STARTED_AT_KEY);
      sessionStorage.setItem(
        CURRENT_BATCH_RESULTS_KEY,
        JSON.stringify(loadedResults),
      );

      if (notify) {
        toast.success("Batch results are ready");
      }

      return true;
    } finally {
      isResolvingReadyRef.current = false;
    }
  };

  const checkPendingBatchStatus = async (targetBatchId: string) => {
    try {
      const res = await fetch("/api/batch-history");
      if (!res.ok) return;

      const data = await res.json();
      const jobs: BatchHistory[] = Array.isArray(data.batchJobs)
        ? data.batchJobs
        : [];
      const current = jobs.find((job) => job.id === targetBatchId);

      if (!current) return;

      if (current.status === "COMPLETED") {
        const loaded = await loadBatchResults(targetBatchId, true);
        if (loaded) {
          fetchBatchHistory();
        }
        return;
      }

      if (current.status === "FAILED") {
        toast.error("Batch processing failed");
        sessionStorage.removeItem(CURRENT_BATCH_ID_KEY);
        sessionStorage.removeItem(CURRENT_BATCH_RESULTS_KEY);
        sessionStorage.removeItem(PENDING_UPLOAD_KEY);
        sessionStorage.removeItem(PENDING_UPLOAD_STARTED_AT_KEY);
        setPendingBatchId(null);
        setIsRecoveringPending(false);
        setBatchId("");
        setIsLoading(false);
        setProgress(0);
        setProgressStatus("");
        return;
      }

      setProgress(0);
      setProgressStatus("Your analysis is in progress. Please wait...");
      setIsLoading(true);
    } catch (error) {
      console.error("Pending batch status check failed:", error);
    }
  };

  const recoverPendingBatchFromHistory = async () => {
    try {
      const res = await fetch("/api/batch-history");
      if (!res.ok) return;

      const data = await res.json();
      const jobs: BatchHistory[] = Array.isArray(data.batchJobs)
        ? data.batchJobs
        : [];
      if (!jobs.length) return;

      const startedAtRaw = sessionStorage.getItem(
        PENDING_UPLOAD_STARTED_AT_KEY,
      );
      const startedAt = startedAtRaw ? Number(startedAtRaw) : NaN;
      const threshold = Number.isFinite(startedAt)
        ? startedAt - 120000
        : Number.NEGATIVE_INFINITY;

      const candidate = jobs.find((job) => {
        const created = new Date(job.createdAt).getTime();
        return created >= threshold;
      });

      if (!candidate) return;

      sessionStorage.setItem(CURRENT_BATCH_ID_KEY, candidate.id);
      setBatchId(candidate.id);
      setPendingBatchId(candidate.id);
      setIsRecoveringPending(false);

      if (candidate.status === "COMPLETED") {
        const loaded = await loadBatchResults(candidate.id, true);
        if (loaded) {
          fetchBatchHistory();
        }
        return;
      }

      if (candidate.status === "FAILED") {
        toast.error("Batch processing failed");
        sessionStorage.removeItem(CURRENT_BATCH_ID_KEY);
        sessionStorage.removeItem(CURRENT_BATCH_RESULTS_KEY);
        sessionStorage.removeItem(PENDING_UPLOAD_KEY);
        sessionStorage.removeItem(PENDING_UPLOAD_STARTED_AT_KEY);
        setPendingBatchId(null);
        setBatchId("");
        setIsLoading(false);
        setProgress(0);
        setProgressStatus("");
        return;
      }

      setProgress(0);
      setProgressStatus("Your analysis is in progress. Please wait...");
      setIsLoading(true);
    } catch (error) {
      console.error("Pending batch recovery failed:", error);
    }
  };

  // restore use-effect - runs immediately on mount
  useEffect(() => {
    const savedBatchId = sessionStorage.getItem(CURRENT_BATCH_ID_KEY);
    const savedResults = sessionStorage.getItem(CURRENT_BATCH_RESULTS_KEY);
    const hasPendingUpload =
      sessionStorage.getItem(PENDING_UPLOAD_KEY) === "true";

    if (savedResults && savedBatchId) {
      try {
        const parsed = JSON.parse(savedResults);
        setBatchId(savedBatchId);
        setResults(parsed);
        setProgress(100);
        setIsLoading(false);
      } catch (e) {
        console.error("restore failed", e);
      }
      return;
    }

    if (savedBatchId) {
      setBatchId(savedBatchId);
      setPendingBatchId(savedBatchId);
      setIsLoading(true);
      setProgressStatus("Processing in background...");
      checkPendingBatchStatus(savedBatchId);
      return;
    }

    if (hasPendingUpload) {
      setIsRecoveringPending(true);
      setIsLoading(true);
      setProgressStatus("Reconnecting to your batch...");
      recoverPendingBatchFromHistory();
    }
  }, []);

  useEffect(() => {
    if (!pendingBatchId && !isRecoveringPending) return;

    const intervalId = setInterval(() => {
      if (pendingBatchId) {
        checkPendingBatchStatus(pendingBatchId);
      } else if (isRecoveringPending) {
        recoverPendingBatchFromHistory();
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [pendingBatchId, isRecoveringPending]);

  // const fetchBatchHistory = async () => {
  //   try {
  //     const res = await fetch("/api/batch-history");
  //     if (!res.ok) throw new Error("Failed to fetch history");
  //     const data = await res.json();
  //     setHistory(data.batchJobs || []);
  //   } catch (error) {
  //     console.error("Error fetching history:", error);
  //   }
  // };
  const fetchBatchHistory = async () => {
    try {
      setHistoryLoading(true);

      const res = await fetch("/api/batch-history");
      if (!res.ok) throw new Error("Failed to fetch history");

      const data = await res.json();
      setHistory(data.batchJobs || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    fetchBatchHistory();
  }, []);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const parseCSV = (text: string): string[] => {
    const lines = text.trim().split("\n");
    return lines
      .slice(1)
      .map((line) => {
        const parts = line.split(",");
        return parts[0] ? parts[0].replace(/^"|"$/g, "") : "";
      })
      .filter(Boolean);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await processFile(e.target.files[0]);
    }
  };
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (isLoading) {
          // still processing → keep UI consistent
          setProgress((p) => (p < 90 ? p + 5 : p));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLoading]);
  const processFile = async (file: File) => {
    if (isLoading) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    if (!batchUsage) {
      toast.error("Loading usage data...");
      return;
    }

    if (batchUsage.remaining <= 0) {
      toast.error("No batch requests remaining");
      return;
    }

    try {
      sessionStorage.setItem(PENDING_UPLOAD_KEY, "true");
      sessionStorage.setItem(PENDING_UPLOAD_STARTED_AT_KEY, String(Date.now()));
      sessionStorage.removeItem(CURRENT_BATCH_RESULTS_KEY);

      setResults(null);
      setShowHistory(false);
      setSelectedResult(null);
      setShowResultDetail(false);
      setProgress(0);
      setProgressStatus("");
      setBatchId("");
      setIsLoading(true);
      setProgress(10);
      setProgressStatus("Parsing CSV...");

      const text = await file.text();
      const texts = parseCSV(text);

      if (!texts.length) {
        toast.error("No valid rows found");
        return;
      }

      if (texts.length > 1000) {
        toast.error("Maximum 1000 rows allowed");
        return;
      }

      setProgress(25);
      setProgressStatus("Uploading...");

      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) {
            clearInterval(interval);
            return p;
          }
          return p + Math.random() * 10;
        });
      }, 200);

      const res = await fetch("/api/moderate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Batch failed");
      }

      const data = await res.json();
      setProgress(100);
      setProgressStatus("Complete");

      // Always save batchId immediately (don't wait for results)
      setBatchId(data.batchId);
      sessionStorage.setItem(CURRENT_BATCH_ID_KEY, data.batchId);
      setPendingBatchId(data.batchId);
      setIsRecoveringPending(false);

      // Only save results if they came back
      if (
        data.results &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        sessionStorage.setItem(
          CURRENT_BATCH_RESULTS_KEY,
          JSON.stringify(data.results),
        );
        sessionStorage.removeItem(PENDING_UPLOAD_KEY);
        sessionStorage.removeItem(PENDING_UPLOAD_STARTED_AT_KEY);
        setResults(data.results);
        setPendingBatchId(null);
        toast.success(`Processed ${texts.length} items`);
      } else {
        // Keep upload locked and let status polling load final results.
        setResults(null);
        setIsLoading(true);
        setProgress(0);
        setProgressStatus("Your analysis is in progress. Please wait...");
        checkPendingBatchStatus(data.batchId);
        toast.message("Batch submitted. We will show results once ready.");
      }

      const usageKey = getKey("batchUsage");
      if (usageKey) {
        safeSetItem(usageKey, JSON.stringify(data.batchUsage));
      }
      setBatchUsage(data.batchUsage);

      fetchBatchHistory();
    } catch (err: any) {
      toast.error(err?.message || "Failed to process file");
      sessionStorage.removeItem(PENDING_UPLOAD_KEY);
      sessionStorage.removeItem(PENDING_UPLOAD_STARTED_AT_KEY);
      setProgress(0);
      setProgressStatus("");
      setPendingBatchId(null);
      setIsRecoveringPending(false);
    } finally {
      const currentPendingId = sessionStorage.getItem(CURRENT_BATCH_ID_KEY);
      const hasPendingUpload =
        sessionStorage.getItem(PENDING_UPLOAD_KEY) === "true";
      const shouldStayLoading = Boolean(currentPendingId) || hasPendingUpload;
      setIsLoading(shouldStayLoading);
    }
  };

  const handleResultClick = (result: Result) => {
    setSelectedResult(result);
    setShowResultDetail(true);
  };

  const handleClearResults = () => {
    setResults(null);
    setProgress(0);
    setProgressStatus("");
    setBatchId("");
    setIsLoading(false);
    setShowHistory(false);
    setSelectedResult(null);
    setShowResultDetail(false);
    setPendingBatchId(null);
    setIsRecoveringPending(false);

    // Clear session storage
    sessionStorage.removeItem(CURRENT_BATCH_ID_KEY);
    sessionStorage.removeItem(CURRENT_BATCH_RESULTS_KEY);
    sessionStorage.removeItem(PENDING_UPLOAD_KEY);
    sessionStorage.removeItem(PENDING_UPLOAD_STARTED_AT_KEY);

    const usageKey = getKey("batchUsage");
    if (usageKey) {
      safeRemoveItem(usageKey);
    }
  };
  const hasResults = Array.isArray(results) && results.length > 0;
  return (
    <div className="space-y-6">
      {showResultDetail && selectedResult && (
        <Card className="p-6 border border-accent/50 bg-accent/5">
          <div className="flex justify-between">
            <h3 className="text-sm font-semibold">Detailed Analysis</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowResultDetail(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm bg-muted p-3 rounded mt-3">
            {selectedResult.text}
          </p>

          <div className="mt-4 space-y-2">
            {Object.entries(selectedResult.probabilities ?? {})
              .sort((a, b) => b[1] - a[1])
              .map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs">
                    <span>{label.replace(/_/g, " ")}</span>
                    <span>{(score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded">
                    <div
                      className="h-2 bg-accent"
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
      {!hasResults ? (
        <>
          <Card className="p-4 flex justify-between">
            <div>
              <p className="text-sm">Batch Remaining</p>
              <p className="text-xs text-muted-foreground">
                {batchUsage
                  ? `${batchUsage.remaining} / ${batchUsage.monthlyLimit} (${batchUsage.tier})`
                  : "Loading..."}{" "}
              </p>
            </div>
          </Card>

          {isLoading ? (
            <Card className="p-4 border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                <div>
                  <p className="text-sm font-medium">
                    {progressStatus || "Processing..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {batchId
                      ? "Results will appear when ready"
                      : "Upload in progress"}
                  </p>
                </div>
              </div>
              {progress > 0 && progress < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Upload Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </Card>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowHistory((prev) => !prev)}
              >
                {showHistory ? "Hide History" : "View History"}
              </Button>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="border-2 border-dashed p-12 text-center"
              >
                <Upload className="mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <Button
                  disabled={isLoading}
                  onClick={() =>
                    (
                      document.querySelector(
                        'input[type="file"]',
                      ) as HTMLInputElement
                    )?.click()
                  }
                >
                  Select File
                </Button>
              </div>

              {showHistory ? (
                <div className="space-y-2">
                  {historyLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading history...
                    </p>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No batch history available
                    </p>
                  ) : (
                    history.map((job) => (
                      <Card
                        key={job.id}
                        className="p-3 cursor-pointer hover:bg-muted"
                        onClick={async () => {
                          try {
                            console.log("CLICKED JOB ID:", job.id);
                            const res = await fetch(
                              `/api/batch-history/${job.id}`,
                            );
                            console.log("STATUS:", res.status);
                            if (!res.ok)
                              throw new Error("Failed to fetch batch");

                            const data = await res.json();

                            // Reset detail view BEFORE setting new batch
                            setSelectedResult(null);
                            setShowResultDetail(false);

                            setBatchId(job.id);
                            setResults(data.results);

                            setShowHistory(false);

                            // Save to session storage using simple keys
                            sessionStorage.setItem(
                              CURRENT_BATCH_ID_KEY,
                              job.id,
                            );
                            sessionStorage.setItem(
                              CURRENT_BATCH_RESULTS_KEY,
                              JSON.stringify(data.results),
                            );
                            sessionStorage.removeItem(PENDING_UPLOAD_KEY);
                            sessionStorage.removeItem(
                              PENDING_UPLOAD_STARTED_AT_KEY,
                            );
                            setPendingBatchId(null);
                            setIsRecoveringPending(false);
                          } catch (err) {
                            toast.error("Failed to load batch");
                          }
                        }}
                      >
                        <p className="text-sm font-medium">
                          {job.fileName || "Batch"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.totalRows} rows • {job.flaggedCount} flagged
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </Card>
                    ))
                  )}
                </div>
              ) : null}
            </>
          )}
        </>
      ) : (
        <>
          <Card className="p-4">
            <p>Total: {results.length}</p>
            <p>Flagged: {results.filter((r) => r.flagged).length}</p>
          </Card>

          <div className="space-y-2">
            {results.map((r, i) => (
              <Card
                key={i}
                onClick={() => handleResultClick(r)}
                className="p-3 cursor-pointer"
              >
                <p className="text-sm truncate">{r.text}</p>
                <p className="text-xs">
                  {r.maxLabel} • {(r.maxScore * 100).toFixed(0)}%
                </p>
              </Card>
            ))}
          </div>

          <Button onClick={handleClearResults}>Process Another File</Button>
        </>
      )}
    </div>
  );
}
