// components/common/FilterBar.tsx

import { Clear, ExpandLess, ExpandMore, FilterList } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type {
  FilterConfig,
  FilterValue,
  FilterValues,
} from '../../features/catalog/types/catalog'

interface FilterBarProps {
  filters: FilterConfig[]
  values: FilterValues
  onChange: (key: string, value: FilterValue) => void
  onClear: () => void
  collapsible?: boolean
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  collapsible = true,
}) => {
  const [expanded, setExpanded] = useState(false)

  const hasActiveFilters = Object.entries(values).some(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return false
    }

    // Para rangos, verificamos si es diferente del rango por defecto
    if (Array.isArray(value)) {
      const filter = filters.find((f) => f.key === key)
      if (filter && filter.type === 'range') {
        const defaultMin = filter.min || 0
        const defaultMax = filter.max || 100
        return value[0] !== defaultMin || value[1] !== defaultMax
      }
    }

    return true
  })

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key]

    switch (filter.type) {
      case 'select': {
        return (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value || ''}
              label={filter.label}
              onChange={(e) =>
                onChange(filter.key, e.target.value || undefined)
              }
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }

      case 'text': {
        return (
          <TextField
            size="small"
            label={filter.label}
            placeholder={filter.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            sx={{ minWidth: 150 }}
          />
        )
      }

      case 'range': {
        const rangeValue = value as [number, number] | undefined
        const defaultRange: [number, number] = [
          filter.min || 0,
          filter.max || 100,
        ]
        return (
          <Box sx={{ minWidth: 200, px: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {filter.label}
            </Typography>
            <Slider
              value={rangeValue || defaultRange}
              onChange={(_, newValue) =>
                onChange(filter.key, newValue as [number, number])
              }
              valueLabelDisplay="auto"
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              valueLabelFormat={(val) => `€${val}`}
              marks={[
                { value: filter.min || 0, label: `€${filter.min || 0}` },
                { value: filter.max || 100, label: `€${filter.max || 100}` },
              ]}
            />
          </Box>
        )
      }

      default:
        return null
    }
  }

  const getDisplayValue = (
    filter: FilterConfig,
    value: FilterValue
  ): string => {
    if (!value) return ''

    switch (filter.type) {
      case 'range':
        if (Array.isArray(value)) {
          return `€${value[0]} - €${value[1]}`
        }
        return ''
      case 'select': {
        const option = filter.options?.find((opt) => opt.value === value)
        return option?.label || String(value)
      }
      case 'text':
        return String(value)
      default:
        return String(value)
    }
  }

  const content = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems="flex-start"
    >
      {filters.map((filter) => (
        <Box key={filter.key}>{renderFilter(filter)}</Box>
      ))}

      {hasActiveFilters && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Clear />}
          onClick={onClear}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Limpiar filtros
        </Button>
      )}
    </Stack>
  )

  if (!collapsible) {
    return (
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {content}
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          p: 1,
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 1,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          Filtros{' '}
          {hasActiveFilters && `(${Object.keys(values).length} activos)`}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          {content}
        </Box>
      </Collapse>

      {hasActiveFilters && !expanded && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {Object.entries(values).map(([key, value]) => {
            if (!value) return null
            const filter = filters.find((f) => f.key === key)
            if (!filter) return null

            const displayValue = getDisplayValue(filter, value)
            if (!displayValue) return null

            return (
              <Chip
                key={key}
                label={`${filter.label}: ${displayValue}`}
                size="small"
                onDelete={() => onChange(key, undefined)}
                variant="outlined"
              />
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
