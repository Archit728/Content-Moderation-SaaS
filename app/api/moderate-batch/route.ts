import { getSession } from "@/lib/auth";
import { LABELS, moderateText } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { BatchModerationSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

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
        { status: 400 }
      );
    }

    const { texts } = validation.data;

    // Get user's thresholds
    // const userThresholds = await prisma.threshold.findMany({
    //   where: { userId: session.user.id }
    // })
    // Use raw query instead of findMany() for transaction-mode pooler
    const userThresholds = await prisma.$queryRaw<
      { id: string; label: string; value: number }[]
    >`SELECT * FROM "Threshold" WHERE "userId" = ${session.user.id}`;

    const thresholds: Record<string, number> = {};
    LABELS.forEach((label) => {
      const threshold = userThresholds.find((t) => t.label === label);
      thresholds[label] = threshold?.value ?? 0.5;
    });

    // Create batch job
    const batchJob = await prisma.batchJob.create({
      data: {
        userId: session.user.id,
        status: "PROCESSING",
        fileName: `batch_${Date.now()}`,
        totalRows: texts.length,
        processedRows: 0,
        flaggedCount: 0,
      },
    });

    // Process texts (in production, this would be queued)
    const results = [];
    let flaggedCount = 0;

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const result = await moderateText(text, thresholds);

      // Save to moderation log
      const log = await prisma.moderationLog.create({
        data: {
          userId: session.user.id,
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

    // Update batch job
    const updatedJob = await prisma.batchJob.update({
      where: { id: batchJob.id },
      data: {
        status: "COMPLETED",
        processedRows: texts.length,
        flaggedCount: flaggedCount,
        results: results,
      },
    });

    return NextResponse.json({
      batchId: updatedJob.id,
      totalTexts: texts.length,
      flaggedCount: flaggedCount,
      results: results,
    });
  } catch (error) {
    console.error("Batch moderation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
