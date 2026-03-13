// frontend/src/features/customers/pages/customer-detail.tsx
import {
  ArrowBack,
  Business,
  Edit,
  Email,
  Person,
  Phone,
  LocationOn,
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
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material'

import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { getCustomerById } from '../services/customer-service'
import type { Customer } from '../types/customer'

export const CustomerDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // SWR hook - cache automático por ID
  const { data: customer, error, isLoading } = useSWR<Customer>(
    id ? `/customers/${id}` : null,
    () => getCustomerById(id!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  )

  const getCustomerTypeLabel = (type: string) => {
    return type === 'INDIVIDUAL' ? t('customers.individual') : t('customers.company')
  }

  const getCustomerTypeIcon = (type: string) => {
    return type === 'INDIVIDUAL' ? <Person /> : <Business />
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('customers.loadingCustomer')}
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error || !customer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.message || t('customers.customerNotFound')}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/customers')}
            startIcon={<ArrowBack />}
          >
            {t('customers.backToCustomers')}
          </Button>
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
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: 4,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%' }}>
            <IconButton
              onClick={() => navigate('/customers')}
              sx={{
                mr: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                {customer.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('customers.customerType', { type: getCustomerTypeLabel(customer.type) })}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
            fullWidth={isMobile}
          >
            {t('customers.edit')}
          </Button>
        </Box>

        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={3}
          sx={{ alignItems: 'flex-start' }}
        >
          {/* Información Principal */}
          <Box sx={{ flex: 2, width: '100%' }}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  {/* Tipo de Cliente */}
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t('customers.customerTypeLabel')}
                    </Typography>
                    <Chip
                      icon={getCustomerTypeIcon(customer.type)}
                      label={getCustomerTypeLabel(customer.type)}
                      color={customer.type === 'INDIVIDUAL' ? 'info' : 'secondary'}
                    />
                  </Box>

                  <Divider />

                  {/* Información Fiscal */}
                  {customer.taxId && (
                    <>
                      <Box>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          gutterBottom
                        >
                          {t('customers.taxId')}
                        </Typography>
                        <Typography variant="h6">{customer.taxId}</Typography>
                      </Box>
                      <Divider />
                    </>
                  )}

                  {/* Información de Contacto */}
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      gutterBottom
                    >
                      Contacto
                    </Typography>
                    <Stack spacing={1.5}>
                      {customer.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email color="action" />
                          <Typography variant="body1">{customer.email}</Typography>
                        </Box>
                      )}
                      {customer.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone color="action" />
                          <Typography variant="body1">{customer.phone}</Typography>
                        </Box>
                      )}
                      {!customer.email && !customer.phone && (
                        <Typography variant="body2" color="text.secondary">
                          No hay información de contacto
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Dirección */}
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      gutterBottom
                    >
                      Dirección
                    </Typography>
                    {customer.address || customer.city ? (
                      <Stack spacing={0.5}>
                        {customer.address && (
                          <Typography variant="body1">{customer.address}</Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="action" sx={{ fontSize: 20 }} />
                          <Typography variant="body1">
                            {[
                              customer.city,
                              customer.postalCode,
                              customer.country,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay dirección registrada
                      </Typography>
                    )}
                  </Box>

                  {/* Notas */}
                  {customer.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          gutterBottom
                        >
                          Notas Internas
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {customer.notes}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={3}>
              {/* Estadísticas */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estadísticas
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt color="action" />
                        <Typography variant="body2">Facturas</Typography>
                      </Box>
                      <Chip
                        label={customer._count?.invoices || 0}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Fechas */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información Adicional
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cliente desde
                      </Typography>
                      <Typography variant="body2">
                        {new Date(customer.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Última actualización
                      </Typography>
                      <Typography variant="body2">
                        {new Date(customer.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}
