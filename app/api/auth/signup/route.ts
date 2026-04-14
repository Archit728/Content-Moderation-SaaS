import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/lib/schemas";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SignUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const defaultThresholds: Record<string, number> = {
      toxic: 0.5,
      severe_toxic: 0.4,
      obscene: 0.5,
      threat: 0.6,
      insult: 0.5,
      identity_hate: 0.4,
    };

    // Transaction to ensure data consistency
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "USER",
        },
      });

      // Create FREE subscription
      await tx.subscription.create({
        data: {
          userId: newUser.id,
          tier: "FREE",
          monthlyApiLimit: 500,
          monthlyBatchLimit: 1000,
        },
      });

      // Create API usage tracking
      await tx.apiUsage.create({
        data: {
          userId: newUser.id,
          currentMonthApiCalls: 0,
          currentMonthBatchCalls: 0,
        },
      });

      // Create default thresholds (batch insert for efficiency)
      await tx.threshold.createMany({
        data: Object.entries(defaultThresholds).map(([label, value]) => ({
          label,
          value,
          userId: newUser.id,
        })),
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
