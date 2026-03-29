import { Cancel, Receipt, ShoppingBag, Visibility, TwoWheeler, CalendarMonth } from '@mui/icons-material'
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
import { useTranslation } from 'react-i18next'

export const MyOrders = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useSnackbar()

  console.log('🔐 [MYORDERS] Usuario al cargar componente:', user)
  console.log('🔐 [MYORDERS] User ID:', user?.id)

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

  // Filtrar para excluir alquileres (solo productos y reparaciones)
  const orders = allOrders.filter((order) => order.type !== 'RENTAL')

  const handleCancelClick = (order: Order) => {
    setCancelDialog({ open: true, order })
  }

  const handleCancelConfirm = async () => {
    if (!cancelDialog.order) return

    try {
      setCancelLoading(cancelDialog.order.id)
      setError('') // Limpiar errores previos

      await cancelOrder(cancelDialog.order.id)

      // Optimistic update: actualizar cache inmediatamente
      mutate(
        allOrders.map((o) =>
          o.id === cancelDialog.order?.id
            ? { ...o, status: 'CANCELLED' as OrderStatus }
            : o
        ),
        false
      )

      setCancelDialog({ open: false, order: null })
      showSuccess(t('orders.orderCancelled'))
    } catch (err) {
      console.error('❌ [MY_ORDERS] Error cancelando pedido:', err)

      let errorMessage = t('orders.errorCancellingOrder')

      if (isAxiosError(err)) {
        const data = err.response?.data as Record<string, unknown> | undefined
        const backendMessage = (typeof data?.message === 'string' ? data.message : undefined) ||
          (typeof data?.error === 'string' ? data.error : undefined)

        if (backendMessage) {
          // Mejorar mensajes específicos
          if (backendMessage.includes('completado') || backendMessage.includes('cancelado')) {
            errorMessage = t('orders.orderFinalState')
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

  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getOrderTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      PRODUCT_ORDER: t('orders.typeProduct'),
      SERVICE_REPAIR: t('orders.typeRepair'),
      RENTAL: t('orders.typeRental'),
    }
    return labels[type || 'PRODUCT_ORDER']
  }

  const getOrderTypeColor = (type?: string): 'default' | 'primary' | 'secondary' => {
    const colors: Record<string, 'default' | 'primary' | 'secondary'> = {
      PRODUCT_ORDER: 'default',
      SERVICE_REPAIR: 'secondary',
      RENTAL: 'primary',
    }
    return colors[type || 'PRODUCT_ORDER']
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('orders.loadingOrders')}
          </Typography>
        </Box>
      </Container>
    )
  }

  console.log('🔐 Usuario en frontend:', user)
  console.log('🔐 User ID en frontend:', user?.id)

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('orders.myOrders')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('orders.myOrdersSubtitle')}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <Box textAlign="center" py={10}>
            <ShoppingBag
              sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h5" color="text.secondary">
              {t('orders.noOrdersYet')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
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
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={1}
                      >
                        {order.type === 'RENTAL' ? <TwoWheeler /> : <Receipt />}
                        <Typography variant="h6">
                          {t('orders.orderPrefix')} #{order.id.slice(0, 8)}
                        </Typography>
                        <Chip
                          size="small"
                          label={getOrderTypeLabel(order.type)}
                          color={getOrderTypeColor(order.type)}
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      {/* Mostrar fechas de alquiler si es un pedido de tipo RENTAL */}
                      {order.type === 'RENTAL' && order.items && order.items.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {order.items[0].rentalStartDate && formatDate(order.items[0].rentalStartDate)} -{' '}
                            {order.items[0].rentalEndDate && formatDate(order.items[0].rentalEndDate)}
                            {order.items[0].rentalDays && ` (${order.items[0].rentalDays} ${t('orders.days')})`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Chip
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status)}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.total')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Box>

                  {order.notes && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {t('orders.notes')}: {order.notes}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      {t('orders.viewDetails')}
                    </Button>
                    {order.status !== 'COMPLETED' &&
                      order.status !== 'CANCELLED' && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelClick(order)}
                        >
                          {t('orders.cancelOrder')}
                        </Button>
                      )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Modal de confirmación de cancelación */}
        <Dialog
          open={cancelDialog.open}
          onClose={handleCancelDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('orders.confirmCancel')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('orders.confirmCancelOrderMessage')} #
              {cancelDialog.order?.id.slice(0, 8)}?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              {t('orders.cannotUndo')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDialogClose}
              disabled={cancelLoading !== null}
            >
              {t('orders.keepOrder')}
            </Button>
            <Button
              onClick={handleCancelConfirm}
              color="error"
              variant="contained"
              disabled={cancelLoading !== null}
            >
              {cancelLoading ? t('orders.cancelling') : t('orders.yesCancelOrder')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
