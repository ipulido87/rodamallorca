import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth'

interface RoleRouteProps {
  children: ReactNode
  requiredRole: 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'
  fallback?: string
}

export const RoleRoute = ({
  children,
  requiredRole,
  fallback = '/home',
}: RoleRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth()

  console.log('🛡️ [ROLE-ROUTE] Verificación:', {
    userEmail: user?.email,
    userRole: user?.role,
    requiredRole,
    isAuthenticated,
    loading,
    fallback,
  })

  if (loading) {
    console.log('⏳ [ROLE-ROUTE] Loading... mostrando null')
    return null
  }

  if (!isAuthenticated) {
    console.log('❌ [ROLE-ROUTE] No autenticado → redirigiendo a /login')
    return <Navigate to="/login" replace />
  }

  if (user?.role !== requiredRole) {
    console.log(`❌ [ROLE-ROUTE] Rol incorrecto (${user?.role} !== ${requiredRole}) → redirigiendo a ${fallback}`)
    return <Navigate to={fallback} replace />
  }

  console.log('✅ [ROLE-ROUTE] Acceso permitido')
  return <>{children}</>
}
