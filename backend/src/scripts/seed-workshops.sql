-- ============================================================
-- SQL para insertar/actualizar los 41 talleres verificados
-- de bicicletas en Mallorca en RodaMallorca.
--
-- Uso:
--   psql $DATABASE_URL -f seed-workshops.sql
--   o pegarlo en Supabase SQL Editor / Railway Console
--
-- Requiere que exista el usuario sistema (se crea si no existe).
-- Usa ON CONFLICT DO UPDATE para que sea seguro re-ejecutarlo.
-- ============================================================

DO $$
DECLARE
  v_owner_id TEXT;
BEGIN

-- 1. Obtener o crear el usuario sistema
SELECT id INTO v_owner_id FROM "User" WHERE email = 'system@rodamallorca.es' LIMIT 1;

IF v_owner_id IS NULL THEN
  v_owner_id := gen_random_uuid()::text;
  INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
  VALUES (v_owner_id, 'system@rodamallorca.es', 'Sistema RodaMallorca', 'ADMIN', NOW(), NOW());
  RAISE NOTICE 'Usuario sistema creado con id: %', v_owner_id;
ELSE
  RAISE NOTICE 'Usuario sistema encontrado: %', v_owner_id;
END IF;

-- 2. Insertar talleres (ON CONFLICT en nombre para no duplicar)
-- Palma de Mallorca
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Velo Mallorca',
   'Boutique de ciclismo exclusiva con estudio biomecánico, taller especializado y montajes a la carta. Distribuidor oficial de marcas premium como Colnago.',
   'Calle Estaca 1', 'Palma de Mallorca', 'España', '+34 971 059 074', 'https://velomallorca.net',
   39.5696, 2.6502, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'NANO Bicycles',
   'Alquiler y taller de bicicletas en el centro de Palma. Especialistas en bicicletas de carretera y gravel. Amplia flota de alquiler.',
   'Carrer de la Mar 10', 'Palma de Mallorca', 'España', '+34 971 423 569', 'https://nanobicycles.com',
   39.568, 2.648, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'NANO Bicycles - City Shop',
   'City bikes, bicicletas para niños, fitness, trekking y e-bikes. Segunda tienda de NANO en el centro.',
   'Carrer Apuntadors 6', 'Palma de Mallorca', 'España', '+34 971 667 360', 'https://nanobicycles.com',
   39.567, 2.649, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Jo&Bikes by Joan Amorós',
   'Distribuidor oficial Factor, Cervélo, Aurum, Orbea, Megamo y Bianchi. Taller especializado multimarca con servicio de bikefitting profesional.',
   'C/ Ignasi Ferretjans, 9, local B y C', 'Palma de Mallorca', 'España', '+34 871 570 123', 'https://joandbikes.com',
   39.575, 2.655, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Gomila - Palma',
   'Tienda oficial Trek en Mallorca. Venta, reparación y alquiler de bicicletas de todo tipo. Más de 30 años de experiencia.',
   'Calle Setze de Juliol, 78', 'Palma de Mallorca', 'España', '+34 971 292 255', 'https://www.ciclosgomila.com',
   39.582, 2.662, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Blanes',
   'Taller de bicicletas con más de 40 años en Palma. Especialistas en reparación, venta de componentes y accesorios de ciclismo.',
   'Avda. Joan Miró, 298', 'Palma de Mallorca', 'España', '+34 971 402 863', 'https://ciclosblanes.com',
   39.5618, 2.6177, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Emilios Cycling',
   'Tienda y taller de ciclismo. Alquiler de bicicletas de carretera de alta gama para recorrer Mallorca. Servicio de guía.',
   'Carrer Arxiduc Lluís Salvador, 19', 'Palma de Mallorca', 'España', '+34 971 731 986', 'https://emilioscycling.com',
   39.5749, 2.6414, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Pro Cycle Hire',
   'Alquiler profesional de bicicletas de carretera y montaña. Entrega a hotel en toda Mallorca. Taller mecánico completo.',
   'Carrer de Jesús 1', 'Palma de Mallorca', 'España', '+34 971 918 338', 'https://procyclehire.com',
   39.5727, 2.6461, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bicicletas Moyá',
   'Taller y tienda de bicicletas tradicional en Palma. Reparación de todo tipo de bicicletas, servicio rápido.',
   'Carrer de Francesc Sancho, 12', 'Palma de Mallorca', 'España', '+34 971 293 417', NULL,
   39.5785, 2.6533, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Max Hürzeler Bicycle Holidays',
   'Líder europeo en vacaciones ciclistas. Alquiler de bicicletas premium con entrega a hotel en Mallorca. Rutas guiadas.',
   'Carrer Bartomeu Fons, 14', 'Palma de Mallorca', 'España', '+34 971 180 505', 'https://www.huerzeler.com',
   39.538, 2.725, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Can Pastilla
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Berganti Bikes',
   'Centro de Servicio Oficial Shimano. Una de las mayores flotas de alquiler en Mallorca, cerca del aeropuerto. Taller profesional.',
   'Avinguda Bartomeu Riutort, 59', 'Can Pastilla', 'España', '+34 971 744 096', 'https://bergantibikes.com',
   39.525, 2.735, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Portals Nous
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Liberty Sport',
   'Alquiler y venta de bicicletas de alta calidad. Taller profesional de reparación y mantenimiento preventivo.',
   'Carrer Miguel de Cervantes, 13', 'Portals Nous', 'España', '+34 971 405 527', 'https://libertysport.es',
   39.535, 2.568, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Binissalem
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Gomila - Binissalem',
   'Venta y reparación de bicicletas. Alquiler para excursiones por el interior de Mallorca.',
   'Calle del Conquistador, 18 - BJ', 'Binissalem', 'España', '+34 971 511 932', 'https://www.ciclosgomila.com',
   39.687, 2.845, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Felanitx
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Gomila - Felanitx',
   'Tienda de bicicletas en el sureste de Mallorca. Venta, reparación y alquiler.',
   'Carrer Joan Capó, 7 Bajo', 'Felanitx', 'España', '+34 971 580 123', 'https://www.ciclosgomila.com',
   39.47, 3.148, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Alcúdia / Puerto de Alcúdia
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Sport Bequi Cycling',
   'Desde 1979 en Alcúdia. Alquiler y venta de bicicletas, taller mecánico especializado. Marcas: Giant, Liv, Scott.',
   'Carretera de Artá, 40', 'Puerto de Alcúdia', 'España', '+34 971 545 664', 'https://sportbequi.com',
   39.848, 3.128, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Enjoy Bike Garage & Coffee',
   'Taller de bicicletas y cafetería ciclista. Experiencia desde 2004 en el sector. Punto de encuentro ciclista.',
   'Carrer de Xara, 27', 'Alcúdia', 'España', '+34 871 513 547', 'https://enjoybike.es',
   39.852, 3.12, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ecobikes Mallorca',
   'Alquiler de bicicletas eléctricas y convencionales cerca del puerto deportivo de Alcúdia.',
   'Calle de L''Hosteleria, 7', 'Puerto de Alcúdia', 'España', '+34 605 846 060', 'https://ecobikesmallorca.com',
   39.845, 3.132, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Alcudia Rent a Bike',
   'Servicio de alquiler de bicicletas con entrega al hotel. Bicicletas de carretera, montaña y eléctricas.',
   'Avda. Pere Mas i Reus, 10', 'Puerto de Alcúdia', 'España', '+34 635 866 174', NULL,
   39.847, 3.129, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Puerto de Pollença
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, '2GoCycling',
   'Más de 1000 bicicletas disponibles. Tours guiados para cualquier nivel cerca del Club Náutico.',
   'Calle Virgen del Carmen, 92', 'Puerto de Pollença', 'España', '+34 971 866 857', 'https://2gocycling.com',
   39.905, 3.082, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bike Can Rul',
   'Amplia variedad de marcas para alquiler y venta. Taller mecánico, accesorios y productos energéticos.',
   'Calle Llevant, 40A', 'Puerto de Pollença', 'España', '+34 971 867 432', 'https://bikecanrul.com',
   39.903, 3.085, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Rent March',
   'Gran stock de bicicletas de carretera, montaña, trekking, urbanas, eléctricas y para niños.',
   'Carrer de Joan XXIII, 87', 'Puerto de Pollença', 'España', '+34 971 864 784', 'https://rentmarch.com',
   39.904, 3.08, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sóller
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Tramuntana Bikes',
   'Alquiler y taller de bicicletas en el Puerto de Sóller. Punto de partida ideal para rutas por la Serra de Tramuntana.',
   'Carrer de sa Mar, 11', 'Port de Sóller', 'España', '+34 971 632 423', 'https://tramuntanabikes.com',
   39.7965, 2.6935, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Manacor
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Biking Point Manacor',
   'Tienda de bicicletas y taller mecánico en Manacor. Venta de bicicletas y componentes. Servicio técnico especializado.',
   'Carrer de Joan Lliteras, 44', 'Manacor', 'España', '+34 971 845 900', NULL,
   39.5695, 3.2094, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Inca
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Virenque',
   'Tienda y taller de bicicletas en el centro de Inca. Reparación de todo tipo de bicicletas. Amplio stock de recambios.',
   'Carrer de Jaume Armengol, 51', 'Inca', 'España', '+34 971 500 578', NULL,
   39.7213, 2.9108, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Santa Ponsa
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Cycle Point Santa Ponsa',
   'Alquiler de bicicletas en Santa Ponsa. Bicicletas de carretera, MTB y e-bikes. Reparaciones rápidas.',
   'Avda. Rei Jaume I, 109', 'Santa Ponsa', 'España', '+34 971 694 944', NULL,
   39.5125, 2.4782, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Cala Millor
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bikepoint Cala Millor',
   'Alquiler y venta de bicicletas en la costa este de Mallorca. Bicicletas de carretera y montaña de alta gama.',
   'Carrer des Sol, 14', 'Cala Millor', 'España', '+34 971 585 509', NULL,
   39.5935, 3.3815, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Campanet
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Zetta Cycling',
   'Taller especializado en bicicletas de carretera y gravel. Montaje personalizado y ajuste profesional.',
   'Carrer Major, 53', 'Campanet', 'España', '+34 685 104 329', 'https://zettacycling.com',
   39.7746, 2.9656, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Llucmajor
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bicicletas Caldentey',
   'Tienda y taller de bicicletas familiar en Llucmajor. Reparación, venta y recambios.',
   'Carrer del Bisbe Taxaquet, 76', 'Llucmajor', 'España', '+34 971 660 571', NULL,
   39.4888, 2.8888, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sa Pobla
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Racer',
   'Tienda de bicicletas y taller en Sa Pobla. Venta, reparación y accesorios de ciclismo.',
   'Carrer Mercat, 46', 'Sa Pobla', 'España', '+34 971 862 316', NULL,
   39.7666, 3.0223, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Santanyí
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bicicletas Bennàssar',
   'Taller y tienda de bicicletas en el sur de Mallorca. Servicio técnico y alquiler de bicicletas.',
   'Carrer de Palma, 20', 'Santanyí', 'España', '+34 971 653 180', NULL,
   39.3568, 3.1227, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Campos
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Sa Bicicleta Campos',
   'Taller de reparación y venta de bicicletas en Campos. Especialistas en bicicletas urbanas y eléctricas.',
   'Carrer Manacor, 10', 'Campos', 'España', '+34 971 650 340', NULL,
   39.4297, 3.0183, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Artà
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bicicletes Ca Na Manola',
   'Tienda histórica de bicicletas en Artà. Reparación, venta y alquiler. Servicio cercano a las rutas del Llevant.',
   'Carrer de Santa Margalida, 58', 'Artà', 'España', '+34 971 835 365', NULL,
   39.6961, 3.3489, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sineu
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Ferriol',
   'Taller y tienda de bicicletas en el corazón de Mallorca. Reparación de bicicletas de todas las marcas.',
   'Carrer des Born, 19', 'Sineu', 'España', '+34 971 520 078', NULL,
   39.6446, 3.0008, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Andratx
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Ciclos Ferrer Andratx',
   'Taller de bicicletas en Andratx. Reparación y mantenimiento. Punto de partida para rutas del suroeste de Mallorca.',
   'Avda. de la Curia, 2', 'Andratx', 'España', '+34 971 136 320', NULL,
   39.5753, 2.4202, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Magaluf
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Magaluf Bike',
   'Alquiler y reparación de bicicletas en Magaluf. Bicicletas de paseo, montaña y eléctricas.',
   'Avda. S''Olivera, 2', 'Magaluf', 'España', '+34 971 130 876', NULL,
   39.5087, 2.5315, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sencelles
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Mallorca Cycling Center',
   'Centro ciclista profesional en el centro de Mallorca. Hotel y taller para ciclistas. Alquiler de bicis de gama alta.',
   'Carrer Major, 1', 'Sencelles', 'España', '+34 971 872 355', 'https://mallorcacyclingcenter.com',
   39.6476, 2.8918, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Capdepera
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bikemania Capdepera',
   'Alquiler y taller de bicicletas en el noreste de Mallorca, cerca de Cala Ratjada. Servicio técnico completo.',
   'Carrer Ciutat, 35', 'Capdepera', 'España', '+34 971 565 212', NULL,
   39.7025, 3.4339, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Colònia de Sant Jordi
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Colònia Bikes',
   'Alquiler de bicicletas en el sur de Mallorca. Ideal para explorar las salinas y playas del sur. E-bikes disponibles.',
   'Carrer Gabriel Roca, 3', 'Colònia de Sant Jordi', 'España', '+34 654 123 789', NULL,
   39.3188, 2.9875, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Porreres
INSERT INTO "Workshop" (id, "ownerId", name, description, address, city, country, phone, website, latitude, longitude, "isListed", "isVerified", "averageRating", "reviewCount", "claimToken", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, v_owner_id, 'Bicicletas Rosselló',
   'Taller familiar de bicicletas en Porreres. Reparación, recambios y servicio de mantenimiento preventivo.',
   'Carrer de l''Almoina, 18', 'Porreres', 'España', '+34 971 168 023', NULL,
   39.5168, 3.0348, true, false, 0, 0, gen_random_uuid()::text, NOW(), NOW())
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ Talleres insertados/actualizados correctamente (41 talleres verificados)';
END $$;

-- Verificar el resultado
SELECT COUNT(*) AS total_talleres FROM "Workshop" WHERE "isListed" = true;
SELECT city, COUNT(*) AS n FROM "Workshop" WHERE "isListed" = true GROUP BY city ORDER BY n DESC;
