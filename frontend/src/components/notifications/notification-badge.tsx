import { Badge } from '@mui/material'
import type { BadgeProps } from '@mui/material'
import { keyframes } from '@mui/system'

// Animación de pulso para el badge
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

interface NotificationBadgeProps extends Omit<BadgeProps, 'badgeContent'> {
  count: number
  animate?: boolean
}

/**
 * Badge de notificaciones con animación opcional
 * Muestra el contador de notificaciones no leídas
 */
export const NotificationBadge = ({
  count,
  animate = true,
  children,
  ...badgeProps
}: NotificationBadgeProps) => {
  if (count === 0) {
    return <>{children}</>
  }

  const badgeSx = {
    '& .MuiBadge-badge': {
      animation: animate ? `${pulse} 2s ease-in-out infinite` : 'none',
      fontWeight: 'bold',
      fontSize: '0.75rem',
      height: '20px',
      minWidth: '20px',
    },
  }

  return (
    <Badge
      badgeContent={count > 99 ? '99+' : count}
      color="error"
      {...badgeProps}
      sx={badgeSx}
    >
      {children}
    </Badge>
  )
}
