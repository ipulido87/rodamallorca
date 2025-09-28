/*
  Warnings:

  - You are about to drop the column `url` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `medium` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ProductImage" DROP COLUMN "url",
ADD COLUMN     "medium" TEXT NOT NULL,
ADD COLUMN     "original" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL;
