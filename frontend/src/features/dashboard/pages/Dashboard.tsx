// pages/dashboard.tsx

import {
  Add,
  Analytics,
  Business,
  Inventory,
  Message,
  Visibility,
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

  // Datos mock para actividad reciente
  const metrics = {
    totalWorkshops: workshops?.length || 0,
    totalProducts: 3,
    publishedProducts: 1,
    draftProducts: 2,
    weeklyViews: 47,
    pendingMessages: 2,
  }

  const recentActivity = [
    {
      action: 'Producto publicado',
      item: 'Shimano XT Derailleur',
      time: '2 horas',
    },
    { action: 'Nueva consulta', item: 'Frenos Shimano Deore', time: '5 horas' },
    { action: 'Taller actualizado', item: 'Ciclos Palma', time: '1 día' },
  ]

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
          trend={{ value: '+2 esta semana', isPositive: true }}
        />

        <MetricCard
          title="Visitas"
          value={metrics.weeklyViews}
          subtitle="Esta semana"
          icon={<Visibility />}
          color="info"
          trend={{ value: '+23%', isPositive: true }}
        />

        <MetricCard
          title="Consultas"
          value={metrics.pendingMessages}
          subtitle="Pendientes de responder"
          icon={<Message />}
          color="warning"
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
                  title="Configurar Taller"
                  description="Actualizar información del taller"
                  icon={<Business />}
                  onClick={() => navigate('/create-workshop')}
                  color="secondary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Actividad Reciente
              </Typography>
              <Stack spacing={2}>
                {recentActivity.map((activity, index) => (
                  <Box key={index}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}
                      >
                        {activity.action.includes('Producto') ? (
                          <Inventory fontSize="small" />
                        ) : activity.action.includes('consulta') ? (
                          <Message fontSize="small" />
                        ) : (
                          <Business fontSize="small" />
                        )}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.item}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Stack>
                    {index < recentActivity.length - 1 && (
                      <Box
                        sx={{ height: 1, bgcolor: 'divider', mx: 2, my: 1 }}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Status Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Estado del Taller
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Perfil completado
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  85%
                </Typography>
              </Stack>
              <Box
                sx={{
                  width: '100%',
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    width: '85%',
                    bgcolor: 'success.main',
                    height: 8,
                    borderRadius: 1,
                  }}
                />
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Completa tu perfil para aparecer mejor posicionado en las
              búsquedas
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
