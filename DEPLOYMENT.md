# 🚀 Guía de Deployment - Roda Mallorca

## 💰 Opción Más Barata (Gratis → $5-10/mes)

### Stack Recomendado:
- **Frontend**: Vercel (GRATIS)
- **Backend**: Railway.app (GRATIS $5 crédito, luego $5-10/mes)
- **Database**: Incluida en Railway o Neon.tech (GRATIS)
- **Imágenes**: Cloudinary (GRATIS 25GB)
- **Emails**: Resend.com (GRATIS 3000 emails/mes)

---

## 📋 Paso a Paso

### 1️⃣ Configurar Cloudinary (Imágenes)

1. **Crear cuenta**: https://cloudinary.com/users/register_free
2. **Obtener credenciales**: Dashboard → Settings → Access Keys
3. **Agregar a `.env`**:
   ```bash
   CLOUDINARY_CLOUD_NAME="tu_cloud_name"
   CLOUDINARY_API_KEY="123456789012345"
   CLOUDINARY_API_SECRET="tu_api_secret"
   ```

### 2️⃣ Configurar Resend (Emails)

1. **Crear cuenta**: https://resend.com/signup
2. **Obtener API Key**: Dashboard → API Keys → Create API Key
3. **Agregar dominio**:
   - Settings → Domains → Add Domain
   - Agregar registros DNS (MX, TXT) en tu proveedor de dominio
4. **Agregar a `.env`**:
   ```bash
   RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
   EMAIL_FROM="Roda Mallorca <noreply@tudominio.com>"
   ```

**📌 IMPORTANTE**: Mientras no tengas dominio verificado, usa `onboarding@resend.dev` como `EMAIL_FROM`.

### 3️⃣ Desplegar Backend en Railway

1. **Crear cuenta**: https://railway.app
2. **Nuevo proyecto**: New Project → Deploy from GitHub
3. **Conectar repo**: Autorizar GitHub y seleccionar `rodamallorca`
4. **Configurar**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Variables de entorno** (Settings → Variables):
   ```bash
   DATABASE_URL=<railway te da una automáticamente>
   JWT_SECRET=<genera uno seguro>
   FRONTEND_URL=https://tuapp.vercel.app
   GOOGLE_CLIENT_ID=<tu client id>
   GOOGLE_CLIENT_SECRET=<tu secret>
   GOOGLE_REDIRECT_URI=https://tubackend.railway.app/api/auth/google/callback
   GOOGLE_LOGIN_REDIRECT_URI=https://tubackend.railway.app/api/auth/google/login/callback
   CLOUDINARY_CLOUD_NAME=<tu cloud name>
   CLOUDINARY_API_KEY=<tu api key>
   CLOUDINARY_API_SECRET=<tu api secret>
   RESEND_API_KEY=<tu resend key>
   EMAIL_FROM="Roda Mallorca <noreply@tudominio.com>"
   NODE_ENV=production
   PORT=4000
   ```

6. **Desplegar**: Railway despliega automáticamente

### 4️⃣ Desplegar Frontend en Vercel

1. **Crear cuenta**: https://vercel.com/signup
2. **Import proyecto**: Import Git Repository → `rodamallorca`
3. **Configurar**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Variables de entorno** (Settings → Environment Variables):
   ```bash
   VITE_API_URL=https://tubackend.railway.app/api
   ```

5. **Desplegar**: Deploy

### 5️⃣ Actualizar Google OAuth

1. **Google Cloud Console**: https://console.cloud.google.com
2. **APIs & Services → Credentials**
3. **Editar OAuth 2.0 Client**:
   - Agregar URIs de producción:
     - `https://tubackend.railway.app/api/auth/google/callback`
     - `https://tubackend.railway.app/api/auth/google/login/callback`
   - Agregar dominio autorizado:
     - `https://tuapp.vercel.app`

---

## 🔄 Actualizaciones Futuras

### Backend:
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push
# Railway despliega automáticamente
```

### Frontend:
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push
# Vercel despliega automáticamente
```

---

## 💡 Alternativas si Railway se queda caro

### Opción 2: Todo en Vercel
- Frontend: Vercel (GRATIS)
- Backend: Vercel Serverless Functions (GRATIS hasta cierto uso)
- DB: Neon.tech PostgreSQL (GRATIS 0.5GB)

### Opción 3: Render.com
- Frontend + Backend: Render (GRATIS pero más lento)
- DB: Render PostgreSQL (GRATIS 1GB)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correcta en Railway
- Railway provee la base de datos automáticamente

### Error: "CORS"
- Asegúrate que `FRONTEND_URL` en backend coincida con tu dominio de Vercel

### Error: "Images not uploading"
- Verifica credenciales de Cloudinary
- Revisa que `cloudinaryStorage` esté configurado en tus rutas de upload

### Emails no llegan
- En desarrollo: Normal, usa Mailtrap
- En producción: Verifica dominio en Resend y registros DNS

---

## 📊 Costos Estimados

| Servicio | Plan Gratis | Plan Pagado |
|----------|-------------|-------------|
| Vercel (Frontend) | ✅ GRATIS | $20/mes (Pro) |
| Railway (Backend+DB) | $5 crédito | $5-10/mes |
| Cloudinary (Imágenes) | 25GB GRATIS | $89/mes (Plus) |
| Resend (Emails) | 3000/mes GRATIS | $20/mes (Pro) |
| **TOTAL** | **GRATIS** (primeros meses) | **$5-15/mes** |

---

## ✅ Checklist Pre-Deploy

- [ ] `.env` configurado con todas las variables
- [ ] Cloudinary cuenta creada y configurada
- [ ] Resend cuenta creada (o dominio verificado)
- [ ] Google OAuth URIs actualizados
- [ ] Build del frontend exitoso (`npm run build`)
- [ ] Backend compila sin errores
- [ ] Database migrations ejecutadas
- [ ] Variables de entorno en Railway/Vercel configuradas

---

## 🎯 Próximos Pasos Después del Deploy

1. **Configurar dominio custom** (Namecheap ~$10/año)
2. **Verificar dominio en Resend** para enviar emails reales
3. **Monitoreo**: Railway/Vercel tienen dashboards incluidos
4. **Analytics**: Google Analytics (gratis)
5. **Error tracking**: Sentry (gratis hasta 5k eventos/mes)
