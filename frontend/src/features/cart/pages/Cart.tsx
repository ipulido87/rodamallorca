import {
  Add,
  Delete,
  Remove,
  ShoppingCartOutlined,
} from '@mui/icons-material'
import {
  Box,
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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { notify } from '../../../shared/services/notification-service'

export const Cart = () => {
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
      notify.warning('Tu carrito está vacío')
      return
    }

    navigate('/checkout')
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please log in to view your cart
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </Box>
      </Container>
    )
  }

  if (cart.items.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <ShoppingCartOutlined sx={{ fontSize: 80, color: 'text.secondary' }} />
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Start adding products to your cart!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/catalog')}
            sx={{ mt: 2 }}
          >
            Browse Catalog
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Shopping Cart ({getItemCount()} items)
        </Typography>

        {/* Workshop Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Workshop: {cart.items[0].workshopName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All items in your cart are from this workshop
            </Typography>
          </CardContent>
        </Card>

        {/* Cart Items - Mobile: Cards, Desktop: Table */}
        {isMobile ? (
          <Stack spacing={2} sx={{ mb: 3 }}>
            {cart.items.map((item) => (
              <Card key={item.productId}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
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
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(item.productId)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Box>
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
                              maxWidth: '300px',
                            }}
                          >
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography variant="body1" sx={{ minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
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
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 3 }}>
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ width: isMobile ? '100%' : 'auto' }}>
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="body1">Subtotal:</Typography>
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
                <Typography variant="body1">Items:</Typography>
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
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatPrice(getTotalAmount())}
                </Typography>
              </Box>
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
        </Box>
      </Box>
    </Container>
  )
}
