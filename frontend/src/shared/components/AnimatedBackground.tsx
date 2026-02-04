import { Box, keyframes } from '@mui/material'

// Slow zoom animation on the background image
const slowZoom = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

// Floating particles
const floatUp = keyframes`
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-20vh) translateX(30px);
    opacity: 0;
  }
`

// Cyclist moving across screen
const cyclistMove = keyframes`
  0% {
    transform: translateX(-100px);
    opacity: 0;
  }
  5% {
    opacity: 0.7;
  }
  95% {
    opacity: 0.7;
  }
  100% {
    transform: translateX(calc(100vw + 100px));
    opacity: 0;
  }
`

// Simple particle
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
        background: 'rgba(255, 255, 255, 0.7)',
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
        animation: `${floatUp} ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
      }}
    />
  )
}

// Minimalist cyclist silhouette - just simple shapes
function CyclistSilhouette({ delay, bottom, speed }: { delay: number; bottom: string; speed: number }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom,
        left: 0,
        width: 60,
        height: 35,
        animation: `${cyclistMove} ${speed}s linear infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
        opacity: 0,
      }}
    >
      <svg viewBox="0 0 60 35" style={{ width: '100%', height: '100%' }}>
        {/* Back wheel */}
        <circle cx="10" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
        {/* Front wheel */}
        <circle cx="50" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
        {/* Frame - simple triangle */}
        <path
          d="M10,28 L25,12 L40,12 L50,28 M25,12 L10,28 M25,28 L40,12"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Rider - simple */}
        <circle cx="30" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
        <path
          d="M28,10 L26,18 L25,28"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M27,14 L40,13"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

export function AnimatedBackground() {
  // Generate particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${(i * 5) % 100}%`,
    size: 2 + (i % 3),
    duration: 15 + (i % 10),
    delay: (i * 0.8) % 15,
  }))

  // Cyclists
  const cyclists = [
    { delay: 0, bottom: '8%', speed: 18 },
    { delay: 6, bottom: '12%', speed: 22 },
    { delay: 12, bottom: '6%', speed: 20 },
  ]

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
      }}
    >
      {/* Background image with slow zoom */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://img.locationscout.net/images/2017-05/sa-calobra-road-mallorca-spain_l.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: `${slowZoom} 30s ease-in-out infinite`,
        }}
      />

      {/* Dark overlay for text legibility */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

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

      {/* Cyclist silhouettes */}
      {cyclists.map((c, i) => (
        <CyclistSilhouette
          key={i}
          delay={c.delay}
          bottom={c.bottom}
          speed={c.speed}
        />
      ))}

      {/* Vignette */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}
