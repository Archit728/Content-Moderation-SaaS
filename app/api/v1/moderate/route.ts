import { LABELS, moderateText } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { ModerationSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    /**
     * =========================
     * 1. API KEY AUTH
     * =========================
     */
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    const apiKey = authHeader.replace("Bearer ", "");

    const user = await prisma.user.findFirst({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const userId = user.id;

    /**
     * =========================
     * 2. VALIDATE INPUT
     * =========================
     */
    const body = await request.json();

    const validation = ModerationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { text } = validation.data;

    /**
     * =========================
     * 3. FETCH USAGE + SUBSCRIPTION
     * =========================
     */
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

    /**
     * =========================
     * 4. RATE LIMIT CHECK
     * =========================
     */
    if (apiUsage.currentMonthApiCalls >= subscription.monthlyApiLimit) {
      return NextResponse.json(
        {
          error: "API call limit exceeded",
          remainingCalls: 0,
          monthlyLimit: subscription.monthlyApiLimit,
          subscriptionTier: subscription.tier,
        },
        { status: 429 },
      );
    }

    /**
     * =========================
     * 5. LOAD THRESHOLDS
     * =========================
     */
    const userThresholds = await prisma.$queryRaw<
      { id: string; label: string; value: number }[]
    >`SELECT * FROM "Threshold" WHERE "userId" = ${userId}`;

    const thresholds: Record<string, number> = {};

    LABELS.forEach((label) => {
      const threshold = userThresholds.find((t) => t.label === label);
      thresholds[label] = threshold?.value ?? 0.5;
    });

    /**
     * =========================
     * 6. RUN MODEL
     * =========================
     */
    const result = await moderateText(text, thresholds);

    /**
     * =========================
     * 7. DB TRANSACTION (LOG + USAGE)
     * =========================
     */
    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.moderationLog.create({
        data: {
          userId,
          text,
          probabilities: result.probabilities,
          flagged: result.flagged,
        },
      });

      await tx.apiUsage.update({
        where: { userId },
        data: {
          currentMonthApiCalls: {
            increment: 1,
          },
        },
      });

      return createdLog;
    });

    /**
     * =========================
     * 8. UPDATED USAGE
     * =========================
     */
    const updatedUsage = await prisma.apiUsage.findUnique({
      where: { userId },
    });

    const used = updatedUsage?.currentMonthApiCalls ?? 0;

    const remaining = Math.max(subscription.monthlyApiLimit - used, 0);

    /**
     * =========================
     * 9. RESPONSE
     * =========================
     */
    return NextResponse.json({
      id: log.id,
      probabilities: result.probabilities,
      flagged: result.flagged,
      maxLabel: result.maxLabel,
      maxScore: result.maxScore,
      createdAt: log.createdAt,
      apiUsage: {
        used,
        remaining,
        monthlyLimit: subscription.monthlyApiLimit,
        tier: subscription.tier,
      },
    });
  } catch (error) {
    console.error("Moderation API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
