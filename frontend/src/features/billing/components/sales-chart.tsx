import { Card, CardContent, Typography, Box } from '@mui/material'
import type { WorkshopStats } from '../services/stats-service'
import { formatCurrency, formatMonthName } from '../services/stats-service'

interface SalesChartProps {
  stats: WorkshopStats
}

export const SalesChart = ({ stats }: SalesChartProps) => {
  const { monthlySales } = stats

  if (monthlySales.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ventas por Mes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay datos disponibles
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue))

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          📈 Ventas Últimos {monthlySales.length} Meses
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Evolución de facturación mensual
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 300, px: 2 }}>
          {monthlySales.map((monthData, index) => {
            const heightPercent = (monthData.revenue / maxRevenue) * 100
            const isCurrentMonth = index === monthlySales.length - 1

            return (
              <Box
                key={monthData.month}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {/* Tooltip con valor */}
                <Box
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '.chart-bar:hover ~ &': { opacity: 1 },
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid',
                      borderTopColor: 'primary.main',
                    },
                  }}
                >
                  {formatCurrency(monthData.revenue)}
                </Box>

                {/* Barra */}
                <Box
                  className="chart-bar"
                  sx={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    minHeight: monthData.revenue > 0 ? 20 : 0,
                    backgroundColor: isCurrentMonth ? 'primary.main' : 'primary.light',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'scaleY(1.05)',
                      transformOrigin: 'bottom',
                      boxShadow: 2,
                    },
                  }}
                />

                {/* Etiqueta del mes */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: isCurrentMonth ? 'bold' : 'normal',
                    color: isCurrentMonth ? 'primary.main' : 'text.secondary',
                    textAlign: 'center',
                  }}
                >
                  {formatMonthName(monthData.month)}
                </Typography>

                {/* Número de facturas */}
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {monthData.invoiceCount} fact.
                </Typography>
              </Box>
            )
          })}
        </Box>

        {/* Leyenda */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{ width: 16, height: 16, backgroundColor: 'primary.main', borderRadius: 0.5 }}
            />
            <Typography variant="caption">Mes Actual</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{ width: 16, height: 16, backgroundColor: 'primary.light', borderRadius: 0.5 }}
            />
            <Typography variant="caption">Meses Anteriores</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
