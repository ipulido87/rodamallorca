# Configuración de Stripe para RodaMallorca

## Variables de Entorno Requeridas en Railway

### Stripe Test Mode (Desarrollo)

```env
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_... # Tu clave secreta de Stripe Test Mode
STRIPE_PUBLISHABLE_KEY=pk_test_... # Tu clave pública de Stripe Test Mode

# Price ID del Producto (Test Mode)
STRIPE_PRICE_ID=price_1Sk8faRpqGtBNDFFkS2T4R4o

# Webhook Secret (Test Mode)
STRIPE_WEBHOOK_SECRET=whsec_... # Tu webhook secret de Stripe Test Mode
```

### Stripe Live Mode (Producción)

```env
# Stripe API Keys (Live Mode)
STRIPE_SECRET_KEY=sk_live_... # Tu clave secreta de Stripe Live Mode
STRIPE_PUBLISHABLE_KEY=pk_live_... # Tu clave pública de Stripe Live Mode

# Price ID del Producto (Live Mode)
# IMPORTANTE: Crear el producto en Live Mode y copiar el nuevo Price ID
STRIPE_PRICE_ID=price_... # Price ID del producto en Live Mode

# Webhook Secret (Live Mode)
STRIPE_WEBHOOK_SECRET=whsec_... # Tu webhook secret de Stripe Live Mode
```

---

## Producto en Stripe

**Nombre**: RodaMallorca - Plan Taller Pro
**Precio**: €14.90 EUR / mes
**Trial**: 7 días gratis
**Requiere tarjeta durante trial**: ✅ Sí

---

## Configuración del Webhook en Stripe

### URL del Webhook

**Test Mode**:
```
https://api.rodamallorca.es/api/subscriptions/webhook
```

**Live Mode**:
```
https://api.rodamallorca.es/api/subscriptions/webhook
```

### Eventos a Escuchar

Selecciona los siguientes eventos en el Dashboard de Stripe:

1. `checkout.session.completed` - Cuando el usuario completa el checkout
2. `customer.subscription.created` - Cuando se crea una suscripción
3. `customer.subscription.updated` - Cuando se actualiza una suscripción
4. `customer.subscription.deleted` - Cuando se cancela una suscripción
5. `invoice.payment_succeeded` - Cuando un pago es exitoso
6. `invoice.payment_failed` - Cuando un pago falla

---

## Otras Variables de Entorno Importantes

```env
# Frontend URL (para redirects después de Stripe)
FRONTEND_URL=https://rodamallorca.es

# Backend URL (para links de verificación de email)
BACKEND_URL=https://api.rodamallorca.es
```

**⚠️ IMPORTANTE**: `BACKEND_URL` NO debe terminar en `/api`

---

## Verificar Configuración

### 1. Verificar Price ID

En el Dashboard de Stripe:
1. Ve a **Products** → **RodaMallorca - Plan Taller Pro**
2. En la sección **Pricing**, haz clic en **€14.90 EUR**
3. Copia el **Price ID** (empieza con `price_...`)
4. Verifica que coincide con el configurado en Railway

### 2. Verificar Webhook

En el Dashboard de Stripe:
1. Ve a **Developers** → **Webhooks**
2. Verifica que el endpoint esté activo
3. Verifica que los 6 eventos estén seleccionados
4. Copia el **Signing secret** y configúralo en `STRIPE_WEBHOOK_SECRET`

### 3. Test en Producción

Usa las tarjetas de prueba de Stripe:
- **Éxito**: `4242 4242 4242 4242`
- **Falla**: `4000 0000 0000 0002`
- **Requiere 3D Secure**: `4000 0025 0000 3155`

---

## Troubleshooting

### Error: "No such price"

**Causa**: El `STRIPE_PRICE_ID` no existe en tu cuenta de Stripe o estás mezclando Test/Live mode.

**Solución**:
1. Verifica que estés usando el Price ID correcto del modo adecuado (Test o Live)
2. Verifica que `STRIPE_SECRET_KEY` sea del mismo modo que el Price ID

### Error: "No such customer"

**Causa**: Estás intentando crear un checkout con customer de Test Mode en Live Mode (o viceversa).

**Solución**: Asegúrate de que todas las keys de Stripe sean del mismo modo.

### Webhook no recibe eventos

**Causa**: URL incorrecta o webhook no configurado.

**Solución**:
1. Verifica que la URL del webhook sea exactamente: `https://api.rodamallorca.es/api/subscriptions/webhook`
2. Verifica que el webhook esté **activo** en Stripe
3. Revisa los logs del webhook en el Dashboard de Stripe
