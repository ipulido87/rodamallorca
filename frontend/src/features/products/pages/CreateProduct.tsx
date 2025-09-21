import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/types/api'
import {
  createProduct,
  type CreateProductData,
} from '../services/product-service'

export const CreateProduct = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<CreateProductData>({
    title: '',
    price: 0,
    condition: 'used',
    status: 'DRAFT',
    description: '',
    categoryId: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createProduct({
        title: formData.title.trim(),
        price: formData.price * 100, // convertir a céntimos
        condition: formData.condition,
        status: formData.status,
        description: formData.description?.trim() || undefined,
        categoryId: formData.categoryId?.trim() || undefined,
      })

      setSuccess('Product created successfully!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as ApiError
        setError(apiError.response?.data?.message || 'Failed to create product')
      } else {
        setError('Failed to create product')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Product
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
            label="Product Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
          />

          <TextField
            label="Price (€)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            label="Condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            select
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="used">Used</MenuItem>
            <MenuItem value="refurb">Refurbished</MenuItem>
          </TextField>

          <TextField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            select
          >
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="PUBLISHED">Published</MenuItem>
          </TextField>

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading || !formData.title.trim() || formData.price <= 0
              }
            >
              {loading ? 'Creating...' : 'Create Product'}
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
