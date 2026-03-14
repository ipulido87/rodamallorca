# RodaMallorca Frontend

Web application for the bicycle workshop marketplace platform in Mallorca.

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
# From monorepo root
pnpm install

# Development (requires backend running on :4000)
pnpm --filter frontend dev

# Or from /frontend
cd frontend && pnpm dev

# Production build
pnpm --filter frontend build

# Tests
pnpm --filter frontend test

# Tests with coverage
pnpm --filter frontend test:coverage
```

## Environment Variables

Create `.env` in `/frontend` root:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Architecture

### Folder Structure

```
src/
├── __tests__/           # Tests organized by type
│   ├── auth/
│   ├── cart/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   └── services/
│
├── components/          # Shared UI components
│   ├── layout/          # MainLayout, PublicLayout, Sidebar
│   ├── notifications/
│   └── ...
│
├── features/            # Domain modules (feature-based)
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
├── pages/               # Standalone pages (Landing, Home, Profile)
│
├── providers/           # Global context providers
│   └── AppProviders.tsx
│
├── router/              # Route configuration
│   ├── AppRoutes.tsx    # Route definitions
│   ├── lazy-imports.ts  # Lazy imports by category
│   └── index.ts
│
├── shared/              # Shared code
│   ├── api/             # Centralized API client
│   ├── components/      # PageLoader, etc.
│   ├── constants/
│   ├── hooks/           # useSnackbar, useConfirmDialog
│   ├── schemas/         # Shared Zod schemas
│   ├── services/
│   ├── theme/
│   └── types/
│
└── App.tsx              # Entry point (13 lines)
```

### Key Patterns

#### 1. Feature-Based Architecture

Each feature is self-contained with its own structure:

```
features/products/
├── components/     # Feature-specific components
├── hooks/          # Feature-specific hooks
├── pages/          # Pages/views
├── services/       # API calls
├── types/          # TypeScript types
└── index.ts        # Module public API
```

#### 2. Centralized API Client

```typescript
// Always import from @/shared/api
import { API } from '@/shared/api'

// Client includes interceptors for:
// - Subscription errors (403 NO_ACTIVE_SUBSCRIPTION)
// - Email not verified (403 EMAIL_NOT_VERIFIED)
```

#### 3. Lazy Loading

Non-critical routes are loaded on demand:

```typescript
// router/lazy-imports.ts
const Dashboard = lazy(() =>
  import('../features/dashboard/index').then((m) => ({ default: m.Dashboard }))
)
```

#### 4. MUI Best Practices

```tsx
// ✅ Use Stack for flex layouts
<Stack direction="row" spacing={2} justifyContent="space-between">
  <Typography>Left</Typography>
  <Button>Right</Button>
</Stack>

// ❌ Avoid Box with display: flex
<Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server on :5173 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Tests with coverage report |

## Testing

Tests located in `src/__tests__/` with mirror structure:

```bash
# Run all tests
pnpm test

# With UI
pnpm test:ui

# Coverage (minimum 20%)
pnpm test:coverage
```

### Current Coverage

- **108 tests** passing
- Hooks: `useAuth`, `useCatalogSearch`
- Services: `catalog-service`
- Components: `RoleRoute`, `PrivateRoute`, `Cart`, `LoginForm`
- Schemas: Zod validations

## Roles and Routes

| Role | Available Routes |
|------|------------------|
| `USER` | `/home`, `/my-orders`, `/cart`, `/favorites`, `/profile` |
| `WORKSHOP_OWNER` | All above + `/dashboard`, `/my-workshops`, `/my-products`, `/billing/*` |
| `ADMIN` | All routes |

## Global State

- **AuthContext**: Authenticated user, login/logout
- **CartContext**: Shopping cart
- **SnackbarProvider**: Toast notifications
- **ConfirmDialogProvider**: Confirmation dialogs

## Backend Integration

Frontend expects backend running at `VITE_API_URL` (default: `http://localhost:4000/api`).

Main endpoints:
- `/auth/*` - Authentication
- `/catalog/*` - Public catalog
- `/owner/*` - Workshop owner operations
- `/orders/*` - Orders
- `/workshops/*` - Workshops
