import {
  Add,
  Receipt,
  Visibility,
  Send,
  CheckCircle,
  Cancel as CancelIcon,
  Warning,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import {
  formatDate,
  formatPrice,
  getInvoicesByWorkshop,
  getInvoiceStatusColor,
  getInvoiceStatusLabel,
  type Invoice,
} from '../services/billing-service'
import { getWorkshopStats } from '../services/stats-service'
import { StatsCards } from '../components/stats-cards'

export const BillingInvoices = () => {
  const { workshopId } = useParams<{ workshopId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showError } = useSnackbar()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch workshop stats
  const { data: stats, isLoading: statsLoading } = useSWR(
    workshopId ? `/owner/billing/workshops/${workshopId}/stats` : null,
    () => workshopId ? getWorkshopStats(workshopId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const loadInvoices = useCallback(async () => {
    if (!workshopId) return

    try {
      setLoading(true)
      const data = await getInvoicesByWorkshop(workshopId)
      setInvoices(data)
    } catch (error) {
      showError(t('billing.errorLoadingInvoices'))
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }, [workshopId, showError])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle />
      case 'SENT':
        return <Send />
      case 'OVERDUE':
        return <Warning />
      case 'CANCELLED':
        return <CancelIcon />
      default:
        return <Receipt />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('billing.loadingInvoices')}
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('billing.invoicing')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('billing.manageInvoices')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`/billing/${workshopId}/create`)}
          >
            {t('billing.newInvoice')}
          </Button>
        </Box>

        {/* Statistics Summary */}
        {stats && !statsLoading && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {t('billing.financialSummary')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('billing.currentMonthStats')}
            </Typography>
            <StatsCards stats={stats} />
          </Box>
        )}

        {invoices.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {t('billing.noInvoicesYet')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {t('billing.createFirstInvoiceHint')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(`/billing/${workshopId}/create`)}
            >
              {t('billing.createFirstInvoice')}
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        {getStatusIcon(invoice.status)}
                        <Typography variant="h6">{invoice.invoiceNumber}</Typography>
                      </Stack>

                      {invoice.customer && (
                        <Typography variant="body2" color="text.secondary">
                          {t('billing.customer')}: {invoice.customer.name}
                        </Typography>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        {t('billing.date')}: {formatDate(invoice.issueDate)}
                      </Typography>

                      {invoice.dueDate && (
                        <Typography variant="body2" color="text.secondary">
                          {t('billing.dueDate')}: {formatDate(invoice.dueDate)}
                        </Typography>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={getInvoiceStatusLabel(invoice.status)}
                          color={getInvoiceStatusColor(invoice.status)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {formatPrice(invoice.total)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('billing.subtotal')}: {formatPrice(invoice.subtotal)}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {t('billing.tax')}: {formatPrice(invoice.taxAmount)}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/billing/${workshopId}/invoice/${invoice.id}`)}
                        >
                          {t('billing.viewDetails')}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  )
}
