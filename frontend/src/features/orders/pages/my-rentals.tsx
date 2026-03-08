import { Cancel, TwoWheeler, Visibility, CalendarMonth, Info } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useAuth } from '../../auth/hooks/useAuth'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import {
  cancelOrder,
  getMyOrders,
  getOrderStatusColor,
  getOrderStatusLabel,
  type Order,
  type OrderStatus,
} from '../services/order-service'
import { isAxiosError } from 'axios'

export const MyRentals = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useSnackbar()

  const [error, setError] = useState('')
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    order: Order | null
  }>({
    open: false,
    order: null,
  })

  // SWR: Cargar pedidos del usuario con cache y revalidación
  const { data: allOrders = [], isLoading: loading, mutate } = useSWR<Order[]>(
    user?.id ? `/users/${user.id}/orders` : null,
    () => getMyOrders(user!.id),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  // Filtrar solo alquileres
  const rentals = allOrders.filter((order) => order.type === 'RENTAL')

  const handleCancelClick = (order: Order) => {
    setCancelDialog({ open: true, order })
  }

  const handleCancelConfirm = async () => {
    if (!cancelDialog.order) return

    try {
      setCancelLoading(cancelDialog.order.id)
      setError('')

      await cancelOrder(cancelDialog.order.id)

      mutate(
        allOrders.map((o) =>
          o.id === cancelDialog.order?.id
            ? { ...o, status: 'CANCELLED' as OrderStatus }
            : o
        ),
        false
      )

      setCancelDialog({ open: false, order: null })
      showSuccess('✓ Alquiler cancelado correctamente')
    } catch (err) {
      console.error('❌ [MY_RENTALS] Error cancelando alquiler:', err)

      let errorMessage = 'Error al cancelar el alquiler'

      if (isAxiosError(err)) {
        const data = err.response?.data as Record<string, unknown> | undefined
        const backendMessage = (typeof data?.message === 'string' ? data.message : undefined) ||
          (typeof data?.error === 'string' ? data.error : undefined)

        if (backendMessage) {
          if (backendMessage.includes('completado') || backendMessage.includes('cancelado')) {
            errorMessage = '⚠️ Este alquiler ya está en estado final y no puede ser modificado'
          } else if (backendMessage.includes('no se puede')) {
            errorMessage = `⚠️ ${backendMessage}`
          } else {
            errorMessage = backendMessage
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      showError(errorMessage)
      setError(errorMessage)
    } finally {
      setCancelLoading(null)
    }
  }

  const handleCancelDialogClose = () => {
    setCancelDialog({ open: false, order: null })
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00€'
    }
    return `${(price / 100).toFixed(2)}€`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const getRentalStatus = (order: Order) => {
    if (order.status === 'CANCELLED') return 'Cancelado'
    if (order.status === 'COMPLETED') return 'Completado'

    if (!order.items || order.items.length === 0) return 'Pendiente'

    const startDate = order.items[0].rentalStartDate
      ? new Date(order.items[0].rentalStartDate)
      : null
    const endDate = order.items[0].rentalEndDate
      ? new Date(order.items[0].rentalEndDate)
      : null
    const now = new Date()

    if (startDate && endDate) {
      if (now < startDate) {
        return 'Próximo'
      } else if (now >= startDate && now <= endDate) {
        return 'En uso'
      } else if (now > endDate) {
        return 'Finalizado - Pendiente devolución'
      }
    }

    return getOrderStatusLabel(order.status)
  }

  const getRentalStatusColor = (order: Order): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const status = getRentalStatus(order)

    if (status === 'Cancelado') return 'error'
    if (status === 'Completado') return 'success'
    if (status === 'En uso') return 'primary'
    if (status === 'Próximo') return 'info'
    if (status.includes('Finalizado')) return 'warning'

    return getOrderStatusColor(order.status)
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando tus alquileres...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mis Alquileres
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus alquileres de bicicletas
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Lista de alquileres */}
        {rentals.length === 0 ? (
          <Box textAlign="center" py={10}>
            <TwoWheeler
              sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No tienes alquileres todavía
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Explora nuestro catálogo de bicicletas disponibles para alquilar
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/alquileres')}
            >
              Ver Bicicletas Disponibles
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {rentals.map((order) => {
              const item = order.items?.[0]
              return (
                <Card key={order.id}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={1}
                        >
                          <TwoWheeler color="primary" />
                          <Typography variant="h6">
                            Alquiler #{order.id.slice(0, 8)}
                          </Typography>
                        </Stack>

                        {item && (
                          <>
                            <Typography variant="body1" fontWeight={600} mb={1}>
                              {item.description || 'Bicicleta'}
                            </Typography>

                            {/* Fechas de alquiler */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {item.rentalStartDate && formatDate(item.rentalStartDate)} -{' '}
                                {item.rentalEndDate && formatDate(item.rentalEndDate)}
                                {item.rentalDays && ` (${item.rentalDays} ${item.rentalDays === 1 ? 'día' : 'días'})`}
                              </Typography>
                            </Box>

                            {/* Depósito */}
                            {item.depositPaid && item.depositPaid > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Info sx={{ fontSize: 18, color: 'info.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  Depósito: {formatPrice(item.depositPaid)} (reembolsable)
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          Pedido realizado: {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={getRentalStatus(order)}
                          color={getRentalStatusColor(order)}
                          size="small"
                        />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatPrice(order.totalAmount)}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Ver Detalles
                      </Button>
                      {order.status !== 'COMPLETED' &&
                        order.status !== 'CANCELLED' && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleCancelClick(order)}
                          >
                            Cancelar Alquiler
                          </Button>
                        )}
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}

        {/* Modal de confirmación de cancelación */}
        <Dialog
          open={cancelDialog.open}
          onClose={handleCancelDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar cancelación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres cancelar el alquiler #
              {cancelDialog.order?.id.slice(0, 8)}?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDialogClose}
              disabled={cancelLoading !== null}
            >
              No, Mantener Alquiler
            </Button>
            <Button
              onClick={handleCancelConfirm}
              color="error"
              variant="contained"
              disabled={cancelLoading !== null}
            >
              {cancelLoading ? 'Cancelando...' : 'Sí, Cancelar Alquiler'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
