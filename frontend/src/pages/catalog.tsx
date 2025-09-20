import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  searchProducts,
  searchWorkshops,
  type PublicProduct,
  type PublicWorkshop,
} from '../services/catalog-service'

export const Catalog = () => {
  const [tab, setTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [workshops, setWorkshops] = useState<PublicWorkshop[]>([])
  const [loading, setLoading] = useState(false)

  const loadProducts = async (query = '') => {
    setLoading(true)
    try {
      const result = await searchProducts({ q: query, size: 12 })
      setProducts(result.items)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkshops = async (query = '') => {
    setLoading(true)
    try {
      const result = await searchWorkshops({ q: query, size: 12 })
      setWorkshops(result.items)
    } catch (error) {
      console.error('Error loading workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 0) {
      loadProducts()
    } else {
      loadWorkshops()
    }
  }, [tab])

  const handleSearch = () => {
    if (tab === 0) {
      loadProducts(searchQuery)
    } else {
      loadWorkshops(searchQuery)
    }
  }

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)}€`
  }

  const navigate = useNavigate()

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom textAlign="center">
          RodaMallorca Marketplace
        </Typography>

        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Find bike parts and trusted workshops in Mallorca
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            centered
          >
            <Tab label="Products" />
            <Tab label="Workshops" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder={
              tab === 0 ? 'Search products...' : 'Search workshops...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            minHeight: loading ? '200px' : 'auto',
          }}
        >
          {tab === 0 &&
            products.map((product) => (
              <Card
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {product.title}
                  </Typography>

                  <Typography
                    variant="h5"
                    color="primary"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    {formatPrice(product.price)}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={product.condition}
                      size="small"
                      color={
                        product.condition === 'new'
                          ? 'success'
                          : product.condition === 'used'
                          ? 'default'
                          : 'warning'
                      }
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  {product.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontWeight: 600 }}
                    >
                      Workshop: {product.workshop.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {product.workshop.city}, {product.workshop.country}
                    </Typography>
                    {product.category && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        Category: {product.category.name}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}

          {tab === 1 &&
            workshops.map((workshop) => (
              <Card
                key={workshop.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {workshop.name}
                  </Typography>

                  {workshop.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {workshop.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {workshop.address && (
                      <Typography
                        variant="body2"
                        display="block"
                        sx={{ mb: 1 }}
                      >
                        📍 {workshop.address}
                      </Typography>
                    )}

                    <Typography variant="body2" display="block" sx={{ mb: 1 }}>
                      🌍 {workshop.city}, {workshop.country}
                    </Typography>

                    {workshop.phone && (
                      <Typography
                        variant="body2"
                        display="block"
                        sx={{ mb: 1 }}
                      >
                        📞 {workshop.phone}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Member since {new Date(workshop.createdAt).getFullYear()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>

        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        )}

        {!loading && tab === 0 && products.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              mt: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms or browse all products
            </Typography>
          </Box>
        )}

        {!loading && tab === 1 && workshops.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              mt: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              No workshops found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms or browse all workshops
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  )
}
