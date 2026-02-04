import { Box, keyframes } from '@mui/material'

// Smooth floating animations for orbs
const float1 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(80px, -120px) scale(1.1);
  }
  50% {
    transform: translate(-60px, -60px) scale(0.95);
  }
  75% {
    transform: translate(100px, 60px) scale(1.05);
  }
`

const float2 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-100px, 80px) scale(1.2);
  }
  66% {
    transform: translate(70px, -70px) scale(0.9);
  }
`

const float3 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  20% {
    transform: translate(120px, 50px) scale(1.15);
  }
  40% {
    transform: translate(-50px, 120px) scale(0.9);
  }
  60% {
    transform: translate(-120px, -40px) scale(1.1);
  }
  80% {
    transform: translate(60px, -100px) scale(0.95);
  }
`

const twinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
`

const moveParticle = keyframes`
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(30px);
    opacity: 0;
  }
`

const roadMove = keyframes`
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -100;
  }
`

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`

const glow = keyframes`
  0%, 100% {
    filter: blur(40px) brightness(1);
  }
  50% {
    filter: blur(50px) brightness(1.3);
  }
`

// Glowing orb component - MORE VISIBLE
interface GlowingOrbProps {
  readonly size: number
  readonly color: string
  readonly top: string
  readonly left: string
  readonly animation: string
  readonly duration: string
  readonly blur?: number
  readonly opacity?: number
}

function GlowingOrb({ size, color, top, left, animation, duration, blur = 40, opacity = 0.6 }: GlowingOrbProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}, ${color}80 40%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity,
        top,
        left,
        animation: `${animation} ${duration} ease-in-out infinite, ${glow} 4s ease-in-out infinite`,
        pointerEvents: 'none',
        willChange: 'transform, opacity, filter',
      }}
    />
  )
}

// Bright particle component
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
        background: 'white',
        boxShadow: `0 0 ${size * 2}px white, 0 0 ${size * 4}px rgba(100,200,255,0.8)`,
        left,
        bottom: 0,
        animation: `${moveParticle} ${duration} linear infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
      }}
    />
  )
}

