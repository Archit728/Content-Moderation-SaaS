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
        { status: 400 }
      );
    }

    const { text } = validation.data;

    // // Get user's thresholds (fallback to defaults)
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

    // Moderate the text
    const result = await moderateText(text, thresholds);

    // Save to database
    const log = await prisma.moderationLog.create({
      data: {
        userId: session.user.id,
        text,
        probabilities: result.probabilities,
        flagged: result.flagged,
      },
    });

    return NextResponse.json({
      id: log.id,
      probabilities: result.probabilities,
      flagged: result.flagged,
      maxLabel: result.maxLabel,
      maxScore: result.maxScore,
      createdAt: log.createdAt,
    });
  } catch (error) {
    console.error("Moderation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
