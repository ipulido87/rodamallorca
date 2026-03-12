// pages/dashboard.tsx

import {
  Add,
  Analytics,
  Business,
  Inventory,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useAuth } from '../../auth/hooks/useAuth'
import { getMyWorkshops } from '../../workshops/services/workshop-service'
import { getWorkshopStats } from '../../billing/services/stats-service'
import { StatsCards } from '../../billing/components/stats-cards'
import { SalesChart } from '../../billing/components/sales-chart'
import { StripeConnectCard } from '../../payments/components/stripe-connect-card'
import API from '../../../shared/api/api-client'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'info'
  trend?: {
    value: string
    isPositive: boolean
  }
}

// ✅ Memoizado para evitar re-renders innecesarios
const MetricCard = memo(({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
}: MetricCardProps) => (
  <Card sx={{ height: '100%', flex: 1 }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {trend && (
          <Chip
            label={trend.value}
            size="small"
            color={trend.isPositive ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      </Stack>
    </CardContent>
  </Card>
))

MetricCard.displayName = 'MetricCard'

interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color?: 'primary' | 'secondary'
}

// ✅ Memoizado para evitar re-renders innecesarios
const QuickAction = memo(({
  title,
  description,
  icon,
  onClick,
  color = 'primary',
}: QuickActionProps) => (
  <Card
    sx={{
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      flex: 1,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      },
    }}
    onClick={onClick}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: `${color}.main`, color: 'white' }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
))

QuickAction.displayName = 'QuickAction'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch user's workshops
  const { data: workshops, isLoading: workshopsLoading } = useSWR(
    '/owner/workshops',
    getMyWorkshops,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  // Select first workshop (or allow selection in future)
  const selectedWorkshop = workshops?.[0]

  // Fetch stats for the selected workshop
  const { data: stats, isLoading: statsLoading } = useSWR(
    selectedWorkshop ? `/owner/billing/workshops/${selectedWorkshop.id}/stats` : null,
    () => selectedWorkshop ? getWorkshopStats(selectedWorkshop.id) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  // Fetch real product data for the selected workshop
  const { data: myProducts } = useSWR(
    selectedWorkshop ? `/owner/products/mine?workshopId=${selectedWorkshop.id}` : null,
    () => selectedWorkshop ? API.get('/owner/products/mine').then(r => r.data) : null,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )

  const metrics = {
    totalWorkshops: workshops?.length || 0,
    totalProducts: myProducts?.length || 0,
    publishedProducts: myProducts?.filter((p: { status: string }) => p.status === 'PUBLISHED').length || 0,
    draftProducts: myProducts?.filter((p: { status: string }) => p.status === 'DRAFT').length || 0,
  }

  if (workshopsLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando dashboard...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Panel de Control
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido de nuevo, {user?.name}. Aquí tienes un resumen de tu actividad.
        </Typography>
        {selectedWorkshop && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mostrando estadísticas de: <strong>{selectedWorkshop.name}</strong>
          </Typography>
        )}
      </Box>

      {/* Billing Statistics Section */}
      {stats && !statsLoading && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📊 Estadísticas de Facturación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Resumen financiero de tu taller
          </Typography>

          <Stack spacing={3}>
            <StatsCards stats={stats} />
            <SalesChart stats={stats} />
          </Stack>
        </Box>
      )}

      {/* Stripe Connect Section */}
      {selectedWorkshop && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            💳 Pagos de Productos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Conecta tu cuenta de Stripe para vender productos y recibir pagos
          </Typography>
          <StripeConnectCard workshopId={selectedWorkshop.id} />
        </Box>
      )}

      {/* General Metrics Row */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        📈 Métricas Generales
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4, mt: 2 }}>
        <MetricCard
          title="Talleres"
          value={metrics.totalWorkshops}
          subtitle="Talleres registrados"
          icon={<Business />}
          color="primary"
        />

        <MetricCard
          title="Productos"
          value={metrics.totalProducts}
          subtitle={`${metrics.publishedProducts} publicados, ${metrics.draftProducts} borradores`}
          icon={<Inventory />}
          color="success"
        />
      </Stack>

      {/* Main Content Row */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Quick Actions */}
        <Box sx={{ flex: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Acciones Rápidas
              </Typography>

              {/* Actions Row 1 */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <QuickAction
                  title="Crear Producto"
                  description="Añadir un nuevo producto al catálogo"
                  icon={<Add />}
                  onClick={() => navigate('/create-product')}
                  color="primary"
                />
                <QuickAction
                  title="Gestionar Productos"
                  description="Ver, editar y organizar tus productos"
                  icon={<Inventory />}
                  onClick={() => navigate('/my-products')}
                  color="secondary"
                />
              </Stack>

              {/* Actions Row 2 */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <QuickAction
                  title="Ver Analytics"
                  description="Estadísticas y rendimiento detallado"
                  icon={<Analytics />}
                  onClick={() => navigate('/analytics')}
                  color="primary"
                />
                <QuickAction
                  title={workshops && workshops.length > 0 ? "Configurar Taller" : "Crear Tu Taller"}
                  description={workshops && workshops.length > 0 ? "Actualizar información del taller" : "Configura tu primer taller"}
                  icon={<Business />}
                  onClick={() => {
                    if (workshops && workshops.length > 0) {
                      navigate(`/edit-workshop/${workshops[0].id}`)
                    } else {
                      navigate('/create-workshop')
                    }
                  }}
                  color="secondary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity placeholder */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Actividad Reciente
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                La actividad de tu taller aparecerá aquí
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Status Section */}
      {selectedWorkshop && (() => {
        const fields = [
          selectedWorkshop.name,
          selectedWorkshop.description,
          selectedWorkshop.address,
          selectedWorkshop.city,
          selectedWorkshop.phone,
          selectedWorkshop.logoOriginal,
        ]
        const filled = fields.filter(Boolean).length
        const pct = Math.round((filled / fields.length) * 100)
        return (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Estado del Taller
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Perfil completado
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {pct}%
                    </Typography>
                  </Stack>
                  <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, mt: 1 }}>
                    <Box sx={{ width: `${pct}%`, bgcolor: pct === 100 ? 'success.main' : 'warning.main', height: 8, borderRadius: 1 }} />
                  </Box>
                </Box>
                {pct < 100 && (
                  <Typography variant="caption" color="text.secondary">
                    Completa tu perfil para aparecer mejor posicionado en las búsquedas
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        )
      })()}
    </Container>
  )
}
