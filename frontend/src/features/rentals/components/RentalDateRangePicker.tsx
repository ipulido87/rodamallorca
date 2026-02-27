import { useState, useCallback } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
  Box,
  Popover,
  Dialog,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Paper,
  IconButton,
  Divider,
} from '@mui/material'
import { CalendarMonth, Close, ArrowForward } from '@mui/icons-material'

interface BlockedRange {
  startDate: string
  endDate: string
}

interface RentalDateRangePickerProps {
  startDate: string
  endDate: string
  onDatesChange: (start: string, end: string) => void
  blockedRanges: BlockedRange[]
  minDays: number
  maxDays: number
}

const toDateStr = (d: Date) => d.toISOString().split('T')[0]

const parseLocalDate = (str: string) => {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatShort = (dateStr: string) =>
  parseLocalDate(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  })

const formatFull = (dateStr: string) =>
  parseLocalDate(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const RentalDateRangePicker = ({
  startDate,
  endDate,
  onDatesChange,
  blockedRanges,
  minDays,
  maxDays,
}: RentalDateRangePickerProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [range, setRange] = useState<DateRange | undefined>(
    startDate
      ? { from: parseLocalDate(startDate), to: endDate ? parseLocalDate(endDate) : undefined }
      : undefined
  )
  const [rangeError, setRangeError] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const disabledDays = [
    { before: today },
    ...blockedRanges.map((b) => ({
      from: parseLocalDate(b.startDate),
      to: parseLocalDate(b.endDate),
    })),
  ]

  const handleSelect = useCallback(
    (selected: DateRange | undefined) => {
      setRangeError(null)
      setRange(selected)
      if (selected?.from && selected?.to) {
        const msPerDay = 1000 * 60 * 60 * 24
        const days = Math.round((selected.to.getTime() - selected.from.getTime()) / msPerDay)
        if (days < minDays) {
          setRangeError(`Mínimo ${minDays} día${minDays !== 1 ? 's' : ''}`)
          setRange({ from: selected.from, to: undefined })
          return
        }
        if (days > maxDays) {
          setRangeError(`Máximo ${maxDays} días`)
          setRange({ from: selected.from, to: undefined })
          return
        }
        onDatesChange(toDateStr(selected.from), toDateStr(selected.to))
        setAnchorEl(null)
      }
    },
    [minDays, maxDays, onDatesChange]
  )

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRange(undefined)
    setRangeError(null)
    onDatesChange('', '')
  }

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setRangeError(null)
  }

  // Themed calendar styles
  const primary = theme.palette.primary.main
  const calendarSx = {
    '& .rdp-root': {
      '--rdp-accent-color': primary,
      '--rdp-accent-background-color': alpha(primary, 0.15),
      '--rdp-range_start-color': theme.palette.primary.contrastText,
      '--rdp-range_end-color': theme.palette.primary.contrastText,
      '--rdp-range_start-background': primary,
      '--rdp-range_end-background': primary,
      '--rdp-range_start-date-background-color': primary,
      '--rdp-range_end-date-background-color': primary,
      '--rdp-selected-border': `2px solid ${primary}`,
      '--rdp-outside-opacity': '0.3',
      '--rdp-disabled-opacity': '0.3',
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily,
    },
    '& .rdp-month_caption .rdp-caption_label': {
      fontWeight: 600,
      color: theme.palette.text.primary,
      fontSize: '0.95rem',
    },
    '& .rdp-weekday': {
      color: theme.palette.text.secondary,
      fontSize: '0.72rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
    },
    '& .rdp-day_button': {
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
      borderRadius: '6px',
      '&:hover:not([disabled])': {
        backgroundColor: alpha(primary, 0.12),
        color: primary,
      },
    },
    // Range middle days
    '& .rdp-range_middle': {
      backgroundColor: alpha(primary, 0.12),
      borderRadius: 0,
      '& .rdp-day_button': {
        color: primary,
        fontWeight: 500,
        '&:hover': {
          backgroundColor: alpha(primary, 0.2),
        },
      },
    },
    // Start/end of range
    '& .rdp-range_start .rdp-day_button, & .rdp-range_end .rdp-day_button': {
      backgroundColor: primary,
      color: theme.palette.primary.contrastText,
      fontWeight: 700,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    '& .rdp-range_start': {
      borderRadius: '6px 0 0 6px',
      backgroundColor: alpha(primary, 0.12),
    },
    '& .rdp-range_end': {
      borderRadius: '0 6px 6px 0',
      backgroundColor: alpha(primary, 0.12),
    },
    '& .rdp-range_start.rdp-range_end': {
      borderRadius: '6px',
    },
    // Disabled/blocked
    '& .rdp-disabled .rdp-day_button, & [aria-disabled="true"] .rdp-day_button': {
      color: theme.palette.text.disabled,
      textDecoration: 'line-through',
      cursor: 'not-allowed',
    },
    // Today
    '& .rdp-today:not(.rdp-range_start):not(.rdp-range_end) .rdp-day_button': {
      fontWeight: 700,
      color: primary,
    },
    // Nav buttons
    '& .rdp-nav_button': {
      color: theme.palette.text.secondary,
      borderRadius: '6px',
      '&:hover': {
        backgroundColor: alpha(primary, 0.1),
        color: primary,
      },
    },
  }

  const daysCount =
    range?.from && range?.to
      ? Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
      : null

  const calendarContent = (
    <Box sx={{ p: { xs: 2, md: 2.5 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {!range?.from
              ? 'Elige la fecha de recogida'
              : !range.to
                ? 'Elige la fecha de devolución'
                : `${daysCount} día${daysCount !== 1 ? 's' : ''} seleccionado${daysCount !== 1 ? 's' : ''}`}
          </Typography>
          {range?.from && range?.to && (
            <Typography variant="caption" color="text.secondary">
              {formatFull(toDateStr(range.from))} → {formatFull(toDateStr(range.to))}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {rangeError && (
        <Typography
          color="error"
          variant="caption"
          sx={{ display: 'block', mb: 1, fontWeight: 500 }}
        >
          ⚠ {rangeError}
        </Typography>
      )}

      {/* Calendar */}
      <Box sx={calendarSx}>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={disabledDays}
          numberOfMonths={isMobile ? 1 : 2}
          weekStartsOn={1}
          showOutsideDays={false}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Mín. {minDays} día{minDays !== 1 ? 's' : ''} · Máx. {maxDays} días
        </Typography>
        {(startDate || range?.from) && (
          <Typography
            variant="caption"
            color="primary"
            onClick={handleClear}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Limpiar fechas
          </Typography>
        )}
      </Box>
    </Box>
  )

  // Trigger button label
  const triggerContent = (
    <Box
      onClick={handleOpen}
      component={Paper}
      variant="outlined"
      sx={{
        p: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'stretch',
        mb: 2,
        borderRadius: 1.5,
        overflow: 'hidden',
        borderColor: open ? 'primary.main' : 'divider',
        borderWidth: open ? 2 : 1,
        '&:hover': { borderColor: 'primary.main' },
        transition: 'border-color 0.2s',
      }}
    >
      {/* Fecha inicio */}
      <Box
        sx={{
          flex: 1,
          px: 2,
          py: 1.5,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
          Recogida
        </Typography>
        <Typography variant="body2" fontWeight={startDate ? 600 : 400} color={startDate ? 'text.primary' : 'text.disabled'}>
          {startDate ? formatShort(startDate) : 'Añadir fecha'}
        </Typography>
      </Box>

      {/* Arrow */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, color: 'text.disabled' }}>
        <ArrowForward fontSize="small" />
      </Box>

      {/* Fecha fin */}
      <Box
        sx={{
          flex: 1,
          px: 2,
          py: 1.5,
          borderLeft: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
          Devolución
        </Typography>
        <Typography variant="body2" fontWeight={endDate ? 600 : 400} color={endDate ? 'text.primary' : 'text.disabled'}>
          {endDate ? formatShort(endDate) : 'Añadir fecha'}
        </Typography>
      </Box>

      {/* Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, color: open ? 'primary.main' : 'text.secondary' }}>
        <CalendarMonth fontSize="small" />
      </Box>
    </Box>
  )

  return (
    <>
      {triggerContent}

      {/* Desktop: Popover */}
      {!isMobile && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              mt: 1,
              bgcolor: 'background.paper',
              boxShadow: 8,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 620,
            },
          }}
        >
          {calendarContent}
        </Popover>
      )}

      {/* Mobile: Dialog */}
      {isMobile && (
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3, mx: 2 } }}
        >
          {calendarContent}
        </Dialog>
      )}
    </>
  )
}
