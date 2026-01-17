-- Insertar categorías de productos en español
-- Este script agrega las categorías necesarias para organizar:
-- - Bicicletas completas
-- - Componentes y repuestos
-- - Accesorios

INSERT INTO "Category" (id, name, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Bicicletas', NOW(), NOW()),
  (gen_random_uuid(), 'Componentes', NOW(), NOW()),
  (gen_random_uuid(), 'Accesorios', NOW(), NOW()),
  (gen_random_uuid(), 'Repuestos', NOW(), NOW()),
  (gen_random_uuid(), 'Ruedas', NOW(), NOW()),
  (gen_random_uuid(), 'Frenos', NOW(), NOW()),
  (gen_random_uuid(), 'Transmisión', NOW(), NOW()),
  (gen_random_uuid(), 'Electrónica', NOW(), NOW()),
  (gen_random_uuid(), 'Ropa y Calzado', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
