# RodaMallorca

Marketplace platform for bicycle workshops in Mallorca. Connects users with local bike shops for purchases, rentals, and repair services.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | React 18, TypeScript, Vite, Material UI, SWR |
| **Backend** | Node.js, Express 5, TypeScript, Prisma, PostgreSQL |
| **Payments** | Stripe (Checkout, Subscriptions, Connect) |
| **Auth** | JWT, Google OAuth |
| **Media** | Cloudinary |

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd rodamallorca
pnpm install

# Setup backend
cd backend
cp .env.example .env  # Configure environment variables
pnpm prisma generate
pnpm prisma db push
pnpm seed              # Optional: seed database

# Run both (from root)
cd ..
pnpm dev
```

## Project Structure

```
rodamallorca/
├── backend/           # REST API (Express + Prisma)
│   ├── src/
│   │   ├── modules/   # Domain modules (hexagonal architecture)
│   │   ├── lib/       # Shared infrastructure
│   │   └── config/    # App configuration
│   ├── prisma/        # Database schema & migrations
│   └── README.md      # Backend documentation
│
├── frontend/          # Web app (React + Vite)
│   ├── src/
│   │   ├── features/  # Feature modules
│   │   ├── router/    # Route configuration
│   │   └── shared/    # Shared code
│   └── README.md      # Frontend documentation
│
└── package.json       # Monorepo scripts
```

## Available Scripts

```bash
# Development (runs both frontend and backend)
pnpm dev

# Individual services
pnpm --filter frontend dev    # Frontend on :5173
pnpm --filter backend dev     # Backend on :4000

# Build
pnpm --filter frontend build
pnpm --filter backend build

# Tests
pnpm --filter frontend test
pnpm --filter backend test
```

## Documentation

- [Frontend README](./frontend/README.md) - Architecture, patterns, components
- [Backend README](./backend/README.md) - API endpoints, hexagonal architecture

## Features

### For Users
- Browse bicycle products and workshops
- Rent bikes with calendar availability
- Place orders and track status
- Save favorite workshops
- Google OAuth login

### For Workshop Owners
- Manage workshops and products
- Handle orders and rentals
- Invoice generation (PDF)
- Stripe Connect payouts
- Customer management

## Environment Variables

See individual READMEs for complete lists:
- [Backend environment variables](./backend/README.md#environment-variables)
- [Frontend environment variables](./frontend/README.md#environment-variables)
