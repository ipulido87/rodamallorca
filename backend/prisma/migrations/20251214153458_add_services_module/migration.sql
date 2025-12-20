-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('BICYCLE', 'E_BIKE', 'E_SCOOTER', 'ALL');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "public"."ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "duration" INTEGER,
    "vehicleType" "public"."VehicleType" NOT NULL DEFAULT 'ALL',
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN "serviceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "public"."ServiceCategory"("name");

-- CreateIndex
CREATE INDEX "ServiceCategory_position_idx" ON "public"."ServiceCategory"("position");

-- CreateIndex
CREATE INDEX "Service_workshopId_idx" ON "public"."Service"("workshopId");

-- CreateIndex
CREATE INDEX "Service_serviceCategoryId_idx" ON "public"."Service"("serviceCategoryId");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "public"."Service"("status");

-- CreateIndex
CREATE INDEX "Service_vehicleType_idx" ON "public"."Service"("vehicleType");

-- CreateIndex
CREATE INDEX "Service_createdAt_idx" ON "public"."Service"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_serviceId_idx" ON "public"."OrderItem"("serviceId");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "public"."ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
