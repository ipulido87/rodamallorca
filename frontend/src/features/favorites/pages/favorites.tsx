import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  GridLegacy as Grid,
  Stack,
} from '@mui/material'
import { Favorite, LocationOn } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getUserFavorites, toggleFavorite, type FavoriteWorkshop } from '../services/favorite-service'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'

export const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteWorkshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { showSuccess, showError } = useSnackbar()

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserFavorites()
      setFavorites(data)
    } catch (err) {
      setError('Error al cargar favoritos')
      showError('Error al cargar favoritos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const handleToggleFavorite = async (workshopId: string) => {
    try {
      await toggleFavorite(workshopId)
      showSuccess('Eliminado de favoritos')
      loadFavorites()
    } catch (err) {
      showError('Error al actualizar favorito')
    }
  }

  const handleNavigateToWorkshop = (workshopId: string) => {
    navigate(`/catalog?workshop=${workshopId}`)
  }

  if (loading) {
    return (
      <Container>
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Mis Talleres Favoritos
        </Typography>

        {favorites.length === 0 ? (
          <Alert severity="info">
            No tienes talleres favoritos. Explora el catálogo y marca tus talleres favoritos.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((favorite) => (
              <Grid item xs={12} sm={6} md={4} key={favorite.id}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack
                        flex={1}
                        onClick={() => handleNavigateToWorkshop(favorite.workshopId)}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {favorite.workshop?.name || 'Taller'}
                        </Typography>

                        {favorite.workshop?.city && (
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {favorite.workshop.city}
                            </Typography>
                          </Stack>
                        )}

                        {favorite.workshop?.description && (
                          <Typography variant="body2" color="text.secondary">
                            {favorite.workshop.description}
                          </Typography>
                        )}
                      </Stack>

                      <IconButton color="error" onClick={() => handleToggleFavorite(favorite.workshopId)}>
                        <Favorite />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  )
}
