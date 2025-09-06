-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'WORKSHOP_OWNER', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';
