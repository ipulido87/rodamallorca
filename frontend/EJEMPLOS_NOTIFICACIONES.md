# 🔔 Sistema de Notificaciones Global

Ahora puedes mostrar notificaciones desde **cualquier parte** de tu código sin necesidad de usar hooks.

## ✅ Uso en Componentes React

```typescript
import { notify } from '@/shared/services/notification-service'

export const MiComponente = () => {
  const handleSubmit = async () => {
    try {
      await createCustomer(data)
      notify.success('Cliente creado correctamente') // 🔥 Así de fácil!
    } catch (error) {
      notify.error('Error al crear cliente')
    }
  }

  return <button onClick={handleSubmit}>Crear</button>
}
```

## ✅ Uso en Servicios/Utils (fuera de React)

```typescript
// customer-service.ts
import { notify } from '@/shared/services/notification-service'
import { API } from '@/features/auth/services/auth-service'

export const createCustomer = async (data: CreateCustomerInput) => {
  try {
    const response = await API.post('/customers', data)
    notify.success('Cliente guardado') // 🔥 Funciona aquí también!
    return response.data
  } catch (error) {
    notify.error('Error al guardar cliente')
    throw error
  }
}
```

## ✅ Uso en Interceptores de Axios

```typescript
// auth-service.ts
import { notify } from '@/shared/services/notification-service'

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      notify.error('Sesión expirada') // 🔥 Notificación automática!
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 📚 API Completa

```typescript
notify.success('Operación exitosa')
notify.error('Algo salió mal', 8000) // Duración personalizada
notify.warning('Ten cuidado')
notify.info('Información útil')

// O genérico
notify.show('Mensaje', 'success', 5000)
```

## 🎯 Beneficios

- ✅ **No necesitas `useSnackbar()` en cada componente**
- ✅ **Funciona en servicios, utils, interceptores**
- ✅ **Código más limpio y menos verbose**
- ✅ **Compatible con el hook actual** (puedes usar ambos)

## 🔄 Migración (Opcional)

**Antes:**
```typescript
const { showSuccess, showError } = useSnackbar()
showSuccess('Cliente creado')
```

**Después:**
```typescript
import { notify } from '@/shared/services/notification-service'
notify.success('Cliente creado')
```

¡Mucho más simple! 🚀
