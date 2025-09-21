// pages/my-products.tsx

import {
  Add,
  Delete,
  Edit,
  MoreVert,
  Search,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
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
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Product {
  id: string
  title: string
  description?: string
  price: number
  status: 'PUBLISHED' | 'DRAFT'
  categoryId: string | null
  workshopId: string
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
  } | null
  images: Array<{
    id: string
    url: string
    productId: string
  }>
}

export const MyProducts = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PUBLISHED' | 'DRAFT'
  >('ALL')

  // Estados para modales
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    product: Product | null
  }>({
    open: false,
    product: null,
  })

  // Estados para menu contextual
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Cargar productos del taller actual
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/owner/products/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }

      const products = await response.json()
      setProducts(products)
    } catch (err) {
      setError('Error al cargar los productos')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus =
      statusFilter === 'ALL' || product.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Cambiar estado del producto
  const handleStatusChange = async (product: Product) => {
    try {
      const token = localStorage.getItem('token')

      if (product.status === 'DRAFT') {
        // Publicar producto
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/owner/products/${
            product.id
          }/publish`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error('Error al publicar producto')
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: 'PUBLISHED' as const } : p
          )
        )
      } else {
        // Para despublicar, usamos el endpoint de actualización
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/owner/products/${product.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: 'DRAFT' }),
          }
        )

        if (!response.ok) {
          throw new Error('Error al despublicar producto')
        }

        const updatedProduct = await response.json()
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? updatedProduct : p))
        )
      }

      handleCloseMenu()
    } catch (err) {
      setError('Error al cambiar el estado del producto')
      console.error('Error updating product status:', err)
    }
  }

  // Eliminar producto
  const handleDelete = async () => {
    if (!deleteDialog.product) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/owner/products/${
          deleteDialog.product.id
        }`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteDialog.product!.id)
      )
      setDeleteDialog({ open: false, product: null })
    } catch (err) {
      setError('Error al eliminar el producto')
      console.error('Error deleting product:', err)
    }
  }

  // Editar producto
  const handleEdit = (product: Product) => {
    navigate(`/edit-product/${product.id}`)
    handleCloseMenu()
  }

  // Manejar menu
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    product: Product
  ) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedProduct(product)
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
          sx={{ height: 'fit-content' }}
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

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery
              ? 'No se encontraron productos'
              : 'No tienes productos aún'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primer producto para empezar a vender'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-product')}
            >
              Crear Producto
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
              }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  {/* Header con estado */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Chip
                      label={
                        product.status === 'PUBLISHED'
                          ? 'Publicado'
                          : 'Borrador'
                      }
                      size="small"
                      color={
                        product.status === 'PUBLISHED' ? 'success' : 'warning'
                      }
                      variant="filled"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, product)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Stack>

                  {/* Contenido */}
                  <Box>
                    <Typography variant="h6" gutterBottom noWrap>
                      {product.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description || 'Sin descripción'}
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      €{product.price}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.category?.name || 'Sin categoría'}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Menu contextual */}
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

      {/* Modal de confirmación de eliminación */}
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
