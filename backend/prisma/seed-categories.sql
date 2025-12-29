-- Insertar categorías de servicios
INSERT INTO "ServiceCategory" (id, name, description, icon, position, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Ruedas y neumáticos', 'Cambio de cubiertas y cámaras, centrado de ruedas, sustitución de radios', 'DirectionsBike', 1, NOW(), NOW()),
  (gen_random_uuid(), 'Transmisión', 'Ajuste y cambio de cadena, reparación o sustitución de platos, piñones y bielas, ajuste de cambios', 'Settings', 2, NOW(), NOW()),
  (gen_random_uuid(), 'Frenos', 'Ajuste de frenos de disco o zapata, sustitución de pastillas o zapatas, purga de frenos hidráulicos', 'PanTool', 3, NOW(), NOW()),
  (gen_random_uuid(), 'Suspensión y cuadro', 'Mantenimiento de horquillas y amortiguadores, revisión de dirección y potencia', 'Build', 4, NOW(), NOW()),
  (gen_random_uuid(), 'Posición y ergonomía', 'Ajuste de sillín y manillar, instalación de puños, cintas o potencia regulable', 'Accessible', 5, NOW(), NOW()),
  (gen_random_uuid(), 'Montaje y accesorios', 'Instalación de portabultos, luces, guardabarros, montaje de bicicletas nuevas o personalizadas', 'Construction', 6, NOW(), NOW()),
  (gen_random_uuid(), 'Bicicletas eléctricas (e-bikes)', 'Diagnóstico de batería y motor, sustitución de componentes eléctricos, actualización de software', 'ElectricBike', 7, NOW(), NOW()),
  (gen_random_uuid(), 'Patinetes eléctricos', 'Reparación y mantenimiento de patinetes eléctricos, diagnóstico de batería y motor, cambio de neumáticos', 'ElectricScooter', 8, NOW(), NOW()),
  (gen_random_uuid(), 'Mantenimiento general', 'Revisión completa, limpieza y engrase, diagnóstico gratuito, packs de mantenimiento', 'CleaningServices', 9, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
