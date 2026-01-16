import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { MoreVert, Delete, Edit } from '@mui/icons-material'
import { getWorkshopReviews, deleteReview } from '../services/review-service'
import type { Review } from '../types/review-types'
import { useAuth } from '../../auth/hooks/useAuth'

interface ReviewListProps {
  workshopId: string
  refreshTrigger?: number
}

export const ReviewList = ({ workshopId, refreshTrigger }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const { user } = useAuth()

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await getWorkshopReviews(workshopId)
      setReviews(data)
    } catch (err: any) {
      setError('Error al cargar las reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [workshopId, refreshTrigger])

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setAnchorEl(event.currentTarget)
    setSelectedReview(review)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedReview(null)
  }

  const handleDelete = async () => {
    if (!selectedReview) return

    try {
      await deleteReview(selectedReview.id)
      setReviews(reviews.filter((r) => r.id !== selectedReview.id))
      handleCloseMenu()
    } catch (err: any) {
      setError('Error al eliminar la review')
      handleCloseMenu()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando opiniones...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )
  }

  if (reviews.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Este taller aún no tiene opiniones. ¡Sé el primero en dejar una review!
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Opiniones de Clientes ({reviews.length})
      </Typography>

      <Stack spacing={2}>
        {reviews.map((review) => (
          <Paper key={review.id} elevation={1} sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={review.user.picture || undefined}
                  alt={review.user.name || review.user.email}
                  sx={{ width: 48, height: 48 }}
                >
                  {(review.user.name || review.user.email).charAt(0).toUpperCase()}
                </Avatar>

                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    {review.user.name || 'Usuario'}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* Menú de opciones (solo para el propietario de la review) */}
              {user?.id === review.userId && (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, review)}
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedReview?.id === review.id}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={handleDelete}>
                      <Delete fontSize="small" sx={{ mr: 1 }} />
                      Eliminar
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Stack>

            {review.comment && (
              <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}
