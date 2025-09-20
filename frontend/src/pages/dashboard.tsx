import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { getMyProducts, Product } from '../services/product-service'
import { getMyWorkshops, Workshop } from '../services/workshop-service'

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workshopData, productData] = await Promise.all([
          getMyWorkshops(),
          getMyProducts(),
        ])
        setWorkshops(workshopData)
        setProducts(productData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <Typography>Loading...</Typography>

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Workshop Dashboard
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.name}!
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/create-workshop')}
          >
            Create Workshop
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/create-product')}
          >
            Create Product
          </Button>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Workshops ({workshops.length})
            </Typography>
            {workshops.map((workshop) => (
              <Box
                key={workshop.id}
                sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
              >
                <Typography variant="subtitle1">{workshop.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {workshop.city}, {workshop.country}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Products ({products.length})
            </Typography>
            {products.map((product) => (
              <Box
                key={product.id}
                sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}
              >
                <Typography variant="subtitle1">{product.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.price / 100}€ - {product.status}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}
