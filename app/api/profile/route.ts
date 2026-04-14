import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for profile updates
const UpdateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  username: z.string().min(3).max(30).optional(),
});

// GET - Fetch user profile and subscription info
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user with subscription and API usage info
    // NEW: Include apiKey for API access tab
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        apiKey: true, // NEW: Include API key for display
        subscription: {
          select: {
            tier: true,
            startDate: true,
            endDate: true,
            monthlyApiLimit: true,
            monthlyBatchLimit: true,
          },
        },
        apiUsage: {
          select: {
            currentMonthApiCalls: true,
            currentMonthBatchCalls: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        apiKey: user.apiKey, // NEW: Return API key to frontend
      },
      subscription: user.subscription,
      apiUsage: user.apiUsage,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PUT - Update user profile (firstName, lastName, username)
// NEW: Added endpoint to update user profile fields
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UpdateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { firstName, lastName, username } = validation.data;

    // Check if username is already taken (if provided and changed)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { email: session.user.email },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 },
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(username !== undefined && { username }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
