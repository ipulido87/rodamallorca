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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ModernWorkshopLayout } from '../../products/components/modern-product-layout'
import {
  deleteWorkshop,
  getMyWorkshops,
  type Workshop,
} from '../services/workshop-service'

export const MyWorkshops = () => {
  const { t } = useTranslation()
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
      setError(t('workshops.errorLoadingWorkshops'))
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
      setError(t('workshops.errorDeletingWorkshop'))
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
            {t('workshops.loadingWorkshops')}
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
              {t('workshops.myWorkshops')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('workshops.manageCatalog')}
            </Typography>
          </Box>

          {workshops.length === 0 ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-workshop')}
              size="large"
            >
              {t('workshops.createWorkshop')}
            </Button>
          ) : (
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              {t('workshops.alreadyHaveWorkshop')}
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
          emptyMessage={t('workshops.noWorkshopsRegistered')}
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
            <ListItemText>{t('workshops.edit')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>{t('common.delete')}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Modal de confirmación para eliminar */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('confirm.deleteTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('workshops.confirmDeleteWorkshop', { name: deleteDialog.workshop?.name })}
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              {t('workshops.deleteWarning')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDeleteCancel}
              disabled={deleteLoading !== null}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleteLoading !== null}
            >
              {deleteLoading ? t('workshops.deleting') : t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
