import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Storage,
  Memory,
  AccessTime,
  Info,
} from '@mui/icons-material'
import { API_URL } from '../constants/api'

interface SystemStatus {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  uptime: number
  environment: string
  version: string
  node: string
  memory: {
    rss: string
    heapUsed: string
    heapTotal: string
  }
  services: Record<string, string>
  responseTime: string
}

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'ok' || status === 'connected') {
    return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
  }
  if (status === 'degraded') {
    return <Warning sx={{ color: 'warning.main', fontSize: 20 }} />
  }
  return <Error sx={{ color: 'error.main', fontSize: 20 }} />
}

const statusColor = (status: string) => {
  if (status === 'ok' || status === 'connected') return 'success'
  if (status === 'degraded') return 'warning'
  return 'error'
}

export const SystemStatusPage = () => {
  const [data, setData] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const base = API_URL.replace(/\/api$/, '')
      const res = await fetch(`${base}/api/status`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: SystemStatus = await res.json()
      setData(json)
      setLastChecked(new Date())
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const overallStatus = error ? 'error' : (data?.status ?? 'error')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Estado del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {lastChecked
                ? `Última comprobación: ${lastChecked.toLocaleTimeString('es-ES')}`
                : 'Comprobando...'}
            </Typography>
          </Box>
          <Tooltip title="Actualizar">
            <IconButton onClick={fetchStatus} disabled={loading}>
              <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Overall status banner */}
        <Card
          sx={{
            mb: 3,
            borderLeft: 4,
            borderColor:
              overallStatus === 'ok'
                ? 'success.main'
                : overallStatus === 'degraded'
                ? 'warning.main'
                : 'error.main',
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <StatusIcon status={overallStatus} />
            )}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {loading
                  ? 'Comprobando...'
                  : overallStatus === 'ok'
                  ? 'Todos los sistemas operativos'
                  : overallStatus === 'degraded'
                  ? 'Servicios degradados'
                  : 'Error de conexión'}
              </Typography>
              {data && (
                <Chip
                  label={data.status.toUpperCase()}
                  color={statusColor(data.status) as any}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Card sx={{ mb: 3, bgcolor: 'error.50' }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        )}

        {data && (
          <Grid container spacing={2}>
            {/* Services */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Storage fontSize="small" />
                    Servicios
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {Object.entries(data.services).map(([name, status]) => (
                    <Box
                      key={name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                      }}
                    >
                      <Typography sx={{ textTransform: 'capitalize' }}>{name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusIcon status={status} />
                        <Chip
                          label={status}
                          color={statusColor(status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Memory */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Memory fontSize="small" />
                    Memoria
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {[
                    { label: 'RSS', value: data.memory.rss },
                    { label: 'Heap usado', value: data.memory.heapUsed },
                    { label: 'Heap total', value: data.memory.heapTotal },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* System info */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info fontSize="small" />
                    Sistema
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {[
                    { label: 'Entorno', value: data.environment },
                    { label: 'Versión', value: data.version },
                    { label: 'Node.js', value: data.node },
                    { label: 'Tiempo respuesta', value: data.responseTime },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Uptime */}
            <Grid item xs={12}>
              <Card>
                <CardContent
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <AccessTime color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tiempo activo
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {formatUptime(data.uptime)}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Typography variant="body2" color="text.secondary">
                      Desde
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(data.timestamp).toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}
