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

---

## 📁 Estructura

rodamallorca/
├── backend/ # Microservicio de autenticación (por ahora)
│ ├── src/
│ │ ├── modules/
│ │ │ └── auth/
│ │ │ ├── application/
│ │ │ ├── domain/
│ │ │ ├── infraestructure/
│ │ │ └── interfaces/
│ │ └── index.ts
│ ├── tsconfig.json
│ └── package.json
├── frontend/ # App en React (por desarrollar)
├── .gitignore
├── pnpm-workspace.yaml
├── package.json
└── README.md



---

## ▶️ Scripts

### Backend

```bash
cd backend
pnpm install
pnpm run dev
