-- Migration: Add subscription system and profile fields
-- This migration adds:
-- 1. Profile fields to User table (firstName, lastName, username)
-- 2. New Subscription table for managing user subscription tiers
-- 3. New ApiUsage table for tracking API request usage

-- Add profile fields to User table
-- NEW: These fields allow users to customize their profile in Edit Profile page
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "username" TEXT UNIQUE;

-- Create Subscription table
-- NEW: Tracks user subscription tier (FREE, PRO, ENTERPRISE) and limits
-- FREE tier users have no start/end dates, subscribed users have both
CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "tier" TEXT NOT NULL DEFAULT 'FREE',
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  "monthlyApiLimit" INTEGER NOT NULL DEFAULT 500,
  "monthlyBatchLimit" INTEGER NOT NULL DEFAULT 1000,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- Create ApiUsage table
-- NEW: Tracks monthly API and batch request usage for rate limiting
-- Counter resets each month
CREATE TABLE "ApiUsage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "currentMonthApiCalls" INTEGER NOT NULL DEFAULT 0,
  "currentMonthBatchCalls" INTEGER NOT NULL DEFAULT 0,
  "lastResetDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX "ApiUsage_userId_idx" ON "ApiUsage"("userId");
