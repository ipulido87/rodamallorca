-- AddOrderInvoiceRelation
-- Agregar relación entre pedidos y facturas para auto-generación

-- Agregar campo orderId a Invoice
ALTER TABLE "Invoice" ADD COLUMN "orderId" TEXT;

-- Crear índice para orderId
CREATE INDEX "Invoice_orderId_idx" ON "Invoice"("orderId");

-- Agregar constraint de unique para orderId (un pedido solo puede tener una factura)
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_key" UNIQUE ("orderId");

-- Agregar foreign key constraint
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
