-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PRODUCT_ORDER', 'SERVICE_REPAIR');

-- AlterTable Order - Add new fields
ALTER TABLE "Order" ADD COLUMN "type" "OrderType" NOT NULL DEFAULT 'PRODUCT_ORDER';
ALTER TABLE "Order" ADD COLUMN "vehicleId" TEXT;
ALTER TABLE "Order" ADD COLUMN "estimatedDelivery" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "diagnosis" TEXT;
ALTER TABLE "Order" ADD COLUMN "laborHours" DECIMAL(5,2);

-- CreateTable Vehicle
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'BICYCLE',
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "serialNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable FavoriteWorkshop
CREATE TABLE "FavoriteWorkshop" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteWorkshop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");

-- CreateIndex
CREATE INDEX "FavoriteWorkshop_userId_idx" ON "FavoriteWorkshop"("userId");

-- CreateIndex
CREATE INDEX "FavoriteWorkshop_workshopId_idx" ON "FavoriteWorkshop"("workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteWorkshop_userId_workshopId_key" ON "FavoriteWorkshop"("userId", "workshopId");

-- CreateIndex
CREATE INDEX "Order_vehicleId_idx" ON "Order"("vehicleId");

-- CreateIndex
CREATE INDEX "Order_type_idx" ON "Order"("type");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteWorkshop" ADD CONSTRAINT "FavoriteWorkshop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteWorkshop" ADD CONSTRAINT "FavoriteWorkshop_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
