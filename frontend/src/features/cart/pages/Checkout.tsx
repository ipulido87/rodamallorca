import { CheckCircle } from '@mui/icons-material'
import {
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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { createOrder } from '../services/cart-service'

export const Checkout = () => {
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
      alert('Your cart is empty!')
      navigate('/cart')
      return
    }

    if (!cart.workshopId) {
      alert('No workshop selected!')
      navigate('/cart')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderPayload = {
        workshopId: cart.workshopId,
        notes: notes.trim() || undefined,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: item.price,
          currency: item.currency,
          description: item.description,
        })),
      }

      const createdOrder = await createOrder(orderPayload)

      console.log('Order created successfully:', createdOrder)
      setSuccess(true)

      // Clear cart after successful order
      clearCart()

      // Redirect to order details after a short delay
      setTimeout(() => {
        navigate(`/my-orders`)
      }, 2000)
    } catch (err: any) {
      console.error('Error creating order:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create order. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please log in to checkout
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
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate('/catalog')}>
            Browse Catalog
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
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Your order has been submitted to the workshop.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Redirecting to your orders...
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/my-orders')}
            sx={{ mt: 2 }}
          >
            View My Orders
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Checkout
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
                  Workshop
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
                  Order Items ({getItemCount()} items)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
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
                  Order Notes (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add any special instructions or notes for the workshop..."
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

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/cart')}
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Back to Cart
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
