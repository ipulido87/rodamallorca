import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createWorkshop,
  type CreateWorkshopData,
} from '../services/workshop-service'
import { ApiError } from '../types/api'

export const CreateWorkshop = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<CreateWorkshopData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createWorkshop({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
      })

      setSuccess('Workshop created successfully!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as ApiError
        setError(
          apiError.response?.data?.message || 'Failed to create workshop'
        )
      } else {
        setError('Failed to create workshop')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Workshop
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Workshop Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={3}
          />

          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />

          <TextField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />

          <TextField
            label="Country Code (ES, FR, etc.)"
            name="country"
            value={formData.country}
            onChange={handleChange}
            margin="normal"
            fullWidth
            inputProps={{ maxLength: 2 }}
          />

          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            fullWidth
            type="tel"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Workshop'}
            </Button>

            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
