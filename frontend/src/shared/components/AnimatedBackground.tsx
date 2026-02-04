import { Box, keyframes } from '@mui/material'

// Smooth gradient animation
const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`

// Subtle pulse
const pulse = keyframes`
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
`

export function AnimatedBackground() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        // Dark solid gradient
        background: `linear-gradient(
          135deg,
          #0a0a1a 0%,
          #0d1b2a 25%,
          #1b263b 50%,
          #0d1b2a 75%,
          #0a0a1a 100%
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 20s ease infinite`,
      }}
    >
      {/* Subtle accent glow - top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(65, 105, 225, 0.12) 0%, transparent 70%)',
          animation: `${pulse} 8s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle accent glow - bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100, 80, 180, 0.08) 0%, transparent 70%)',
          animation: `${pulse} 10s ease-in-out infinite`,
          animationDelay: '2s',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}
