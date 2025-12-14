import {
  Add,
  ArrowBack,
  LocationOn,
  Remove,
  ShoppingCart,
  Store,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ApiError } from '../../../shared/types/api'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../../cart/hooks/useCart'
import { getProductById } from '../../catalog/services/catalog-service'
import type { PublicProduct } from '../../catalog/types/catalog'
import { ProductImageGallery } from '../components/product-image-galery'

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, getItemCount } = useCart()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) return

    const loadProduct = async () => {
      try {
        const data = await getProductById(id)
        setProduct(data)
      } catch (err) {
        if (err && typeof err === 'object' && 'response' in err) {
          const apiError = err as ApiError
          setError(apiError.response?.data?.message || 'Product not found')
        } else {
          setError('Failed to load product')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)}€`
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart(
      {
        productId: product.id,
        workshopId: product.workshop.id,
        workshopName: product.workshop.name,
        name: product.title,
        description: product.description ?? null,
        price: product.price,
        currency: product.currency,
      },
      quantity
    )

    // Mostrar feedback visual
    alert(`${quantity} ${product.title} added to cart!`)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading product...</Typography>
        </Box>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Product not found'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/catalog')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Product Details</Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Product Images */}
          <ProductImageGallery
            images={adaptProductImages(product.images)}
            productTitle={product.title}
          />

          {/* Product Information */}
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
              {product.title}
            </Typography>

            <Typography
              variant="h4"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              {formatPrice(product.price)}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip
                label={product.condition}
                color={
                  product.condition === 'new'
                    ? 'success'
                    : product.condition === 'used'
                    ? 'default'
                    : 'warning'
                }
                sx={{ textTransform: 'capitalize', mr: 1 }}
              />
              <Chip
                label={product.status}
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            {product.category && (
              <Typography variant="body1" gutterBottom>
                <strong>Category:</strong> {product.category.name}
              </Typography>
            )}

            <Typography variant="body1" gutterBottom>
              <strong>Currency:</strong> {product.currency}
            </Typography>

            {product.description && (
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </Typography>
              </Box>
            )}

            {/* Workshop Information */}
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Store sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Workshop Information</Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {product.workshop.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn
                    sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }}
                  />
                  <Typography variant="body2">
                    {product.workshop.city}, {product.workshop.country}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Workshop ID: {product.workshop.id}
                </Typography>
              </CardContent>
            </Card>

            {/* Add to Cart Section */}
            <Box sx={{ mt: 4 }}>
              {product.status.toUpperCase() === 'PUBLISHED' && user && (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      Cantidad:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        size="small"
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(parseInt(e.target.value) || 1)
                        }
                        inputProps={{
                          min: 1,
                          style: { textAlign: 'center', width: '60px' },
                        }}
                        size="small"
                      />
                      <IconButton
                        onClick={() => handleQuantityChange(quantity + 1)}
                        size="small"
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={handleAddToCart}
                      sx={{ flex: 1 }}
                    >
                      Añadir al Carrito
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/cart')}
                    >
                      Ver Carrito ({getItemCount()})
                    </Button>
                  </Box>
                </>
              )}

              {product.status.toUpperCase() !== 'PUBLISHED' && user && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="warning.main" gutterBottom>
                    Este producto está en estado {product.status} y no está disponible para compra.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Solo los productos publicados pueden ser añadidos al carrito.
                  </Typography>
                </Box>
              )}

              {!user && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Por favor inicia sesión para comprar este producto.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                  >
                    Iniciar Sesión
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Product Metadata */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Product Information
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Product ID
                </Typography>
                <Typography variant="body2">{product.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Listed Date
                </Typography>
                <Typography variant="body2">
                  {new Date(product.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body2">{product.status}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
