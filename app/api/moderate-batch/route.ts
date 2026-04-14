import { getSession } from "@/lib/auth";
import { LABELS, moderateText } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { BatchModerationSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

// NEW: CSV row limits per subscription tier
const CSV_ROW_LIMITS: Record<string, number> = {
  FREE: 1000,
  PRO: 10000,
  ENTERPRISE: 100000,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = BatchModerationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { texts } = validation.data;
    const userId = session.user.id;

    // NEW: Prevent empty CSV
    if (!texts || texts.length === 0) {
      return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    }

    // Fetch usage + subscription
    const apiUsage = await prisma.apiUsage.findUnique({
      where: { userId },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!apiUsage || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 400 },
      );
    }

    // NEW: CSV ROW LIMIT CHECK (based on tier)
    const maxRows = CSV_ROW_LIMITS[subscription.tier] ?? 1000;

    if (texts.length > maxRows) {
      return NextResponse.json(
        {
          error: `CSV row limit exceeded`,
          maxAllowed: maxRows,
          provided: texts.length,
          tier: subscription.tier,
        },
        { status: 400 },
      );
    }

    // EXISTING: Enforce batch upload count limit
    if (apiUsage.currentMonthBatchCalls >= subscription.monthlyBatchLimit) {
      return NextResponse.json(
        {
          error: "Batch request limit exceeded for this month",
          remainingRequests: 0,
          monthlyLimit: subscription.monthlyBatchLimit,
          subscriptionTier: subscription.tier,
        },
        { status: 429 },
      );
    }

    // Fetch user thresholds
    const userThresholds = await prisma.$queryRaw<
      { id: string; label: string; value: number }[]
    >`SELECT * FROM "Threshold" WHERE "userId" = ${userId}`;

    // Build threshold map
    const thresholds: Record<string, number> = {};
    LABELS.forEach((label) => {
      const threshold = userThresholds.find((t) => t.label === label);
      thresholds[label] = threshold?.value ?? 0.5;
    });

    // Create batch job
    const batchJob = await prisma.batchJob.create({
      data: {
        userId,
        status: "PROCESSING",
        fileName: `batch_${Date.now()}`,
        totalRows: texts.length,
        processedRows: 0,
        flaggedCount: 0,
      },
    });

    type BatchResult = {
      id: string;
      text: string;
      probabilities: Record<string, number>;
      flagged: boolean;
      maxLabel: string;
      maxScore: number;
    };

    const results: BatchResult[] = [];
    let flaggedCount = 0;

    // Process texts sequentially
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];

      const result = await moderateText(text, thresholds);

      const log = await prisma.moderationLog.create({
        data: {
          userId,
          text,
          probabilities: result.probabilities,
          flagged: result.flagged,
        },
      });

      if (result.flagged) {
        flaggedCount++;
      }

      results.push({
        id: log.id,
        text,
        probabilities: result.probabilities,
        flagged: result.flagged,
        maxLabel: result.maxLabel,
        maxScore: result.maxScore,
      });
    }

    // Update batch job + increment usage
    const updatedJob = await prisma.$transaction(async (tx) => {
      const job = await tx.batchJob.update({
        where: { id: batchJob.id },
        data: {
          status: "COMPLETED",
          processedRows: texts.length,
          flaggedCount: flaggedCount,
          results: results,
        },
      });

      await tx.apiUsage.update({
        where: { userId },
        data: {
          currentMonthBatchCalls: {
            increment: 1,
          },
        },
      });

      return job;
    });

    // Get updated usage
    const updatedUsage = await prisma.apiUsage.findUnique({
      where: { userId },
    });

    const used = updatedUsage?.currentMonthBatchCalls ?? 0;
    const remaining = Math.max(subscription.monthlyBatchLimit - used, 0);

    return NextResponse.json({
      batchId: updatedJob.id,
      totalTexts: texts.length,
      flaggedCount: flaggedCount,
      results: results,
      batchUsage: {
        used,
        remaining,
        monthlyLimit: subscription.monthlyBatchLimit,
        tier: subscription.tier,
      },
    });
  } catch (error) {
    console.error("Batch moderation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
