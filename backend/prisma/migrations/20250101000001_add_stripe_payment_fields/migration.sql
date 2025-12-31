-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT DEFAULT 'UNPAID';
ALTER TABLE "Order" ADD COLUMN "stripeSessionId" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE INDEX "Order_stripeSessionId_idx" ON "Order"("stripeSessionId");
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
