import {
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  Receipt,
  Settings,
  Store,
  Visibility,
} from '@mui/icons-material'
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
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import type { Workshop } from '../../workshops/services/workshop-service'
import { getMyWorkshops } from '../../workshops/services/workshop-service'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getWorkshopOrders,
  type Order,
  OrderStatus,
  updateOrderStatus,
} from '../services/order-service'

export const Orders = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('')
  const [error, setError] = useState('')
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)

  // Estado para el modal de actualización de estado
  const [updateDialog, setUpdateDialog] = useState<{
    open: boolean
    order: Order | null
    newStatus: OrderStatus | null
  }>({
    open: false,
    order: null,
    newStatus: null,
  })

  // SWR: Cargar talleres del owner
  const { data: workshops = [], isLoading: loading } = useSWR<Workshop[]>(
    '/my-workshops',
    getMyWorkshops,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  )

  // Auto-seleccionar si solo hay un taller
  useEffect(() => {
    if (workshops.length === 1 && !selectedWorkshopId) {
      setSelectedWorkshopId(workshops[0].id)
    }
  }, [workshops, selectedWorkshopId])

  // SWR: Cargar pedidos del taller seleccionado
  const { data: orders = [], isLoading: ordersLoading, mutate } = useSWR<Order[]>(
    selectedWorkshopId ? `/workshops/${selectedWorkshopId}/orders` : null,
    () => getWorkshopOrders(selectedWorkshopId),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  const handleStatusChangeClick = (order: Order) => {
    setUpdateDialog({ open: true, order, newStatus: null })
  }

  const handleUpdateConfirm = async () => {
    if (!updateDialog.order || !updateDialog.newStatus) return

    try {
      setUpdateLoading(updateDialog.order.id)
      await updateOrderStatus(updateDialog.order.id, {
        status: updateDialog.newStatus,
      })

      // Optimistic update: actualizar cache inmediatamente
      mutate(
        orders.map((o) =>
          o.id === updateDialog.order?.id
            ? { ...o, status: updateDialog.newStatus! }
            : o
        ),
        false
      )

      setUpdateDialog({ open: false, order: null, newStatus: null })
    } catch {
      setError(t('orders.errorUpdatingStatus'))
    } finally {
      setUpdateLoading(null)
    }
  }

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)}€`
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <HourglassEmpty />
      case 'CONFIRMED':
        return <CheckCircle />
      case 'IN_PROGRESS':
        return <Settings />
      case 'READY':
        return <LocalShipping />
      case 'COMPLETED':
        return <Receipt />
      default:
        return <HourglassEmpty />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('orders.loadingWorkshops')}
          </Typography>
        </Box>
      </Container>
    )
  }

  if (workshops.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Store sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('orders.noWorkshops')}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('orders.needWorkshopForOrders')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/create-workshop')}
            sx={{ mt: 2 }}
          >
            {t('orders.createWorkshop')}
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">{t('orders.workshopOrders')}</Typography>
        </Box>

        {/* Selector de taller (si tiene múltiples) */}
        {workshops.length > 1 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>{t('orders.selectWorkshop')}</InputLabel>
                <Select
                  value={selectedWorkshopId}
                  label={t('orders.selectWorkshop')}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                >
                  {workshops.map((workshop) => (
                    <MenuItem key={workshop.id} value={workshop.id}>
                      {workshop.name}
                      {workshop.city && ` - ${workshop.city}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        )}

        {/* Mostrar nombre del taller si solo tiene uno */}
        {workshops.length === 1 && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Store />
                <Typography variant="h6">{workshops[0].name}</Typography>
                {workshops[0].city && (
                  <Typography variant="body2" color="text.secondary">
                    - {workshops[0].city}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Lista de pedidos */}
        {ordersLoading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t('orders.loadingOrders')}
            </Typography>
          </Box>
        )}

        {!ordersLoading && selectedWorkshopId && orders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('orders.noOrdersYet')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('orders.ordersWillAppearHere')}
            </Typography>
          </Box>
        )}

        {!ordersLoading && orders.length > 0 && (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card key={order.id} sx={{ position: 'relative' }}>
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
                      <Typography variant="h6" gutterBottom>
                        {t('orders.orderNumber', { id: order.id.slice(0, 8) })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.client')}: {order.user?.email || 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {t('orders.total')}: {formatPrice(order.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.productCount', { count: order.items?.length || 0 })}
                    </Typography>
                  </Box>

                  {order.notes && (
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {t('orders.clientNotes')}:
                      </Typography>
                      <Typography variant="body2">{order.notes}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      {t('orders.viewDetails')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Settings />}
                      onClick={() => handleStatusChangeClick(order)}
                      disabled={order.status === 'COMPLETED'}
                    >
                      {t('orders.changeStatus')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Dialog para actualizar estado */}
      <Dialog
        open={updateDialog.open}
        onClose={() =>
          setUpdateDialog({ open: false, order: null, newStatus: null })
        }
      >
        <DialogTitle>{t('orders.updateOrderStatus')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('orders.orderNumber', { id: updateDialog.order?.id.slice(0, 8) })}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{t('orders.newStatus')}</InputLabel>
            <Select
              value={updateDialog.newStatus || ''}
              label={t('orders.newStatus')}
              onChange={(e) =>
                setUpdateDialog((prev) => ({
                  ...prev,
                  newStatus: e.target.value as OrderStatus,
                }))
              }
            >
              <MenuItem value="PENDING">{t('orders.pending')}</MenuItem>
              <MenuItem value="CONFIRMED">{t('orders.confirmed')}</MenuItem>
              <MenuItem value="IN_PROGRESS">{t('orders.inProgress')}</MenuItem>
              <MenuItem value="READY">{t('orders.ready')}</MenuItem>
              <MenuItem value="COMPLETED">{t('orders.completed')}</MenuItem>
              <MenuItem value="CANCELLED">{t('orders.cancelled')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setUpdateDialog({ open: false, order: null, newStatus: null })
            }
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleUpdateConfirm}
            variant="contained"
            disabled={!updateDialog.newStatus || !!updateLoading}
          >
            {updateLoading ? t('orders.updating') : t('orders.update')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
