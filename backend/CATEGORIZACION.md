# Sistema de Categorización de RodaMallorca

## Estructura General

RodaMallorca organiza sus productos en **3 grandes grupos**:

### 1. 🚴 **Alquiler de Bicicletas**
- **Campo:** `isRental: true`
- **Endpoint:** `/api/rentals/bikes`
- **Catálogo:** Catálogo de Alquiler (`/alquileres`)
- **Características:**
  - Precio por día (`rentalPricePerDay`)
  - Precio por semana opcional (`rentalPricePerWeek`)
  - Cantidad disponible (`availableQuantity`)
  - Tipo de bici, talla, marca, modelo
  - Accesorios incluidos (casco, candado, luces)
  - Depósito, días mínimos/máximos de alquiler

### 2. 🚲 **Venta de Bicicletas**
- **Campo:** `isRental: false` + `categoryId: "Bicicletas"`
- **Endpoint:** `/api/catalog/products?categoryId={id-de-bicicletas}`
- **Catálogo:** Catálogo de Productos de Venta
- **Características:**
  - Precio de venta (`price`)
  - Condición (nuevo, usado, reacondicionado)
  - Bicicletas completas listas para usar

### 3. 🔧 **Venta de Repuestos/Recambios**
- **Campo:** `isRental: false` + `categoryId: "Componentes" | "Repuestos" | "Accesorios" | etc.`
- **Endpoint:** `/api/catalog/products?categoryId={id-categoria}`
- **Catálogo:** Catálogo de Productos de Venta
- **Características:**
  - Precio de venta (`price`)
  - Componentes, repuestos, accesorios
  - Partes individuales

---

## Categorías de Productos

### Categorías Principales:
1. **Bicicletas** - Bicicletas completas de venta
2. **Componentes** - Grupos, cambios, platos, bielas
3. **Repuestos** - Piezas de recambio y reparación
4. **Accesorios** - Luces, candados, portabultos, etc.

### Categorías Específicas:
5. **Ruedas** - Ruedas, llantas, neumáticos, cámaras
6. **Frenos** - Sistemas de frenado completos o piezas
7. **Transmisión** - Cadenas, cassettes, platos
8. **Electrónica** - Ciclocomputadores, GPS, sensores
9. **Ropa y Calzado** - Maillots, culotes, zapatillas

---

## Flujo de Categorización

### Para Owners (Creación de Producto):

```
┌─────────────────────────────────────┐
│  ¿Qué quieres crear?                │
└─────────────────────────────────────┘
           │
           ├─── [Toggle] ¿Es para alquiler?
           │
           ├─── SÍ → isRental: true
           │          ├─ Campos de alquiler
           │          ├─ Se publica en /alquileres
           │          └─ NO aparece en catálogo de productos
           │
           └─── NO → isRental: false
                      ├─ Seleccionar categoría:
                      │  ├─ Bicicletas
                      │  ├─ Componentes
                      │  ├─ Repuestos
                      │  ├─ Accesorios
                      │  └─ ... (otras categorías)
                      └─ Se publica en catálogo de productos
```

### Para Clientes (Navegación):

```
┌─────────────────────────────────────┐
│  Página Principal                   │
└─────────────────────────────────────┘
           │
           ├─── [Link] Alquilar Bici → /alquileres
           │              └─ Solo muestra isRental: true
           │
           └─── [Link] Comprar Producto → /productos
                        └─ Solo muestra isRental: false
                           ├─ Filtrar por "Bicicletas"
                           ├─ Filtrar por "Repuestos"
                           └─ Filtrar por otras categorías
```

---

## Implementación Técnica

### Backend

#### Catálogo de Alquiler:
```typescript
// GET /api/rentals/bikes
where: {
  isRental: true,
  status: 'PUBLISHED',
  availableQuantity: { gt: 0 }
}
```

#### Catálogo de Productos:
```typescript
// GET /api/catalog/products
where: {
  isRental: false,  // ← CLAVE: Excluye alquileres
  status: 'PUBLISHED',
  categoryId: '...' // opcional
}
```

### Frontend

#### Formulario de Creación:
```typescript
<Switch
  label="¿Es para alquiler?"
  onChange={(e) => setFormData({ ...prev, isRental: e.target.checked })}
/>

{formData.isRental ? (
  // Mostrar campos de alquiler
) : (
  // Mostrar campo de categoría
  <Select name="categoryId">
    <MenuItem value="id-bicicletas">Bicicletas</MenuItem>
    <MenuItem value="id-repuestos">Repuestos</MenuItem>
    ...
  </Select>
)}
```

---

## Instalación de Categorías

### Opción 1: Ejecutar Seed Completo
```bash
cd backend
npm run seed
```

### Opción 2: SQL Directo (Producción)
```bash
psql $DATABASE_URL < prisma/seed-product-categories.sql
```

### Opción 3: Railway CLI
```bash
railway run psql < backend/prisma/seed-product-categories.sql
```

---

## Ventajas de este Sistema

✅ **Separación clara**: Alquileres y ventas no se mezclan
✅ **Flexibilidad**: Categorías granulares para repuestos
✅ **Escalabilidad**: Fácil agregar nuevas categorías
✅ **UX simple**: Toggle para owners, filtros para clientes
✅ **SEO friendly**: URLs distintas (`/alquileres` vs `/productos`)

---

## Migración de Datos Existentes

Si ya tienes productos creados sin categoría:

```sql
-- Marcar todas las bicicletas completas como categoría "Bicicletas"
UPDATE "Product"
SET "categoryId" = (SELECT id FROM "Category" WHERE name = 'Bicicletas')
WHERE title ILIKE '%bicicleta%' OR title ILIKE '%bike%'
  AND "isRental" = false
  AND "categoryId" IS NULL;

-- Marcar componentes de transmisión
UPDATE "Product"
SET "categoryId" = (SELECT id FROM "Category" WHERE name = 'Transmisión')
WHERE (title ILIKE '%cadena%' OR title ILIKE '%derailleur%' OR title ILIKE '%cambio%')
  AND "isRental" = false
  AND "categoryId" IS NULL;

-- etc...
```
