# RodaMallorca Frontend

Aplicación web para la plataforma de talleres de bicicletas en Mallorca.

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Material UI (MUI)** - Component library
- **React Router v6** - Routing
- **SWR** - Data fetching & caching
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Vitest** - Testing

## Quick Start

```bash
# Desde la raíz del monorepo
pnpm install

# Desarrollo (requiere backend corriendo en :4000)
pnpm --filter frontend dev

# O desde /frontend
cd frontend && pnpm dev

# Build producción
pnpm --filter frontend build

# Tests
pnpm --filter frontend test

# Tests con coverage
pnpm --filter frontend test:coverage
```

## Variables de Entorno

Crear `.env` en la raíz de `/frontend`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Arquitectura

### Estructura de Carpetas

```
src/
├── __tests__/           # Tests organizados por tipo
│   ├── auth/
│   ├── cart/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   └── services/
│
├── components/          # Componentes compartidos de UI
│   ├── layout/          # MainLayout, PublicLayout, Sidebar
│   ├── notifications/
│   └── ...
│
├── features/            # Módulos por dominio (feature-based)
│   ├── auth/
│   │   ├── hooks/       # useAuth
│   │   ├── pages/       # login-form, register-form
│   │   ├── providers/   # AuthProvider, auth-providers
│   │   └── services/    # auth-service
│   ├── billing/
│   ├── cart/
│   ├── catalog/
│   ├── customers/
│   ├── dashboard/
│   ├── favorites/
│   ├── media/
│   ├── orders/
│   ├── payments/
│   ├── products/
│   ├── rentals/
│   ├── reviews/
│   ├── services/
│   ├── subscriptions/
│   └── workshops/
│
├── pages/               # Páginas standalone (Landing, Home, Profile)
│
├── providers/           # Context providers globales
│   └── AppProviders.tsx
│
├── router/              # Configuración de rutas
│   ├── AppRoutes.tsx    # Definición de rutas
│   ├── lazy-imports.ts  # Imports lazy por categoría
│   └── index.ts
│
├── shared/              # Código compartido
│   ├── api/             # Cliente API centralizado
│   ├── components/      # PageLoader, etc.
│   ├── constants/
│   ├── hooks/           # useSnackbar, useConfirmDialog
│   ├── schemas/         # Zod schemas compartidos
│   ├── services/
│   ├── theme/
│   └── types/
│
└── App.tsx              # Punto de entrada (13 líneas)
```

### Patrones Clave

#### 1. Feature-Based Architecture

Cada feature es autónoma con su propia estructura:

```
features/products/
├── components/     # Componentes específicos del feature
├── hooks/          # Hooks específicos
├── pages/          # Páginas/vistas
├── services/       # API calls
├── types/          # TypeScript types
└── index.ts        # Public API del módulo
```

#### 2. API Client Centralizado

```typescript
// Importar siempre desde @/shared/api
import { API } from '@/shared/api'

// El cliente incluye interceptors para:
// - Manejo de errores de suscripción (403 NO_ACTIVE_SUBSCRIPTION)
// - Manejo de email no verificado (403 EMAIL_NOT_VERIFIED)
```

#### 3. Lazy Loading

Las rutas no críticas se cargan bajo demanda:

```typescript
// router/lazy-imports.ts
const Dashboard = lazy(() =>
  import('../features/dashboard/index').then((m) => ({ default: m.Dashboard }))
)
```

#### 4. MUI Best Practices

```tsx
// ✅ Usar Stack para layouts flex
<Stack direction="row" spacing={2} justifyContent="space-between">
  <Typography>Left</Typography>
  <Button>Right</Button>
</Stack>

// ❌ Evitar Box con display: flex
<Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo en :5173 |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm lint` | Ejecutar ESLint |
| `pnpm test` | Ejecutar tests |
| `pnpm test:coverage` | Tests con reporte de coverage |

## Testing

Tests ubicados en `src/__tests__/` con estructura espejo:

```bash
# Ejecutar todos los tests
pnpm test

# Con UI
pnpm test:ui

# Coverage (mínimo 20%)
pnpm test:coverage
```

### Cobertura Actual

- **108 tests** pasando
- Hooks: `useAuth`, `useCatalogSearch`
- Services: `catalog-service`
- Components: `RoleRoute`, `PrivateRoute`, `Cart`, `LoginForm`
- Schemas: Validaciones Zod

## Roles y Rutas

| Rol | Rutas disponibles |
|-----|-------------------|
| `USER` | `/home`, `/my-orders`, `/cart`, `/favorites`, `/profile` |
| `WORKSHOP_OWNER` | Todo lo anterior + `/dashboard`, `/my-workshops`, `/my-products`, `/billing/*` |
| `ADMIN` | Todas las rutas |

## Estado Global

- **AuthContext**: Usuario autenticado, login/logout
- **CartContext**: Carrito de compras
- **SnackbarProvider**: Notificaciones toast
- **ConfirmDialogProvider**: Diálogos de confirmación

## Integración con Backend

El frontend espera el backend corriendo en `VITE_API_URL` (default: `http://localhost:4000/api`).

Endpoints principales:
- `/auth/*` - Autenticación
- `/catalog/*` - Catálogo público
- `/owner/*` - Operaciones de workshop owner
- `/orders/*` - Pedidos
- `/workshops/*` - Talleres
