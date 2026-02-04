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

// Large wheel rotation (like Chiliz globe)
const wheelSpin = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`

// Wheel glow pulse
const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    filter: blur(30px);
  }
  50% {
    opacity: 0.6;
    filter: blur(40px);
  }
`

// Cyclist movement across screen
const cyclistMove = keyframes`
  0% {
    transform: translateX(-100px);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 100px));
    opacity: 0;
  }
`

// Star twinkle
const twinkle = keyframes`
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
`

// Particle floating up
const floatUp = keyframes`
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) translateX(20px);
    opacity: 0;
  }
`

// Large rotating bicycle wheel - central element like Chiliz globe
function CentralBicycleWheel() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: { xs: '300px', md: '500px', lg: '600px' },
        height: { xs: '300px', md: '500px', lg: '600px' },
        animation: `${wheelSpin} 20s linear infinite`,
        pointerEvents: 'none',
      }}
    >
      {/* Glow behind wheel */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120%',
          height: '120%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100, 180, 255, 0.4) 0%, rgba(180, 100, 255, 0.2) 40%, transparent 70%)',
          animation: `${glowPulse} 4s ease-in-out infinite`,
        }}
      />
      <svg
        viewBox="0 0 200 200"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {/* Gradient for rim */}
          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="50%" stopColor="rgba(180, 200, 255, 0.7)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.9)" />
          </linearGradient>
          {/* Gradient for hub */}
          <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(150, 180, 255, 0.6)" />
          </radialGradient>
          {/* Glow filter */}
          <filter id="wheelGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer rim */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="url(#rimGradient)"
          strokeWidth="3"
          filter="url(#wheelGlow)"
        />

        {/* Inner rim */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />

        {/* Hub */}
        <circle
          cx="100"
          cy="100"
          r="12"
          fill="url(#hubGradient)"
          filter="url(#wheelGlow)"
        />

        {/* Spokes - 16 spokes like a racing wheel */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16
          const rad = (angle * Math.PI) / 180
          const x1 = 100 + Math.cos(rad) * 15
          const y1 = 100 + Math.sin(rad) * 15
          const x2 = 100 + Math.cos(rad) * 83
          const y2 = 100 + Math.sin(rad) * 83
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1"
            />
          )
        })}
      </svg>
    </Box>
  )
}

// Professional cyclist silhouette SVG
function CyclistSilhouette({ delay, bottom, scale = 1, speed = '15s' }: { delay: string; bottom: string; scale?: number; speed?: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom,
        left: 0,
        width: 80 * scale,
        height: 50 * scale,
        animation: `${cyclistMove} ${speed} linear infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
        opacity: 0,
      }}
    >
      <svg
        viewBox="0 0 100 60"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id={`cyclistGrad${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(200, 220, 255, 0.7)" />
          </linearGradient>
        </defs>

        {/* Back wheel */}
        <circle cx="20" cy="45" r="14" fill="none" stroke={`url(#cyclistGrad${delay})`} strokeWidth="2" />
        <circle cx="20" cy="45" r="3" fill="rgba(255,255,255,0.8)" />

        {/* Front wheel */}
        <circle cx="80" cy="45" r="14" fill="none" stroke={`url(#cyclistGrad${delay})`} strokeWidth="2" />
        <circle cx="80" cy="45" r="3" fill="rgba(255,255,255,0.8)" />

        {/* Frame */}
        <path
          d="M20,45 L40,25 L65,25 L80,45 M40,25 L20,45 M40,25 L50,45 L80,45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Handlebars */}
        <path
          d="M65,25 L70,20 L78,22"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Seat */}
        <path
          d="M38,23 L44,23"
          fill="none"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Cyclist body */}
        <ellipse cx="50" cy="12" rx="5" ry="6" fill="rgba(255, 255, 255, 0.85)" /> {/* Head */}
        <path
          d="M45,18 C43,22 42,28 50,35 L50,45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          strokeLinecap="round"
        /> {/* Body bent forward */}

        {/* Arms reaching to handlebars */}
        <path
          d="M47,22 L55,24 L70,21"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Legs pedaling */}
        <path
          d="M50,35 L45,42 L50,48"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50,35 L55,40 L50,42"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

// Star component
interface StarProps {
  readonly top: string
  readonly left: string
  readonly delay: string
  readonly size: number
}

function Star({ top, left, delay, size }: StarProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 0 4px white',
        top,
        left,
        animation: `${twinkle} 4s ease-in-out infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
      }}
    />
  )
}

// Particle component
interface ParticleProps {
  readonly left: string
  readonly delay: string
  readonly duration: string
  readonly size: number
}

function Particle({ left, delay, duration, size }: ParticleProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 0 6px rgba(255,255,255,0.5)',
        left,
        bottom: 0,
        animation: `${floatUp} ${duration} linear infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
      }}
    />
  )
}

export function AnimatedBackground() {
  // Generate particles - fewer and subtler
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${(i * 6.5) % 100}%`,
    delay: `${(i * 1.2) % 18}s`,
    duration: `${18 + (i % 8)}s`,
    size: 2 + (i % 2),
  }))

  // Generate stars
  const stars = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    top: `${5 + (i * 3) % 45}%`,
    left: `${(i * 4) % 98}%`,
    delay: `${(i * 0.3) % 4}s`,
    size: 1 + (i % 2),
  }))

  // Cyclists with different timing for a "peloton" effect
  const cyclists = [
    { delay: '0s', bottom: '8%', scale: 1.2, speed: '12s' },
    { delay: '2s', bottom: '10%', scale: 1, speed: '13s' },
    { delay: '4s', bottom: '6%', scale: 0.9, speed: '14s' },
    { delay: '7s', bottom: '9%', scale: 1.1, speed: '11s' },
    { delay: '10s', bottom: '7%', scale: 0.85, speed: '15s' },
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
        // Clean animated gradient - Mediterranean blues with purple accent
        background: `linear-gradient(
          135deg,
          #0a1628 0%,
          #0d2847 20%,
          #1a237e 40%,
          #1565c0 60%,
          #0d2847 80%,
          #0a1628 100%
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 25s ease infinite`,
      }}
    >
      {/* Twinkling stars */}
      {stars.map((star) => (
        <Star
          key={star.id}
          top={star.top}
          left={star.left}
          delay={star.delay}
          size={star.size}
        />
      ))}

      {/* Central rotating bicycle wheel - like Chiliz globe */}
      <CentralBicycleWheel />

      {/* Animated cyclists crossing the screen */}
      {cyclists.map((cyclist, i) => (
        <CyclistSilhouette
          key={i}
          delay={cyclist.delay}
          bottom={cyclist.bottom}
          scale={cyclist.scale}
          speed={cyclist.speed}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          left={p.left}
          delay={p.delay}
          duration={p.duration}
          size={p.size}
        />
      ))}

      {/* Subtle light from top center */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: '60%',
          height: '50%',
          background: 'radial-gradient(ellipse at top, rgba(100,180,255,0.1) 0%, transparent 70%)',
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
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(5,10,25,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}
