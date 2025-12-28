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
import { useNavigate } from 'react-router-dom'
import useSWR, { mutate } from 'swr'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { ModernProductLayout } from '../components/modern-product-layout'
import type { Product } from '../services/product-service'
import type { CardProduct } from '../types/products-types'
import { API } from '../../auth/services/auth-service'

/* --------- Adaptador UI ← Backend --------- */
const adaptProductForLayout = (product: Product): CardProduct => ({
  id: product.id,
  title: product.title,
  price: product.price,
  condition: 'used', // si tienes el real, cámbialo aquí
  status: product.status,
  images: adaptProductImages(product.images), // sin any
  workshop: { name: 'Mi Taller', city: undefined },
})

const PRODUCTS_KEY = '/owner/products/mine'

const fetcher = async (url: string) => {
  const response = await API.get<Product[]>(url)
  return response.data
}

export const MyProducts = () => {
  const navigate = useNavigate()

  // ✅ SWR para caché automático y revalidación
  const { data: products = [], error: swrError, isLoading } = useSWR(
    PRODUCTS_KEY,
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // modal eliminar
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    product: Product | null
  }>({
    open: false,
    product: null,
  })

  // ✅ useMemo para evitar recalcular en cada render
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, searchQuery, statusFilter])

  const error = swrError ? 'Error al cargar los productos' : localError

  // ✅ publicar / ocultar con mutate de SWR
  const handleStatusChange = async (product: Product) => {
    try {
      if (product.status === 'DRAFT') {
        await API.post(
          `/owner/products/${product.id}/publish`,
          {}
        )
      } else {
        await API.put<Product>(
          `/owner/products/${product.id}`,
          { status: 'DRAFT' }
        )
      }
      // ✅ Revalidar caché automáticamente
      await mutate(PRODUCTS_KEY)
      handleCloseMenu()
    } catch (error) {
      setLocalError('Error al cambiar el estado del producto')
      console.error('Status change error:', error)
    }
  }

  // ✅ Eliminar con mutate de SWR
  const handleDelete = async () => {
    if (!deleteDialog.product) return
    try {
      await API.delete(
        `/owner/products/${deleteDialog.product.id}`
      )
      // ✅ Revalidar caché automáticamente
      await mutate(PRODUCTS_KEY)
      setDeleteDialog({ open: false, product: null })
    } catch (error) {
      setLocalError('Error al eliminar el producto')
      console.error('Delete error:', error)
    }
  }

  const handleEdit = (p: Product) => {
    navigate(`/edit-product/${p.id}`)
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
      const original = products.find((p) => p.id === cardProduct.id) || null
      setSelectedProduct(original)
      setAnchorEl(e.currentTarget)
    }
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedProduct(null)
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
            Mis Productos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu catálogo de productos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-product')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Nuevo Producto
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
          placeholder="Buscar productos..."
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
              Todos ({products.length})
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Todos
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
              Publicados ({products.filter((p) => p.status === 'PUBLISHED').length})
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Pub.
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
              Borradores ({products.filter((p) => p.status === 'DRAFT').length})
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Borr.
            </Box>
          </Button>
        </Stack>
      </Stack>

      {/* Grid con cards (con botón ⋮ por card) */}
      <ModernProductLayout
        products={filteredProducts.map(adaptProductForLayout)}
        loading={false}
        emptyMessage={
          searchQuery
            ? 'No se encontraron productos'
            : 'No tienes productos aún'
        }
        onOpenMenu={handleOpenMenuFromCard}
      />

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedProduct && [
          <MenuItem key="edit" onClick={() => handleEdit(selectedProduct)}>
            <Edit sx={{ mr: 2 }} />
            Editar
          </MenuItem>,
          <MenuItem
            key="status"
            onClick={() => handleStatusChange(selectedProduct)}
          >
            {selectedProduct.status === 'PUBLISHED' ? (
              <VisibilityOff sx={{ mr: 2 }} />
            ) : (
              <Visibility sx={{ mr: 2 }} />
            )}
            {selectedProduct.status === 'PUBLISHED' ? 'Ocultar' : 'Publicar'}
          </MenuItem>,
          <MenuItem
            key="delete"
            onClick={() => {
              setDeleteDialog({ open: true, product: selectedProduct })
              handleCloseMenu()
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 2 }} />
            Eliminar
          </MenuItem>,
        ]}
      </Menu>

      {/* Confirmación eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar "{deleteDialog.product?.title}
            "? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, product: null })}
          >
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
