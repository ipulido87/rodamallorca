import { ArrowBack, Download, Print } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import { getInvoiceById, formatPrice, getInvoiceStatusColor } from '../services/billing-service'
import { InvoicePDF } from '../components/invoice-pdf'
import type { Invoice } from '../services/billing-service'

export const InvoiceDetails = () => {
  const { workshopId, invoiceId } = useParams<{ workshopId: string; invoiceId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showError, showSuccess } = useSnackbar()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      const data = await getInvoiceById(invoiceId!)
      setInvoice(data)
    } catch (error) {
      showError(t('billing.errorLoadingInvoice'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return

    try {
      setDownloading(true)

      // Generar el PDF
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          workshopName="Tu Taller de Bicicletas"
          workshopAddress="Calle Principal 123, 28001 Madrid"
          workshopTaxId="B12345678"
          workshopPhone="+34 600 123 456"
          workshopEmail="contacto@tutaller.com"
        />
      ).toBlob()

      // Crear URL y descargar
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Factura_${invoice.invoiceNumber}.pdf`
      link.click()

      URL.revokeObjectURL(url)
      showSuccess(t('billing.pdfDownloaded'))
    } catch (error) {
      showError(t('billing.errorGeneratingPdf'))
      console.error(error)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = async () => {
    if (!invoice) return

    try {
      // Generar el PDF y abrirlo en nueva ventana para imprimir
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          workshopName="Tu Taller de Bicicletas"
          workshopAddress="Calle Principal 123, 28001 Madrid"
          workshopTaxId="B12345678"
          workshopPhone="+34 600 123 456"
          workshopEmail="contacto@tutaller.com"
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      showSuccess(t('billing.openingPrintView'))
    } catch (error) {
      showError(t('billing.errorPreparingPrint'))
      console.error(error)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: t('billing.statusDraft'),
      SENT: t('billing.statusSent'),
      PAID: t('billing.statusPaid'),
      OVERDUE: t('billing.statusOverdue'),
      CANCELLED: t('billing.statusCancelled'),
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>{t('billing.loadingInvoice')}</Typography>
        </Box>
      </Container>
    )
  }

  if (!invoice) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5">{t('billing.invoiceNotFound')}</Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/billing/${workshopId}`)}
            sx={{ mt: 2 }}
          >
            {t('billing.backToInvoices')}
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/billing/${workshopId}`)}
            sx={{ mb: 2 }}
          >
            {t('billing.backToInvoices')}
          </Button>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {invoice.invoiceNumber}
              </Typography>
              <Chip
                label={getStatusLabel(invoice.status)}
                color={getInvoiceStatusColor(invoice.status)}
                sx={{ mt: 1 }}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
                disabled={downloading}
              >
                {t('billing.print')}
              </Button>
              <Button
                variant="contained"
                startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                onClick={handleDownloadPDF}
                disabled={downloading}
              >
                {downloading ? t('billing.generating') : t('billing.downloadPdf')}
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Invoice Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('billing.invoiceInformation')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('billing.issueDate')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                </Typography>
              </Box>

              {invoice.dueDate && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('billing.dueDateLabel')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              )}

              {invoice.paymentMethod && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('billing.paymentMethod')}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoice.paymentMethod}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('billing.series')}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {invoice.series?.name || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Customer Info */}
        {invoice.customer && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('billing.customerData')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" fontWeight="bold">
                {invoice.customer.name}
              </Typography>
              {invoice.customer.taxId && (
                <Typography variant="body2" color="text.secondary">
                  {t('billing.taxId')}: {invoice.customer.taxId}
                </Typography>
              )}
              {invoice.customer.address && (
                <Typography variant="body2" color="text.secondary">
                  {invoice.customer.address}
                </Typography>
              )}
              {invoice.customer.city && (
                <Typography variant="body2" color="text.secondary">
                  {invoice.customer.postalCode && `${invoice.customer.postalCode} - `}
                  {invoice.customer.city}, {invoice.customer.country}
                </Typography>
              )}
              {invoice.customer.email && (
                <Typography variant="body2" color="text.secondary">
                  {t('billing.email')}: {invoice.customer.email}
                </Typography>
              )}
              {invoice.customer.phone && (
                <Typography variant="body2" color="text.secondary">
                  {t('billing.phone')}: {invoice.customer.phone}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('billing.invoiceLines')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>{t('billing.description')}</TableCell>
                    <TableCell align="right">{t('billing.quantity')}</TableCell>
                    <TableCell align="right">{t('billing.unitPrice')}</TableCell>
                    <TableCell align="right">{t('billing.discount')}</TableCell>
                    <TableCell align="right">{t('billing.taxPercent')}</TableCell>
                    <TableCell align="right">{t('billing.total')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatPrice(item.unitPrice)}</TableCell>
                      <TableCell align="right">
                        {item.discount > 0 ? formatPrice(item.discount) : '-'}
                      </TableCell>
                      <TableCell align="right">{item.taxRate}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(item.total || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ minWidth: 300 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t('billing.subtotal')}:
                  </Typography>
                  <Typography variant="body1">{formatPrice(invoice.subtotal)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t('billing.tax')}:
                  </Typography>
                  <Typography variant="body1">{formatPrice(invoice.taxAmount)}</Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {t('billing.total')}:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(invoice.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('billing.notes')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {invoice.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  )
}
