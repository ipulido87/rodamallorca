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
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { ModernProductLayout } from '../components/modern-product-layout'
import type { Product } from '../services/product-service'
import type { CardProduct } from '../types/products-types'
import axios, { AxiosError } from 'axios'

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

export const MyProducts = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  // Cargar productos del taller
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔧 [LOAD_PRODUCTS] Iniciando request con axios...')

      const response = await axios.get<Product[]>(
        `${import.meta.env.VITE_API_URL}/owner/products/mine`,
        {
          withCredentials: true,
        }
      )

      console.log('🔧 [LOAD_PRODUCTS] Response status:', response.status)
      console.log('🔧 [LOAD_PRODUCTS] Response data:', response.data)

      setProducts(response.data)
    } catch (error) {
      setError('Error al cargar los productos')

      if (error instanceof AxiosError) {
        console.error(
          '🔧 [LOAD_PRODUCTS] Axios error:',
          error.response?.data || error.message
        )
      } else if (error instanceof Error) {
        console.error('🔧 [LOAD_PRODUCTS] Error:', error.message)
      } else {
        console.error('🔧 [LOAD_PRODUCTS] Unknown error:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // publicar / ocultar
  const handleStatusChange = async (product: Product) => {
    try {
      if (product.status === 'DRAFT') {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/owner/products/${
            product.id
          }/publish`,
          {},
          { withCredentials: true }
        )
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: 'PUBLISHED' } : p
          )
        )
      } else {
        const response = await axios.put<Product>(
          `${import.meta.env.VITE_API_URL}/owner/products/${product.id}`,
          { status: 'DRAFT' },
          { withCredentials: true }
        )
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? response.data : p))
        )
      }
      handleCloseMenu()
    } catch (error) {
      setError('Error al cambiar el estado del producto')

      if (error instanceof AxiosError) {
        console.error('Axios error:', error.response?.data || error.message)
      } else if (error instanceof Error) {
        console.error('Error:', error.message)
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.product) return
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/owner/products/${
          deleteDialog.product.id
        }`,
        { withCredentials: true }
      )
      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteDialog.product!.id)
      )
      setDeleteDialog({ open: false, product: null })
    } catch (error) {
      setError('Error al eliminar el producto')

      if (error instanceof AxiosError) {
        console.error('Axios error:', error.response?.data || error.message)
      } else if (error instanceof Error) {
        console.error('Error:', error.message)
      }
    }
  }

  const handleEdit = (p: Product) => {
    navigate(`/edit-product/${p.id}`)
    handleCloseMenu()
  }

  // abrir menú desde la card (⋮)
  const handleOpenMenuFromCard = (
    e: React.MouseEvent<HTMLElement>,
    item: CardProduct | import('../types/products-types').CardWorkshop
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

  if (loading) {
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
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
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
        >
          Nuevo Producto
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ flex: 1 }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant={statusFilter === 'ALL' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('ALL')}
            size="small"
          >
            Todos ({products.length})
          </Button>
          <Button
            variant={statusFilter === 'PUBLISHED' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('PUBLISHED')}
            size="small"
            color="success"
          >
            Publicados (
            {products.filter((p) => p.status === 'PUBLISHED').length})
          </Button>
          <Button
            variant={statusFilter === 'DRAFT' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('DRAFT')}
            size="small"
            color="warning"
          >
            Borradores ({products.filter((p) => p.status === 'DRAFT').length})
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
