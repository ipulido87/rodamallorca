import { Box, keyframes } from '@mui/material'

// Gradient shift - more noticeable movement
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

// Floating particles
const floatUp = keyframes`
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-20vh) translateX(30px);
    opacity: 0;
  }
`

// Glow pulse
const glowPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
`

// Particle component
function Particle({ left, size, duration, delay }: { left: string; size: number; duration: number; delay: number }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left,
        bottom: '-5%',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        animation: `${floatUp} ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
      }}
    />
  )
}

export function AnimatedBackground() {
  // Generate particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${(i * 3.5) % 100}%`,
    size: 2 + (i % 4),
    duration: 12 + (i % 8),
    delay: (i * 0.7) % 12,
  }))

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
        // Animated gradient with more contrast
        background: `linear-gradient(
          135deg,
          #0a0a1a 0%,
          #0d1b2a 20%,
          #1e3a5f 40%,
          #2d5a87 50%,
          #1e3a5f 60%,
          #0d1b2a 80%,
          #0a0a1a 100%
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
      }}
    >
      {/* Floating particles */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          left={p.left}
          size={p.size}
          duration={p.duration}
          delay={p.delay}
        />
      ))}

      {/* Animated glow - top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100, 150, 255, 0.25) 0%, transparent 70%)',
          animation: `${glowPulse} 6s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Animated glow - bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(80, 120, 200, 0.2) 0%, transparent 70%)',
          animation: `${glowPulse} 8s ease-in-out infinite`,
          animationDelay: '3s',
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
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}
