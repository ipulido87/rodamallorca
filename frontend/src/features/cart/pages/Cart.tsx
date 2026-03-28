import {
  Add,
  Delete,
  Remove,
  ShoppingCartOutlined,
} from '@mui/icons-material'
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { notify } from '../../../shared/services/notification-service'

export const Cart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuth()
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount,
    getItemCount,
  } = useCart()

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)}€`
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (cart.items.length === 0) {
      notify.warning(t('cart.emptyCart'))
      return
    }

    navigate('/checkout')
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
          <Typography variant="h6">
            {t('cart.loginRequired')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            {t('checkout.logIn')}
          </Button>
        </Stack>
      </Container>
    )
  }

  if (cart.items.length === 0) {
    return (
      <Container maxWidth="lg">
        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
          <ShoppingCartOutlined sx={{ fontSize: 80, color: 'text.secondary' }} />
          <Typography variant="h4">
            {t('cart.emptyCart')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('cart.startAdding')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/catalog')}>
            {t('cart.browseCatalog')}
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Typography variant="h4">
          {t('cart.shoppingCart', { count: getItemCount() })}
        </Typography>

        {/* Workshop Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('cart.workshop', { name: cart.items[0].workshopName })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cart.allItemsFrom')}
            </Typography>
          </CardContent>
        </Card>

        {/* Cart Items - Mobile: Cards, Desktop: Table */}
        {isMobile ? (
          <Stack spacing={2}>
            {cart.items.map((item) => (
              <Card key={item.productId}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Stack flex={1}>
                      <Typography variant="h6" fontWeight={500} gutterBottom>
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.description}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        {formatPrice(item.price)}
                      </Typography>
                    </Stack>
                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(item.productId)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography variant="caption" color="text.secondary">{t('cart.subtotal')}</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('cart.product')}</TableCell>
                  <TableCell align="center">{t('cart.price')}</TableCell>
                  <TableCell align="center">{t('cart.quantity')}</TableCell>
                  <TableCell align="right">{t('cart.subtotal')}</TableCell>
                  <TableCell align="center">{t('cart.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 300,
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={500}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Cart Summary */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          spacing={3}
        >
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/catalog')} fullWidth={isMobile}>
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
              fullWidth={isMobile}
            >
              Clear Cart
            </Button>
          </Stack>

          <Card sx={{ minWidth: isMobile ? 'auto' : 300, width: isMobile ? '100%' : 'auto' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatPrice(getTotalAmount())}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body1">Items:</Typography>
                <Typography variant="body1">{getItemCount()}</Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatPrice(getTotalAmount())}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  )
}
