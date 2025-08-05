-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
