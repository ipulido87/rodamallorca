# RodaMallorca Backend

REST API for the bicycle workshop marketplace platform in Mallorca.

## Tech Stack

- **Node.js** + TypeScript
- **Express 5** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Jest** - Testing
- **Stripe** - Payments
- **Cloudinary** - Media storage
- **JWT** - Authentication

## Quick Start

```bash
# From monorepo root
pnpm install

# Setup database
cd backend
cp .env.example .env  # Configure your env vars
pnpm prisma generate
pnpm prisma db push

# Seed database (optional)
pnpm seed

# Development
pnpm dev

# Or from monorepo root
pnpm --filter backend dev
```

## Environment Variables

Create `.env` in `/backend` root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rodamallorca"

# Auth
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App
FRONTEND_URL="http://localhost:5173"
PORT=4000
```

## Architecture

### Hexagonal Architecture (Ports & Adapters)

Each module follows clean architecture principles:

```
src/modules/{module}/
├── application/        # Use cases / business logic
│   ├── {module}.service.ts
│   └── dto/
├── domain/             # Entities & business rules
│   ├── {module}.entity.ts
│   └── {module}.repository.ts  (port/interface)
├── infrastructure/     # External adapters
│   └── prisma-{module}.repository.ts
└── interfaces/         # Controllers / HTTP layer
    └── {module}.controller.ts
```

### Folder Structure

```
src/
├── __tests__/          # Integration & unit tests
│   ├── auth/
│   ├── orders/
│   ├── payments/
│   └── ...
│
├── config/             # App configuration
│   ├── cors.ts
│   ├── env.ts
│   └── swagger.ts
│
├── lib/                # Shared infrastructure
│   ├── prisma/         # Prisma client
│   ├── stripe/         # Stripe client
│   ├── cloudinary/     # Cloudinary client
│   └── ...
│
├── modules/            # Domain modules
│   ├── auth/
│   ├── billing/
│   ├── catalog/
│   ├── customers/
│   ├── favorites/
│   ├── media/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   ├── products/
│   ├── rentals/
│   ├── reviews/
│   ├── services/
│   ├── subscriptions/
│   └── workshops/
│
├── services/           # Shared services
├── utils/              # Utility functions
└── index.ts            # App entry point
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled app |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Tests with coverage report |
| `pnpm seed` | Seed database |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/google` | Google OAuth |

### Catalog (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/catalog/products` | Search products |
| GET | `/api/catalog/workshops` | Search workshops |
| GET | `/api/catalog/services` | Search services |

### Workshop Owner
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/workshops` | List my workshops |
| POST | `/api/owner/workshops` | Create workshop |
| GET | `/api/owner/products/mine` | List my products |
| POST | `/api/owner/products` | Create product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/user/:userId` | User's orders |
| GET | `/api/orders/workshop/:workshopId` | Workshop orders |
| PATCH | `/api/orders/:id/status` | Update order status |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-checkout` | Create Stripe checkout |
| POST | `/api/webhooks/stripe` | Stripe webhooks |

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Critical payment tests only
pnpm test:critical
```

### Test Structure

```
__tests__/
├── auth/
│   └── auth.service.test.ts
├── orders/
│   └── order.service.test.ts
├── payments/
│   ├── payment.service.test.ts
│   └── webhook-handler.test.ts
└── ...
```

## Database

### Prisma Commands

```bash
# Generate client after schema changes
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Create migration
pnpm prisma migrate dev --name migration_name

# Open Prisma Studio
pnpm prisma studio

# Seed database
pnpm seed
```

## Roles

| Role | Permissions |
|------|-------------|
| `USER` | Browse catalog, place orders, manage favorites |
| `WORKSHOP_OWNER` | All above + manage workshops, products, orders |
| `ADMIN` | All permissions |

## Stripe Integration

- **Checkout Sessions** - Product purchases
- **Subscriptions** - Workshop owner plans
- **Connect** - Workshop payouts
- **Webhooks** - Payment confirmations
