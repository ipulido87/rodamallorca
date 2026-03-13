import {
  Add,
  Delete,
  Edit,
  Search,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
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
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useSWR, { mutate } from 'swr'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { ModernProductLayout } from '../components/modern-product-layout'
import type { Product } from '../services/product-service'
import type { CardProduct } from '../types/products-types'
import { API } from '@/shared/api'

/* --------- Adaptador UI ← Backend --------- */
const adaptProductForLayout = (product: Product): CardProduct => ({
  id: product.id,
  title: product.title,
  price: product.rentalPricePerDay || 0,
  condition: 'used',
  status: product.status,
  images: adaptProductImages(product.images),
  workshop: { name: 'Mi Taller', city: undefined },
  isRental: true, // Marca como alquiler
})

const RENTALS_KEY = '/owner/products/mine?isRental=true'

const fetcher = async (url: string) => {
  const response = await API.get<Product[]>(url)
  return response.data
}

export const MyRentals = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ✅ SWR para caché automático y revalidación
  const { data: rentals = [], error: swrError, isLoading } = useSWR(
    RENTALS_KEY,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const [localError, setLocalError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PUBLISHED' | 'DRAFT'
  >('ALL')

  // menú contextual
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRental, setSelectedRental] = useState<Product | null>(null)

  // modal eliminar
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    rental: Product | null
  }>({
    open: false,
    rental: null,
  })

  // ✅ useMemo para evitar recalcular en cada render
  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rentals, searchQuery, statusFilter])

  const error = swrError ? t('myRentals.loadError') : localError

  // ✅ publicar / ocultar con mutate de SWR
  const handleStatusChange = async (rental: Product) => {
    try {
      if (rental.status === 'DRAFT') {
        await API.post(
          `/owner/products/${rental.id}/publish`,
          {}
        )
      } else {
        await API.put<Product>(
          `/owner/products/${rental.id}`,
          { status: 'DRAFT' }
        )
      }
      // ✅ Revalidar caché automáticamente
      await mutate(RENTALS_KEY)
      handleCloseMenu()
    } catch (error) {
      setLocalError(t('myRentals.statusChangeError'))
      console.error('Status change error:', error)
    }
  }

  // ✅ Eliminar con mutate de SWR
  const handleDelete = async () => {
    if (!deleteDialog.rental) return
    try {
      await API.delete(
        `/owner/products/${deleteDialog.rental.id}`
      )
      // ✅ Revalidar caché automáticamente
      await mutate(RENTALS_KEY)
      setDeleteDialog({ open: false, rental: null })
    } catch (error) {
      setLocalError(t('myRentals.deleteError'))
      console.error('Delete error:', error)
    }
  }

  const handleEdit = (r: Product) => {
    navigate(`/edit-product/${r.id}`)
    handleCloseMenu()
  }

  // abrir menú desde la card (⋮)
  const handleOpenMenuFromCard = (
    e: React.MouseEvent<HTMLElement>,
    item: CardProduct | import('../types/products-types').CardWorkshop | import('../types/products-types').CardService
  ) => {
    e.stopPropagation()
    // Type guard to ensure it's a CardProduct
    if ('price' in item) {
      const cardProduct = item as CardProduct
      const original = rentals.find((r) => r.id === cardProduct.id) || null
      setSelectedRental(original)
      setAnchorEl(e.currentTarget)
    }
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedRental(null)
  }

  const handleCreateRental = () => {
    // Navegar al formulario de creación con isRental pre-seleccionado
    navigate('/create-product?isRental=true')
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header - Responsive */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('myRentals.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('myRentals.manageBikes')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateRental}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {t('myRentals.newBike')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setLocalError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros - Responsive */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          placeholder={t('myRentals.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ flex: 1 }}
          fullWidth
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}
        >
          <Button
            variant={statusFilter === 'ALL' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('ALL')}
            size="small"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t('myRentals.all')} ({rentals.length})
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {t('myRentals.all')}
            </Box>
          </Button>
          <Button
            variant={statusFilter === 'PUBLISHED' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('PUBLISHED')}
            size="small"
            color="success"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t('myRentals.published')} ({rentals.filter((r) => r.status === 'PUBLISHED').length})
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {t('myRentals.publishedShort')}
            </Box>
          </Button>
          <Button
            variant={statusFilter === 'DRAFT' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('DRAFT')}
            size="small"
            color="warning"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t('myRentals.drafts')} ({rentals.filter((r) => r.status === 'DRAFT').length})
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {t('myRentals.draftsShort')}
            </Box>
          </Button>
        </Stack>
      </Stack>

      {/* Grid con cards (con botón ⋮ por card) */}
      <ModernProductLayout
        products={filteredRentals.map(adaptProductForLayout)}
        loading={false}
        emptyMessage={
          searchQuery
            ? t('myRentals.noSearchResults')
            : t('myRentals.noBikesYet')
        }
        onOpenMenu={handleOpenMenuFromCard}
      />

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedRental && [
          <MenuItem key="edit" onClick={() => handleEdit(selectedRental)}>
            <Edit sx={{ mr: 2 }} />
            {t('myRentals.edit')}
          </MenuItem>,
          <MenuItem
            key="status"
            onClick={() => handleStatusChange(selectedRental)}
          >
            {selectedRental.status === 'PUBLISHED' ? (
              <VisibilityOff sx={{ mr: 2 }} />
            ) : (
              <Visibility sx={{ mr: 2 }} />
            )}
            {selectedRental.status === 'PUBLISHED' ? t('myRentals.hide') : t('myRentals.publish')}
          </MenuItem>,
          <MenuItem
            key="delete"
            onClick={() => {
              setDeleteDialog({ open: true, rental: selectedRental })
              handleCloseMenu()
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 2 }} />
            {t('common.delete')}
          </MenuItem>,
        ]}
      </Menu>

      {/* Confirmación eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, rental: null })}
      >
        <DialogTitle>{t('confirm.deleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('myRentals.confirmDelete', { title: deleteDialog.rental?.title })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, rental: null })}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
