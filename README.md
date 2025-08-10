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


.
├─ .git/
├─ .gitignore
├─ package.json
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml            # (solo este lock en la raíz)
├─ README.md
├─ backend/
│  ├─ .env
│  ├─ .gitignore
│  ├─ package.json
│  ├─ prisma/
│  │  ├─ migrations/
│  │  └─ schema.prisma
│  ├─ src/
│  │  ├─ config/
│  │  ├─ index.ts
│  │  ├─ lib/
│  │  ├─ modules/
│  │  ├─ types/
│  │  ├─ utils/
│  │  └─ vendors/
│  └─ tsconfig.json
└─ frontend/
   ├─ .env
   ├─ eslint.config.js
   ├─ index.html
   ├─ package.json
   ├─ public/
   │  └─ vite.svg
   ├─ README.md
   ├─ src/
   │  ├─ api/
   │  ├─ App.css
   │  ├─ App.tsx
   │  ├─ assets/
   │  ├─ components/
   │  ├─ constants/
   │  ├─ contexts/
   │  ├─ hooks/
   │  ├─ index.css
   │  ├─ main.tsx
   │  ├─ pages/
   │  ├─ providers/
   │  ├─ services/
   │  ├─ theme/
   │  └─ vite-env.d.ts
   ├─ tsconfig.app.json
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   └─ vite.config.ts

