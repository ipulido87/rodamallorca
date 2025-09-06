# 🛵 Rodamallorca

**Rodamallorca** es una plataforma de alquiler colaborativo de vehículos (motos, bicis, patinetes, etc.) entre particulares en Mallorca.  
Es como el "Airbnb de la movilidad alternativa".

## 🚀 Tecnologías

- 🧠 **Monorepo con PNPM Workspaces**
- 🖥️ **Frontend**: React + TypeScript + Material UI + Vite
- ⚙️ **Backend**: Node.js + Express + TypeScript + Arquitectura Hexagonal + Microservicios
- 🛡️ Autenticación JWT
- 📦 API REST
- 🔐 Seguridad con CORS, dotenv, bcrypt, etc.

## ▶️ Scripts

### Backend

```bash
cd backend
pnpm install
pnpm run dev


```

backend/
├── prisma/
│ ├── migrations/
│ ├── schema.prisma
│ └── seed.ts
├── src/
│ ├── modules/
│ │ ├── auth/ ✅ COMPLETO
│ │ │ ├── application/
│ │ │ │ ├── login-user.ts
│ │ │ │ ├── register-user.ts
│ │ │ │ └── login-with-google.ts
│ │ │ ├── domain/
│ │ │ │ └── repositories/
│ │ │ │ └── user-repository.ts
│ │ │ ├── infrastructure/
│ │ │ │ ├── adapters/
│ │ │ │ │ ├── email/email-service.ts
│ │ │ │ │ ├── jwt/jwt.service.ts
│ │ │ │ │ └── oidc/google-client.ts
│ │ │ │ └── persistence/prisma/
│ │ │ │ └── user-repository-prisma.ts
│ │ │ └── interfaces/
│ │ │ ├── controllers/
│ │ │ │ └── auth.controller.ts
│ │ │ ├── http/
│ │ │ │ ├── auth.routes.ts
│ │ │ │ └── schemas/
│ │ │ │ ├── login.schema.ts
│ │ │ │ ├── register.schema.ts
│ │ │ │ └── verify-code.schema.ts
│ │ │ └── middlewares/
│ │ │ ├── auth.middleware.ts
│ │ │ ├── require-owner.ts
│ │ │ └── validate-body.ts
│ │ ├── workshops/ ✅ MOVIDO, FALTA COMPLETAR
│ │ │ ├── application/
│ │ │ │ └── create-workshop.ts
│ │ │ ├── domain/
│ │ │ │ └── repositories/
│ │ │ │ └── workshop-repository.ts
│ │ │ ├── infrastructure/
│ │ │ │ └── persistence/prisma/
│ │ │ │ └── workshop-repository-prisma.ts
│ │ │ └── interfaces/
│ │ │ └── http/
│ │ │ └── workshop.routes.ts (era owner.routes.ts)
│ │ ├── products/ ✅ MOVIDO, FALTA COMPLETAR
│ │ │ ├── application/
│ │ │ │ └── create-product.ts
│ │ │ ├── domain/
│ │ │ │ └── repositories/
│ │ │ │ └── product-repository.ts
│ │ │ ├── infrastructure/
│ │ │ │ └── persistence/prisma/
│ │ │ │ └── product-repository-prisma.ts (⚠️ IMPLEMENTACIÓN VACÍA)
│ │ │ └── interfaces/
│ │ │ └── http/
│ │ │ └── product.routes.ts
│ │ └── catalog/ ✅ MOVIDO, FALTA SEPARAR
│ │ └── interfaces/
│ │ └── http/
│ │ └── catalog.routes.ts (contiene workshops + products)
│ ├── config/
│ │ └── config.ts
│ ├── lib/
│ │ └── prisma.ts
│ ├── types/
│ │ └── express/
│ │ └── index.d.ts
│ ├── utils/
│ │ ├── async-handler.ts
│ │ └── sanitize-user.ts
│ ├── vendors/
│ │ └── oidc.ts
│ └── index.ts ✅ IMPORTS CORREGIDOS
├── .env
├── package.json
└── tsconfig.json

```

```
