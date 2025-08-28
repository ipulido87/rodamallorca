/*
  Warnings:

  - A unique constraint covering the columns `[productId,position]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_workshopId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- CreateIndex
CREATE INDEX "Product_workshopId_idx" ON "Product"("workshopId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_position_key" ON "ProductImage"("productId", "position");

-- CreateIndex
CREATE INDEX "Workshop_ownerId_idx" ON "Workshop"("ownerId");

-- CreateIndex
CREATE INDEX "Workshop_city_idx" ON "Workshop"("city");

-- CreateIndex
CREATE INDEX "Workshop_country_idx" ON "Workshop"("country");

-- CreateIndex
CREATE INDEX "Workshop_createdAt_idx" ON "Workshop"("createdAt");

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
