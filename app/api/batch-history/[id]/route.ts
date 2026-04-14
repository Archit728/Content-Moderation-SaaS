import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: batchId } = await params; // FIX

  // safety check
  if (!batchId) {
    return NextResponse.json({ error: "Batch ID missing" }, { status: 400 });
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batchJob = await prisma.batchJob.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      results: true,
      userId: true,
    },
  });

  if (!batchJob) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  // ownership check
  if (batchJob.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    results: batchJob.results || [],
  });
}
