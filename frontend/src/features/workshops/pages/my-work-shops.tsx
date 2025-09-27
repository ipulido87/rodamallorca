import {
  Add,
  Delete,
  Edit,
  LocationOn,
  Phone,
  Visibility,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteWorkshop,
  getMyWorkshops,
  type Workshop,
} from '../services/workshop-service'

export const MyWorkshops = () => {
  const navigate = useNavigate()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Estado para el modal de confirmación
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    workshop: Workshop | null
  }>({
    open: false,
    workshop: null,
  })

  const loadWorkshops = async () => {
    try {
      setLoading(true)
      const data = await getMyWorkshops()
      setWorkshops(data)
    } catch {
      setError('Error al cargar los talleres')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkshops()
  }, [])

  const handleDeleteClick = (workshop: Workshop) => {
    setDeleteDialog({ open: true, workshop })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.workshop) return

    try {
      setDeleteLoading(deleteDialog.workshop.id)
      await deleteWorkshop(deleteDialog.workshop.id)

      // Actualizar la lista local removiendo el taller eliminado
      setWorkshops((prev) =>
        prev.filter((w) => w.id !== deleteDialog.workshop?.id)
      )

      // Cerrar el modal
      setDeleteDialog({ open: false, workshop: null })
    } catch {
      setError('Error al eliminar el taller')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, workshop: null })
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando tus talleres...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Mis Talleres
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tu catálogo de talleres
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/workshops/create')}
            size="large"
          >
            Nuevo Taller
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Lista de talleres */}
        {workshops.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes talleres registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer taller para empezar a gestionar tu negocio
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/workshops/create')}
            >
              Crear Primer Taller
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {workshops.map((workshop) => (
              <Card key={workshop.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {workshop.name}
                      </Typography>

                      <Chip
                        label="Activo"
                        color="success"
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      {workshop.description && (
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {workshop.description}
                        </Typography>
                      )}

                      <Stack spacing={1}>
                        {workshop.address && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn
                              sx={{
                                mr: 1,
                                color: 'text.secondary',
                                fontSize: 20,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {workshop.address}, {workshop.city},{' '}
                              {workshop.country}
                            </Typography>
                          </Box>
                        )}

                        {workshop.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone
                              sx={{
                                mr: 1,
                                color: 'text.secondary',
                                fontSize: 20,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {workshop.phone}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        ml: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Creado:{' '}
                        {new Date(workshop.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Actualizado:{' '}
                        {new Date(workshop.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <IconButton
                    onClick={() => navigate(`/workshop/${workshop.id}`)}
                    color="primary"
                    title="Ver detalles"
                  >
                    <Visibility />
                  </IconButton>

                  <IconButton
                    onClick={() => navigate(`/edit-workshop/${workshop.id}`)}
                    color="primary"
                    title="Editar taller"
                  >
                    <Edit />
                  </IconButton>

                  <IconButton
                    onClick={() => handleDeleteClick(workshop)}
                    color="error"
                    title="Eliminar taller"
                    disabled={deleteLoading === workshop.id}
                  >
                    {deleteLoading === workshop.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Delete />
                    )}
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}

        {/* Modal de confirmación para eliminar */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar el taller "
              <strong>{deleteDialog.workshop?.name}</strong>"?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              Esta acción no se puede deshacer. Todos los productos asociados a
              este taller también serán eliminados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDeleteCancel}
              disabled={deleteLoading !== null}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleteLoading !== null}
            >
              {deleteLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
