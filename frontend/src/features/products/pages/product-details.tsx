import {
  Add,
  ArrowBack,
  LocationOn,
  Phone,
  Remove,
  ShoppingCart,
  Store,
} from '@mui/icons-material'
import { Seo } from '../../../shared/components/Seo'
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
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import type { ApiError } from '../../../shared/types/api'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { useAuth } from '../../auth/hooks/useAuth'
import { useCart } from '../../cart/hooks/useCart'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import { getProductById } from '../../catalog/services/catalog-service'
import type { PublicProduct } from '../../catalog/types/catalog'
import { ProductImageGallery } from '../components/product-image-galery'

export const ProductDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, getItemCount } = useCart()
  const { showSuccess } = useSnackbar()
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
      quantity,
      {
        canAcceptPayments: product.workshop.canAcceptPayments,
        phone: product.workshop.phone,
      }
    )

    // Mostrar feedback visual con snackbar
    showSuccess(`✓ ${quantity} ${product.title} añadido al carrito`)
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
          <Typography variant="h6">{t('productDetail.loading')}</Typography>
        </Box>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || t('productDetail.notFound')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/catalog')}>
            {t('productDetail.backToCatalog')}
          </Button>
        </Box>
      </Container>
    )
  }

  const productImage = product.images?.[0]?.original ?? undefined

  return (
    <Container maxWidth="lg">
      <Seo
        title={`${product.title} | RodaMallorca`}
        description={
          product.description
            ? `${product.description.slice(0, 140)}. Disponible en ${product.workshop.city ?? 'Mallorca'}.`
            : `${product.title} en venta en ${product.workshop.name}. Taller verificado en ${product.workshop.city ?? 'Mallorca'}.`
        }
        canonicalPath={`/product/${product.id}`}
        keywords={`${product.title}, recambios bicicleta Mallorca, ${product.category?.name ?? 'componentes'} bicicleta`}
        image={productImage}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description ?? undefined,
          image: productImage,
          offers: {
            '@type': 'Offer',
            price: (product.price / 100).toFixed(2),
            priceCurrency: product.currency ?? 'EUR',
            availability: product.status?.toUpperCase() === 'PUBLISHED'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'LocalBusiness',
              name: product.workshop.name,
              address: {
                '@type': 'PostalAddress',
                addressLocality: product.workshop.city ?? 'Mallorca',
                addressCountry: 'ES',
              },
            },
          },
        }}
      />
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/catalog')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">{t('productDetail.title')}</Typography>
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
                <strong>{t('productDetail.category')}:</strong> {product.category.name}
              </Typography>
            )}

            {product.description && (
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('productDetail.description')}
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
                  <Typography variant="h6">{t('productDetail.workshopInfo')}</Typography>
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

                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate(`/workshop/${product.workshop.id}`)}
                  sx={{ mt: 1, p: 0 }}
                >
                  {t('productDetail.viewWorkshop')}
                </Button>
              </CardContent>
            </Card>

            {/* Add to Cart Section */}
            <Box sx={{ mt: 4 }}>
              {product.status.toUpperCase() === 'PUBLISHED' && user && product.workshop.canAcceptPayments !== true && (
                <Box
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'info.main',
                    borderRadius: 2,
                    bgcolor: 'info.50',
                  }}
                >
                  <Typography variant="body1" color="info.dark" gutterBottom fontWeight={600}>
                    {t('productDetail.notAvailableOnline')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    {t('productDetail.paymentsNotEnabled')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => navigate(`/workshop/${product.workshop.id}`)}
                    >
                      {t('productDetail.viewWorkshopPage')}
                    </Button>
                    {product.workshop.phone && (
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<Phone />}
                        href={`tel:${product.workshop.phone}`}
                      >
                        {product.workshop.phone}
                      </Button>
                    )}
                  </Box>
                </Box>
              )}

              {product.status.toUpperCase() === 'PUBLISHED' && user && product.workshop.canAcceptPayments === true && (
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
                      {t('productDetail.quantity')}:
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
                      {t('productDetail.addToCart')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/cart')}
                    >
                      {t('productDetail.viewCart')} ({getItemCount()})
                    </Button>
                  </Box>
                </>
              )}

              {product.status.toUpperCase() !== 'PUBLISHED' && user && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="warning.main" gutterBottom>
                    {t('productDetail.statusNotAvailable', { status: product.status })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('productDetail.onlyPublishedCanBuy')}
                  </Typography>
                </Box>
              )}

              {!user && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {t('productDetail.loginToBuy')}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                  >
                    {t('nav.login')}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Información adicional */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('productDetail.productInfo')}
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
                  {t('productDetail.published')}
                </Typography>
                <Typography variant="body2">
                  {new Date(product.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              {product.category && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('productDetail.category')}
                  </Typography>
                  <Typography variant="body2">{product.category.name}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
