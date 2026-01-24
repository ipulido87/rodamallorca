import { Add, Delete, Edit } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useEffect, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModernWorkshopLayout } from '../../products/components/modern-product-layout'
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

  // Estado para el menú contextual
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)

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

  const handleOpenMenu = (
    event: MouseEvent<HTMLElement>,
    item: import('../../products/types/products-types').CardProduct | import('../../products/types/products-types').CardWorkshop
  ) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    // Type guard: if it doesn't have 'price', it's a workshop
    if (!('price' in item)) {
      // Find the full Workshop object from our workshops array
      const workshop = workshops.find((w) => w.id === item.id) || null
      setSelectedWorkshop(workshop)
    }
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedWorkshop(null)
  }

  const handleEdit = () => {
    if (selectedWorkshop) {
      navigate(`/edit-workshop/${selectedWorkshop.id}`)
    }
    handleCloseMenu()
  }

  const handleDelete = () => {
    if (selectedWorkshop) {
      setDeleteDialog({ open: true, workshop: selectedWorkshop })
    }
    handleCloseMenu()
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

          {workshops.length === 0 ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-workshop')}
              size="large"
            >
              Crear Tu Taller
            </Button>
          ) : (
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              Ya tienes un taller. Solo puedes tener uno por cuenta.
            </Alert>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Layout moderno de workshops */}
        <ModernWorkshopLayout
          workshops={workshops}
          loading={false} // Ya manejamos loading arriba
          error={undefined} // Ya manejamos error arriba
          emptyMessage="No tienes talleres registrados"
          onOpenMenu={handleOpenMenu}
        />

        {/* Menú contextual */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
          </MenuItem>
        </Menu>

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
