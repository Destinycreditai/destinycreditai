-- Add plan column to User table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'plan') THEN
    ALTER TABLE "User" ADD COLUMN "plan" TEXT;
  END IF;
END $$;

-- Add status column to User table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'status') THEN
    ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'REGISTERED';
  END IF;
END $$;

-- Add inviteToken column to User table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'inviteToken') THEN
    ALTER TABLE "User" ADD COLUMN "inviteToken" TEXT;
  END IF;
END $$;

-- Add inviteExpiresAt column to User table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'inviteExpiresAt') THEN
    ALTER TABLE "User" ADD COLUMN "inviteExpiresAt" TIMESTAMP(3);
  END IF;
END $$;

-- Create index on inviteToken if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'User' AND indexname = 'User_inviteToken_idx') THEN
    CREATE INDEX "User_inviteToken_idx" ON "User"("inviteToken");
  END IF;
END $$;

-- Update existing users to have proper status (only run if status column was just added)
-- This will only affect rows where status is still the default 'REGISTERED'
UPDATE "User" SET "status" = 'ACTIVE' WHERE "active" = true AND "status" = 'REGISTERED';
UPDATE "User" SET "status" = 'INVITED' WHERE "active" = false AND "password" IS NOT NULL AND "status" = 'REGISTERED';
UPDATE "User" SET "status" = 'REGISTERED' WHERE "active" = false AND "password" IS NULL AND "status" = 'REGISTERED';