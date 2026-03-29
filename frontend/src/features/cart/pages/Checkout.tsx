import { CheckCircle, Phone, Store } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { redirectToProductCheckout } from '../services/payment-service'
import { notify } from '../../../shared/services/notification-service'
import { getErrorMessage } from '@/shared/api'

export const Checkout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, clearCart, getTotalAmount, getItemCount } = useCart()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)}€`
  }

  const handleSubmitOrder = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (cart.items.length === 0) {
      notify.warning(t('checkout.emptyCart'))
      navigate('/cart')
      return
    }

    if (!cart.workshopId) {
      notify.error(t('checkout.noWorkshop'))
      navigate('/cart')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Preparar items para Stripe
      const items = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.price,
        currency: item.currency,
        description: item.description,
      }))

      // Redirigir a Stripe Checkout
      await redirectToProductCheckout(cart.workshopId, items)

      // La redirección limpiará el carrito cuando vuelva del éxito
    } catch (err: unknown) {
      console.error('Error iniciando checkout:', err)
      const apiMessage = getErrorMessage(err, '')
      const isStripeConnectError =
        apiMessage.includes('Stripe Connect') ||
        apiMessage.includes(t('checkout.cantReceivePayments')) ||
        apiMessage.includes(t('checkout.stripeVerification'))

      setError(
        isStripeConnectError
          ? `${cart.items[0]?.workshopName || t('checkout.thisWorkshop')} ${t('checkout.noOnlinePayments')}`
          : apiMessage || t('checkout.paymentError')
      )
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('checkout.loginRequired')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            {t('checkout.logIn')}
          </Button>
        </Box>
      </Container>
    )
  }

  if (cart.items.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('checkout.emptyCart')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/catalog')}>
            {t('cart.browseCatalog')}
          </Button>
        </Box>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('checkout.orderSuccess')}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('checkout.orderSubmitted')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('checkout.redirectingOrders')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/my-orders')}
            sx={{ mt: 2 }}
          >
            {t('checkout.viewMyOrders')}
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {t('checkout.title')}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
          }}
        >
          {/* Left Column - Order Details */}
          <Box>
            {/* Workshop Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('checkout.workshopLabel')}
                </Typography>
                <Typography variant="body1">
                  {cart.items[0].workshopName}
                </Typography>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('checkout.orderItems', { count: getItemCount() })}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('cart.product')}</TableCell>
                        <TableCell align="center">{t('checkout.qty')}</TableCell>
                        <TableCell align="right">{t('cart.price')}</TableCell>
                        <TableCell align="right">{t('cart.subtotal')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <Typography variant="body2">{item.name}</Typography>
                            {item.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '300px',
                                }}
                              >
                                {item.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('checkout.orderNotes')}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={t('checkout.orderNotesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Order Summary */}
          <Box>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('cart.orderSummary')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">{t('cart.subtotal')}:</Typography>
                  <Typography variant="body1">
                    {formatPrice(getTotalAmount())}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="body1">{t('cart.items')}</Typography>
                  <Typography variant="body1">{getItemCount()}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">{t('cart.total')}</Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {formatPrice(getTotalAmount())}
                  </Typography>
                </Box>

                {error && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: 'error.light',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="error.dark">
                      {error}
                    </Typography>
                  </Box>
                )}

                {cart.workshopCanAcceptPayments === false ? (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {t('checkout.paymentNotEnabled')}
                    </Alert>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<Store />}
                      onClick={() => navigate(`/workshop/${cart.workshopId}`)}
                      sx={{ mb: 1.5 }}
                    >
                      {t('checkout.viewWorkshopPage')}
                    </Button>
                    {cart.workshopPhone && (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        startIcon={<Phone />}
                        href={`tel:${cart.workshopPhone}`}
                        sx={{ mb: 1.5 }}
                      >
                        {t('checkout.call')}{cart.workshopPhone}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    sx={{ mb: 1.5 }}
                  >
                    {loading ? t('checkout.redirectingPayment') : t('checkout.payWithCard')}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  {t('checkout.backToCart')}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
