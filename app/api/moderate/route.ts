import { getSession } from "@/lib/auth";
import { LABELS, moderateText } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { ModerationSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = ModerationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { text } = validation.data;
    const userId = session.user.id;

    // Fetch API usage and subscription
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

    // Enforce monthly API limit
    if (apiUsage.currentMonthApiCalls >= subscription.monthlyApiLimit) {
      return NextResponse.json(
        {
          error: "API call limit exceeded for this month",
          remainingCalls: 0,
          monthlyLimit: subscription.monthlyApiLimit,
          subscriptionTier: subscription.tier,
        },
        { status: 429 },
      );
    }

    // Use raw query for threshold fetch (pooler-safe)
    const userThresholds = await prisma.$queryRaw<
      { id: string; label: string; value: number }[]
    >`SELECT * FROM "Threshold" WHERE "userId" = ${userId}`;

    // Build threshold map
    const thresholds: Record<string, number> = {};
    LABELS.forEach((label) => {
      const threshold = userThresholds.find((t) => t.label === label);
      thresholds[label] = threshold?.value ?? 0.5;
    });

    // Perform moderation
    const result = await moderateText(text, thresholds);

    // Transaction: log + atomic usage increment
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

    // Calculate updated usage safely (without trusting stale value)
    const updatedUsage = await prisma.apiUsage.findUnique({
      where: { userId },
    });

    const used = updatedUsage?.currentMonthApiCalls ?? 0;
    const remaining = Math.max(subscription.monthlyApiLimit - used, 0);

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
