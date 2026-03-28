import { useState } from 'react'
import {
  Box,
  Button,
  Rating,
  TextField,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material'
import { Star } from '@mui/icons-material'
import { createReview } from '../services/review-service'
import type { CreateReviewInput } from '../types/review-types'
import { getErrorMessage } from '@/shared/api'
import { useTranslation } from 'react-i18next'

interface ReviewFormProps {
  workshopId: string
  onReviewCreated?: () => void
}

export const ReviewForm = ({ workshopId, onReviewCreated }: ReviewFormProps) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError(t('reviews.selectRating'))
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const data: CreateReviewInput = {
        workshopId,
        rating,
        comment: comment.trim() || undefined,
      }

      await createReview(data)

      setSuccess(true)
      setRating(0)
      setComment('')

      // Notificar al padre que se creó la review
      onReviewCreated?.()

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('reviews.submitError')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {t('reviews.leaveReview')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('reviews.thankYou')}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('reviews.rating')}
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<Star fontSize="inherit" />}
            disabled={loading}
          />
        </Box>

        <TextField
          label={t('reviews.commentLabel')}
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
          placeholder={t('reviews.commentPlaceholder')}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading || rating === 0}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? t('reviews.submitting') : t('reviews.publishReview')}
        </Button>
      </Box>
    </Paper>
  )
}
