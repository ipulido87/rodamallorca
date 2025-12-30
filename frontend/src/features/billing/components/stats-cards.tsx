import { Card, CardContent, Typography, Box, Chip } from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Receipt,
  ShoppingCart,
  AccountBalance,
} from '@mui/icons-material'
import type { WorkshopStats } from '../services/stats-service'
import { formatCurrency, formatPercentage } from '../services/stats-service'

interface StatsCardsProps {
  stats: WorkshopStats
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const { currentMonth, growth } = stats

  const cards = [
    {
      title: 'Facturado Este Mes',
      value: formatCurrency(currentMonth.revenue),
      icon: <Euro sx={{ fontSize: 40, color: 'primary.main' }} />,
      change: growth.revenueChange,
      changeLabel: 'vs mes anterior',
      color: 'primary.main',
      bgColor: 'primary.lighter',
    },
    {
      title: 'Facturas Emitidas',
      value: currentMonth.invoiceCount.toString(),
      icon: <Receipt sx={{ fontSize: 40, color: 'success.main' }} />,
      change: growth.invoiceChange,
      changeLabel: 'vs mes anterior',
      color: 'success.main',
      bgColor: 'success.lighter',
    },
    {
      title: 'Promedio por Factura',
      value: formatCurrency(currentMonth.averageOrderValue),
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'info.main' }} />,
      change: null,
      changeLabel: '',
      color: 'info.main',
      bgColor: 'info.lighter',
    },
    {
      title: 'IVA Cobrado (21%)',
      value: formatCurrency(currentMonth.taxCollected),
      icon: <AccountBalance sx={{ fontSize: 40, color: 'warning.main' }} />,
      change: null,
      changeLabel: 'a pagar al estado',
      color: 'warning.main',
      bgColor: 'warning.lighter',
    },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
      {cards.map((card, index) => (
        <Card
          key={index}
          sx={{
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: card.bgColor || 'grey.100',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </Box>
              {card.change !== null && (
                <Chip
                  icon={card.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                  label={formatPercentage(card.change)}
                  size="small"
                  color={card.change >= 0 ? 'success' : 'error'}
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>

            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, color: card.color }}>
              {card.value}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {card.title}
            </Typography>

            {card.changeLabel && (
              <Typography variant="caption" color="text.secondary">
                {card.changeLabel}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
