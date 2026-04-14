import { getSession } from "@/lib/auth";
import { LABELS } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total moderated texts
    const totalModerated = await prisma.moderationLog.count({
      where: { userId },
    });

    // Get total flagged texts
    const totalFlagged = await prisma.moderationLog.count({
      where: { userId, flagged: true },
    });

    // FEATURE: Calculate category distribution - shows highest scoring label per text
    const allLogs = await prisma.moderationLog.findMany({
      where: { userId },
      select: { probabilities: true },
    });

    // FEATURE: Track which toxicity label has highest probability in each text
    const labelStats: Record<
      string,
      { avg: number; count: number; maxCount: number }
    > = {};
    LABELS.forEach((label) => {
      labelStats[label] = { avg: 0, count: 0, maxCount: 0 };
    });

    allLogs.forEach((log) => {
      const probs = log.probabilities as Record<string, number>;

      // Find the label with highest score for this text
      let maxLabel = "";
      let maxScore = 0;

      Object.entries(probs).forEach(([label, score]) => {
        if (labelStats[label]) {
          labelStats[label].avg += score;
          labelStats[label].count++;
        }
        if (score > maxScore) {
          maxScore = score;
          maxLabel = label;
        }
      });

      // FEATURE: Track how often each label is the highest (most probable)
      if (maxLabel && labelStats[maxLabel]) {
        labelStats[maxLabel].maxCount++;
      }
    });

    // Calculate averages for each label
    Object.keys(labelStats).forEach((label) => {
      if (labelStats[label].count > 0) {
        labelStats[label].avg /= labelStats[label].count;
      }
    });

    // Get trend data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendData = await prisma.moderationLog.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, flagged: true },
    });

    // Group by date
    const trendByDate: Record<string, { total: number; flagged: number }> = {};

    trendData.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0];
      if (!trendByDate[date]) {
        trendByDate[date] = { total: 0, flagged: 0 };
      }
      trendByDate[date].total++;
      if (log.flagged) {
        trendByDate[date].flagged++;
      }
    });

    // Convert to array and sort
    const trend = Object.entries(trendByDate)
      .map(([date, data]) => ({
        date,
        total: data.total,
        flagged: data.flagged,
        percentage: data.total > 0 ? (data.flagged / data.total) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      totalModerated,
      totalFlagged,
      flaggedPercentage:
        totalModerated > 0 ? (totalFlagged / totalModerated) * 100 : 0,
      labelStats,
      trend,
      // FEATURE: Return most probable toxicity categories for display
      summary: {
        labels: LABELS.map((label) => ({
          name: label,
          // FEATURE: Use maxCount (how often this label is highest) instead of equal distribution
          value: labelStats[label].maxCount,
          avgScore: Math.round(labelStats[label].avg * 100) / 100,
          maxCount: labelStats[label].maxCount, // Track how often this is the most probable label
        })).sort((a, b) => b.value - a.value), // Sort by frequency, most common first
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
