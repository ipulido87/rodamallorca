import { ArrowBack, LocationOn, Store } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/types/api'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { getProductById } from '../../catalog/services/catalog-service'
import type { PublicProduct } from '../../catalog/types/catalog'
import { ProductImageGallery } from '../components/product-image-galery'

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                sx={{ flex: 1 }}
                disabled
              >
                Contact Workshop
              </Button>
              <Button variant="outlined" size="large" disabled>
                Add to Favorites
              </Button>
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
