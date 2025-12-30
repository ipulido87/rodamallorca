# 🎯 Configuración de Stripe para Suscripciones

Sistema de suscripciones mensuales de **14.50€/mes** con **7 días de prueba gratis**.

## 📋 Pasos de Configuración

### 1. Crear Cuenta en Stripe

1. Ve a [stripe.com/register](https://stripe.com/register)
2. Crea una cuenta (puedes usar modo test primero)
3. Completa la verificación de negocio

### 2. Crear Producto y Precio

En el Dashboard de Stripe:

1. Ve a **Productos** → **Añadir producto**
2. Nombre: `RodaMallorca - Plan Taller Pro`
3. Descripción: `Suscripción mensual para talleres de bicicletas`
4. Modelo de precio: **Recurrente**
5. Precio: **14.50 EUR**
6. Frecuencia: **Mensual**
7. Haz clic en **Guardar producto**
8. **COPIA EL ID DEL PRECIO** (empieza con `price_xxx`)

### 3. Obtener Claves API

En el Dashboard de Stripe:

1. Ve a **Desarrolladores** → **Claves API**
2. Copia la **Clave secreta** (empieza con `sk_test_` o `sk_live_`)
3. **NO COMPARTAS ESTA CLAVE** con nadie

### 4. Configurar Webhook

1. Ve a **Desarrolladores** → **Webhooks**
2. Haz clic en **Añadir endpoint**
3. URL del webhook: `https://TU-DOMINIO.railway.app/api/webhooks/stripe`
4. Selecciona estos eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Haz clic en **Añadir endpoint**
6. **COPIA EL SECRET DEL WEBHOOK** (empieza con `whsec_`)

### 5. Variables de Entorno en Railway

Agrega estas variables en Railway (Settings → Variables):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

### 6. Activar Cuenta Live (Producción)

Cuando estés listo para cobrar de verdad:

1. Completa la verificación de tu negocio en Stripe
2. Activa tu cuenta (Stripe te guiará)
3. Cambia las claves de `test` a `live`:
   - `sk_test_xxx` → `sk_live_xxx`
   - Crea nuevo producto en modo live
   - Actualiza `STRIPE_PRICE_ID`
   - Actualiza webhook con nueva secret

## 🧪 Testing en Modo Test

### Tarjetas de Prueba

Usa estas tarjetas en modo test:

```
✅ Éxito:
   Número: 4242 4242 4242 4242
   Fecha: Cualquier fecha futura
   CVC: Cualquier 3 dígitos

❌ Fallo (pago rechazado):
   Número: 4000 0000 0000 0002

🔄 Requiere autenticación:
   Número: 4000 0025 0000 3155
```

### Simular Eventos

En el Dashboard de Stripe (modo test):

1. Ve a **Eventos**
2. Puedes enviar eventos manualmente para probar webhooks
3. O usa el CLI de Stripe: `stripe trigger`

## 🚀 Cómo Funciona el Flujo

### Para el Usuario (Dueño de Taller):

1. **Registra su taller** → 7 días de prueba GRATIS
2. Durante el trial puede usar TODO
3. Día 6: Recibe notificación para suscribirse
4. Día 7: Si no se suscribe, taller se bloquea (no se elimina)
5. Puede suscribirse en cualquier momento en `/pricing`
6. Pago automático cada mes el mismo día
7. Puede cancelar cuando quiera desde el portal

### Para ti (Admin):

1. Recibes notificación de cada nueva suscripción
2. Los webhooks actualizan automáticamente el estado
3. Puedes ver todas las suscripciones en Stripe Dashboard
4. Facturas automáticas generadas por Stripe
5. Cobros automáticos el mismo día cada mes

## 💰 Ingresos Esperados

```
Precio: 14.50€/mes
- Comisión Stripe: ~0.47€ (1.5% + 0.25€)
- Neto por taller: ~14.03€/mes
- Con 10 talleres: ~140€/mes
- Con 50 talleres: ~700€/mes
- Con 100 talleres: ~1,400€/mes
```

## 📊 Monitoreo

### En Stripe Dashboard puedes ver:

- 💳 Pagos exitosos/fallidos
- 📈 MRR (Monthly Recurring Revenue)
- 📉 Churn rate (tasa de cancelación)
- 👥 Suscriptores activos
- 💰 Ingresos del mes
- 📧 Emails enviados automáticamente

### En tu App:

- Dashboard de estadísticas integrado
- Estado de cada taller en tiempo real
- Webhooks procesan eventos automáticamente

## 🔧 Troubleshooting

### "Webhook signature verification failed"

- Verifica que `STRIPE_WEBHOOK_SECRET` esté correcto
- Asegúrate de que el webhook apunte a la URL correcta
- En Railway, debe ser: `https://TU-DOMINIO.railway.app/api/webhooks/stripe`

### "Price not found"

- Verifica que `STRIPE_PRICE_ID` sea correcto
- Debe empezar con `price_`
- Asegúrate de usar el ID del precio, no del producto

### "Customer already has a subscription"

- Un taller solo puede tener una suscripción
- Si necesitas cambiar el plan, cancela y crea una nueva

### Pagos fallan en producción

- Verifica que tu cuenta de Stripe esté activada
- Completa la verificación de negocio
- Asegúrate de usar claves `live`, no `test`

## 🎨 Customización

### Cambiar Precio

1. Crea nuevo precio en Stripe Dashboard
2. Copia el nuevo `price_id`
3. Actualiza `STRIPE_PRICE_ID` en Railway
4. Redeploy si es necesario

### Cambiar Período de Prueba

En `backend/src/modules/subscriptions/infrastructure/stripe.config.ts`:

```typescript
export const TRIAL_PERIOD_DAYS = 7 // Cambia esto a los días que quieras
```

### Personalizar Emails

Los emails los envía Stripe automáticamente. Puedes personalizarlos en:

1. Stripe Dashboard → **Settings** → **Emails**
2. Personaliza plantillas de emails
3. Agrega tu logo y colores

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Railway
2. Verifica eventos en Stripe Dashboard → Eventos
3. Prueba con tarjetas de test primero
4. Contacta a soporte de Stripe (muy buenos)

---

## ✅ Checklist Final

Antes de lanzar en producción:

- [ ] Cuenta de Stripe verificada y activada
- [ ] Producto creado en modo live
- [ ] Precio configurado (14.50€/mes)
- [ ] Webhook configurado y funcionando
- [ ] Variables de entorno en Railway actualizadas
- [ ] Probado flujo completo en modo test
- [ ] Emails de Stripe personalizados
- [ ] Logo y branding configurados
- [ ] Términos y condiciones actualizados
- [ ] Política de cancelación clara

¡Listo para generar ingresos! 🚀💰
