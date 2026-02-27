import { GridView, Map } from '@mui/icons-material'
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'

export type CatalogView = 'grid' | 'map'

interface MapViewToggleProps {
  value: CatalogView
  onChange: (view: CatalogView) => void
}

/**
 * Toggle entre vista cuadrícula y vista mapa.
 * Diseñado para ser reutilizado en cualquier página de catálogo con mapa.
 */
export const MapViewToggle = ({ value, onChange }: MapViewToggleProps) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    onChange={(_, next) => next && onChange(next)}
    size="small"
    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
  >
    <ToggleButton value="grid" aria-label="Vista cuadrícula">
      <Tooltip title="Vista cuadrícula">
        <GridView fontSize="small" />
      </Tooltip>
    </ToggleButton>
    <ToggleButton value="map" aria-label="Vista mapa">
      <Tooltip title="Vista mapa">
        <Map fontSize="small" />
      </Tooltip>
    </ToggleButton>
  </ToggleButtonGroup>
)
