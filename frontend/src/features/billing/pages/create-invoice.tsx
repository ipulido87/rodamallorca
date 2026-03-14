import { Add, Delete, ArrowBack, CameraAlt } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  GridLegacy as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import {
  createInvoice,
  getCustomersByWorkshop,
  getInvoiceSeriesByWorkshop,
  formatPrice,
  type Customer,
  type InvoiceSeries,
  type InvoiceItem,
} from '../services/billing-service'
import { InvoiceOcrScanner, type OcrInvoiceData } from '../components/invoice-ocr-scanner'

export const CreateInvoice = () => {
  const { workshopId } = useParams<{ workshopId: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useSnackbar()

  const { data: customers = [] } = useSWR<Customer[]>(
    workshopId ? `/billing/customers/${workshopId}` : null,
    () => getCustomersByWorkshop(workshopId!),
  )
  const { data: series = [] } = useSWR<InvoiceSeries[]>(
    workshopId ? `/billing/series/${workshopId}` : null,
    () => getInvoiceSeriesByWorkshop(workshopId!),
  )

  const [loading, setLoading] = useState(false)
  const [ocrDialogOpen, setOcrDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    customerId: '',
    seriesId: '',
    notes: '',
    paymentMethod: '',
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 21,
    },
  ])

  // Seleccionar serie por defecto cuando llegan los datos
  useEffect(() => {
    const defaultSeries = series.find((s) => s.isDefault)
    if (defaultSeries && !formData.seriesId) {
      setFormData((prev) => ({ ...prev, seriesId: defaultSeries.id }))
    }
  }, [series, formData.seriesId])

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 21,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice - item.discount
    const tax = subtotal * (item.taxRate / 100)
    return subtotal + tax
  }

  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice - item.discount
      const itemTax = itemSubtotal * (item.taxRate / 100)
      subtotal += itemSubtotal
      taxAmount += itemTax
    })

    return { subtotal, taxAmount, total: subtotal + taxAmount }
  }

  const handleOcrDataExtracted = (data: OcrInvoiceData) => {
    // Aplicar datos extraídos del OCR al formulario
    if (data.providerName && !formData.notes) {
      setFormData((prev) => ({
        ...prev,
        notes: `Proveedor: ${data.providerName}${data.taxId ? `\nNIF/CIF: ${data.taxId}` : ''}`,
      }))
    }

    // Si hay conceptos extraídos, añadirlos como items
    if (data.concepts && data.concepts.length > 0) {
      const newItems = data.concepts.map((concept) => ({
        description: concept,
        quantity: 1,
        unitPrice: data.amounts?.total
          ? Math.round(data.amounts.total / data.concepts!.length)
          : 0,
        discount: 0,
        taxRate: 21,
      }))
      setItems(newItems)
    }

    // Si hay un total, ajustar el primer item
    if (data.amounts?.total && items.length > 0) {
      const total = data.amounts.total
      const subtotal = data.amounts.subtotal || total / 1.21
      setItems([
        {
          ...items[0],
          description: items[0].description || 'Servicio',
          unitPrice: subtotal,
        },
      ])
    }

    setOcrDialogOpen(false)
    showSuccess('✓ Datos extraídos del OCR aplicados al formulario')
  }

  const handleSubmit = async () => {
    if (!workshopId) return

    if (!formData.seriesId) {
      showError('Selecciona una serie de facturación')
      return
    }

    if (items.length === 0 || !items[0].description) {
      showError('Agrega al menos una línea a la factura')
      return
    }

    try {
      setLoading(true)

      const invoiceData = {
        workshopId,
        customerId: formData.customerId || undefined,
        seriesId: formData.seriesId,
        notes: formData.notes || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Math.round(item.unitPrice * 100), // Convertir a céntimos
          discount: Math.round(item.discount * 100),
          taxRate: item.taxRate,
        })),
      }

      await createInvoice(invoiceData)
      showSuccess('✓ Factura creada correctamente')
      navigate(`/billing/${workshopId}`)
    } catch (error) {
      showError('Error al crear la factura')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/billing/${workshopId}`)}>
            Volver
          </Button>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Nueva Factura
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CameraAlt />}
              onClick={() => setOcrDialogOpen(true)}
              color="secondary"
            >
              Escanear Factura (OCR)
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Cliente y Serie */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Datos de la Factura
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Cliente (opcional)</InputLabel>
                      <Select
                        value={formData.customerId}
                        label="Cliente (opcional)"
                        onChange={(e) =>
                          setFormData({ ...formData, customerId: e.target.value })
                        }
                      >
                        <MenuItem value="">Sin cliente</MenuItem>
                        {customers.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Serie</InputLabel>
                      <Select
                        value={formData.seriesId}
                        label="Serie"
                        onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                      >
                        {series.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} ({s.prefix})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Método de Pago"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value })
                      }
                      placeholder="Efectivo, Tarjeta, Transferencia..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Notas"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Líneas de Factura */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Líneas de Factura</Typography>
                  <Button startIcon={<Add />} onClick={addItem} size="small">
                    Agregar Línea
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {items.map((item, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              required
                              label="Descripción"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Cantidad"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, 'quantity', parseFloat(e.target.value))
                              }
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Precio €"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(index, 'unitPrice', parseFloat(e.target.value))
                              }
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Desc. €"
                              value={item.discount}
                              onChange={(e) =>
                                updateItem(index, 'discount', parseFloat(e.target.value))
                              }
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <TextField
                              fullWidth
                              type="number"
                              label="IVA %"
                              value={item.taxRate}
                              onChange={(e) =>
                                updateItem(index, 'taxRate', parseFloat(e.target.value))
                              }
                              inputProps={{ min: 0, max: 100 }}
                            />
                          </Grid>
                          <Grid item xs={10} md={2}>
                            <Typography variant="body1" fontWeight="bold">
                              {formatPrice(Math.round(calculateItemTotal(item) * 100))}
                            </Typography>
                          </Grid>
                          <Grid item xs={2} md={1}>
                            <IconButton
                              color="error"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">
                      {formatPrice(Math.round(totals.subtotal * 100))}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">IVA:</Typography>
                    <Typography variant="body2">
                      {formatPrice(Math.round(totals.taxAmount * 100))}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatPrice(Math.round(totals.total * 100))}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Factura'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* OCR Scanner Dialog */}
      <InvoiceOcrScanner
        open={ocrDialogOpen}
        onClose={() => setOcrDialogOpen(false)}
        onDataExtracted={handleOcrDataExtracted}
      />
    </Container>
  )
}
