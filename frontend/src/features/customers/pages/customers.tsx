// frontend/src/features/customers/pages/customers.tsx
import {
  Add,
  Business,
  Delete,
  Edit,
  Email,
  Person,
  Phone,
  Receipt,
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
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomers, deleteCustomer } from '../services/customer-service'
import type { Customer } from '../types/customer'

export const Customers = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return

    try {
      await deleteCustomer(id)
      loadCustomers()
    } catch (err: any) {
      alert(err.message || 'Error al eliminar cliente')
    }
  }

  const getCustomerTypeLabel = (type: string) => {
    return type === 'INDIVIDUAL' ? 'Particular' : 'Empresa'
  }

  const getCustomerTypeColor = (type: string) => {
    return type === 'INDIVIDUAL' ? 'info' : 'secondary'
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando clientes...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Clientes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus clientes y consulta su historial
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/customers/new')}
            sx={{ height: 'fit-content' }}
          >
            Nuevo Cliente
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {customers.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No hay clientes registrados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crea tu primer cliente para empezar
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/customers/new')}
              >
                Crear Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>NIF/CIF</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell align="center">Facturas</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <TableCell>
                      <Chip
                        icon={
                          customer.type === 'INDIVIDUAL' ? (
                            <Person />
                          ) : (
                            <Business />
                          )
                        }
                        label={getCustomerTypeLabel(customer.type)}
                        color={getCustomerTypeColor(customer.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {customer.name}
                      </Typography>
                      {customer.city && (
                        <Typography variant="caption" color="text.secondary">
                          {customer.city}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{customer.taxId || '-'}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {customer.email && (
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {customer.email}
                            </Typography>
                          </Box>
                        )}
                        {customer.phone && (
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {customer.phone}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<Receipt />}
                        label={customer._count?.invoices || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/customers/${customer.id}/edit`)
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(customer.id)
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  )
}