// Twinkling star
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
        boxShadow: '0 0 10px white, 0 0 20px rgba(100,200,255,0.5)',
        top,
        left,
        animation: `${twinkle} 3s ease-in-out infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
      }}
    />
  )
}

// Road path SVG - MORE VISIBLE
function CyclingRoadPath() {
  return (
    <Box
      component="svg"
      viewBox="0 0 1920 200"
      sx={{
        position: 'absolute',
        bottom: '8%',
        left: 0,
        width: '100%',
        height: 'auto',
        opacity: 0.4,
        overflow: 'visible',
      }}
    >
      <defs>
        <filter id="roadGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Glow path */}
      <path
        d="M-100,100 Q200,60 500,80 T1000,50 T1500,90 T2020,70"
        fill="none"
        stroke="rgba(100,200,255,0.3)"
        strokeWidth="30"
        filter="url(#roadGlow)"
      />
      {/* Main road path */}
      <path
        d="M-100,100 Q200,60 500,80 T1000,50 T1500,90 T2020,70"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="3"
        strokeDasharray="20,10"
        style={{
          animation: `${roadMove} 8s linear infinite`,
        } as React.CSSProperties}
      />
    </Box>
  )
}

// Minimalist bike wheel - elegant and subtle
const spinWheel = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

interface BikeWheelProps {
  readonly size: number
  readonly top: string
  readonly left: string
  readonly opacity: number
  readonly duration: string
}

function BikeWheel({ size, top, left, opacity, duration }: BikeWheelProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        opacity,
        animation: `${spinWheel} ${duration} linear infinite`,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1">
        {/* Outer rim */}
        <circle cx="50" cy="50" r="45" />
        {/* Inner rim */}
        <circle cx="50" cy="50" r="40" />
        {/* Hub */}
        <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.3)" />
        <circle cx="50" cy="50" r="4" fill="rgba(255,255,255,0.5)" />
        {/* Spokes - 8 spokes */}
        <line x1="50" y1="12" x2="50" y2="42" />
        <line x1="50" y1="58" x2="50" y2="88" />
        <line x1="12" y1="50" x2="42" y2="50" />
        <line x1="58" y1="50" x2="88" y2="50" />
        <line x1="23" y1="23" x2="43" y2="43" />
        <line x1="57" y1="57" x2="77" y2="77" />
        <line x1="77" y1="23" x2="57" y2="43" />
        <line x1="43" y1="57" x2="23" y2="77" />
      </svg>
    </Box>
  )
}

// Mountain range - Serra de Tramuntana
function MountainRange() {
  return (
    <Box
      component="svg"
      viewBox="0 0 1920 300"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '25%',
        opacity: 0.15,
      }}
    >
      <defs>
        <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,300 L0,220 L150,180 L300,200 L450,140 L600,160 L750,100 L900,130 L1050,80 L1200,110 L1350,70 L1500,120 L1650,90 L1800,150 L1920,130 L1920,300 Z"
        fill="url(#mountainGrad)"
      />
    </Box>
  )
}


export function AnimatedBackground() {
  // Generate particles
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${(i * 2.5) % 100}%`,
    delay: `${(i * 0.5) % 12}s`,
    duration: `${12 + (i % 8)}s`,
    size: 2 + (i % 3),
  }))

  // Generate stars
  const stars = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    top: `${10 + (i * 3) % 60}%`,
    left: `${(i * 4) % 95}%`,
    delay: `${(i * 0.3) % 3}s`,
    size: 2 + (i % 2),
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
        // Vibrant animated gradient
        background: `linear-gradient(
          135deg,
          #0a0e27 0%,
          #0d1b3e 20%,
          #1a3a6e 40%,
          #1565c0 60%,
          #1a3a6e 80%,
          #0d1b3e 90%,
          #0a0e27 100%
        )`,
        backgroundSize: '300% 300%',
        animation: `${gradientShift} 15s ease infinite`,
      }}
    >
      {/* Large vibrant orbs */}
      <GlowingOrb
        size={700}
        color="#2196f3"
        top="-15%"
        left="-10%"
        animation={float1}
        duration="20s"
        blur={60}
        opacity={0.5}
      />
      <GlowingOrb
        size={600}
        color="#00bcd4"
        top="40%"
        left="60%"
        animation={float2}
        duration="25s"
        blur={50}
        opacity={0.4}
      />
      <GlowingOrb
        size={500}
        color="#7c4dff"
        top="60%"
        left="10%"
        animation={float3}
        duration="30s"
        blur={45}
        opacity={0.35}
      />

      {/* Medium accent orbs */}
      <GlowingOrb
        size={400}
        color="#00e5ff"
        top="10%"
        left="70%"
        animation={float2}
        duration="22s"
        blur={35}
        opacity={0.3}
      />
      <GlowingOrb
        size={350}
        color="#ff4081"
        top="70%"
        left="75%"
        animation={float1}
        duration="28s"
        blur={30}
        opacity={0.25}
      />
      <GlowingOrb
        size={300}
        color="#69f0ae"
        top="25%"
        left="35%"
        animation={float3}
        duration="18s"
        blur={30}
        opacity={0.25}
      />

      {/* Smaller detail orbs */}
      <GlowingOrb
        size={200}
        color="#ffd740"
        top="50%"
        left="25%"
        animation={float1}
        duration="15s"
        blur={25}
        opacity={0.3}
      />
      <GlowingOrb
        size={180}
        color="#18ffff"
        top="5%"
        left="50%"
        animation={float2}
        duration="20s"
        blur={20}
        opacity={0.35}
      />

      {/* Subtle spinning bike wheels */}
      <BikeWheel size={200} top="5%" left="85%" opacity={0.08} duration="30s" />
      <BikeWheel size={150} top="60%" left="-3%" opacity={0.06} duration="25s" />
      <BikeWheel size={120} top="75%" left="90%" opacity={0.05} duration="20s" />
      <BikeWheel size={80} top="20%" left="5%" opacity={0.04} duration="35s" />

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

      {/* Rising particles */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          left={p.left}
          delay={p.delay}
          duration={p.duration}
          size={p.size}
        />
      ))}

      {/* Cycling road path */}
      <CyclingRoadPath />

      {/* Mountain range - Serra de Tramuntana */}
      <MountainRange />


      {/* Light beam from top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '30%',
          width: '40%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(100,200,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette effect */}
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
