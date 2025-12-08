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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../hooks/useCart'

export const Cart = () => {
  const navigate = useNavigate()
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
      alert('Your cart is empty!')
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

        {/* Cart Items Table */}
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

        {/* Cart Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
          <Box>
            <Button variant="outlined" onClick={() => navigate('/catalog')}>
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
              sx={{ ml: 2 }}
            >
              Clear Cart
            </Button>
          </Box>

          <Card sx={{ minWidth: 300 }}>
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
