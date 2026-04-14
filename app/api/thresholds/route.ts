import { getSession } from "@/lib/auth";
import { LABELS } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { UpdateThresholdsSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Raw query (pooler-safe)
    const userThresholds = await prisma.$queryRaw<
      { id: string; label: string; value: number }[]
    >`SELECT * FROM "Threshold" WHERE "userId" = ${userId}`;

    const thresholds: Record<string, number> = {};
    LABELS.forEach((label) => {
      const threshold = userThresholds.find((t) => t.label === label);
      thresholds[label] = threshold?.value ?? 0.5;
    });

    return NextResponse.json(thresholds);
  } catch (error) {
    console.error("Get thresholds error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UpdateThresholdsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { thresholds } = validation.data;
    const userId = session.user.id;

    // Raw fetch existing thresholds
    const existingThresholds = await prisma.$queryRaw<
      { id: string; label: string; value: number }[]
    >`SELECT * FROM "Threshold" WHERE "userId" = ${userId}`;

    const existingMap = new Map(existingThresholds.map((t) => [t.label, t]));

    await prisma.$transaction(async (tx) => {
      for (const [label, value] of Object.entries(thresholds)) {
        if (!LABELS.includes(label)) continue;

        const existing = existingMap.get(label);

        if (existing) {
          await tx.threshold.update({
            where: { id: existing.id },
            data: { value },
          });
        } else {
          await tx.threshold.create({
            data: {
              label,
              value,
              userId,
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update thresholds error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
