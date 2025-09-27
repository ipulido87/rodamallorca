import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { AxiosError } from 'axios'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getMyWorkshopById,
  updateWorkshop,
  type CreateWorkshopData,
  type Workshop,
} from '../services/workshop-service'

export const EditWorkshop = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [workshop, setWorkshop] = useState<Workshop | null>(null)

  const [formData, setFormData] = useState<CreateWorkshopData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
  })

  // Cargar datos del workshop al montar el componente
  useEffect(() => {
    if (!id) {
      setError('ID de taller no válido')
      setInitialLoading(false)
      return
    }

    const loadWorkshop = async () => {
      try {
        setInitialLoading(true)
        // Usar la ruta de owner para verificar que es del usuario
        const data = await getMyWorkshopById(id)
        setWorkshop(data)

        // Pre-poblar el formulario con los datos existentes
        setFormData({
          name: data.name,
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          phone: data.phone || '',
        })
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 404) {
            setError('Taller no encontrado')
          } else if (err.response?.status === 403) {
            setError('No tienes permisos para editar este taller')
          } else {
            setError('Error al cargar el taller')
          }
        } else {
          setError('Error al cargar el taller')
        }
      } finally {
        setInitialLoading(false)
      }
    }

    loadWorkshop()
  }, [id])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    setLoading(true)
    setError('')

    try {
      await updateWorkshop(id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
      })

      setSuccess('Taller actualizado correctamente')
      setTimeout(() => navigate('/my-workshops'), 1500)
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          setError('Taller no encontrado')
        } else if (err.response?.status === 403) {
          setError('No tienes permisos para editar este taller')
        } else {
          setError(
            err.response?.data?.message || 'Error al actualizar el taller'
          )
        }
      } else {
        setError('Error al actualizar el taller')
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading inicial
  if (initialLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando información del taller...
          </Typography>
        </Box>
      </Container>
    )
  }

  // Error al cargar
  if (error && !workshop) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/my-workshops')}>
            Volver a Mis Talleres
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Editar Taller
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/my-workshops')}>
            Volver
          </Button>
        </Box>

        {workshop && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Editando: <strong>{workshop.name}</strong>
          </Typography>
        )}

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
            label="Nombre del Taller"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={3}
            disabled={loading}
          />

          <TextField
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Ciudad"
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Código de País (ES, FR, etc.)"
            name="country"
            value={formData.country}
            onChange={handleChange}
            margin="normal"
            fullWidth
            inputProps={{ maxLength: 2 }}
            disabled={loading}
          />

          <TextField
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            fullWidth
            type="tel"
            disabled={loading}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Actualizando...' : 'Actualizar Taller'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/my-workshops')}
              disabled={loading}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
