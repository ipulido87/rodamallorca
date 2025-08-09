/*
  Warnings:

  - You are about to drop the column `codeExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."User_verificationCode_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "codeExpiresAt",
DROP COLUMN "verificationCode",
DROP COLUMN "verified",
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");
