import { Box, keyframes } from '@mui/material'

// Smooth floating animations for orbs
const float1 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translate(100px, -150px) scale(1.15);
    opacity: 0.8;
  }
  50% {
    transform: translate(-80px, -80px) scale(0.9);
    opacity: 0.5;
  }
  75% {
    transform: translate(120px, 80px) scale(1.1);
    opacity: 0.7;
  }
`

const float2 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.5;
  }
  33% {
    transform: translate(-120px, 100px) scale(1.3) rotate(120deg);
    opacity: 0.8;
  }
  66% {
    transform: translate(80px, -80px) scale(0.8) rotate(240deg);
    opacity: 0.4;
  }
`

const float3 = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  20% {
    transform: translate(150px, 70px) scale(1.2);
    opacity: 0.7;
  }
  40% {
    transform: translate(-70px, 150px) scale(0.85);
    opacity: 0.3;
  }
  60% {
    transform: translate(-150px, -50px) scale(1.1);
    opacity: 0.6;
  }
  80% {
    transform: translate(70px, -120px) scale(0.95);
    opacity: 0.5;
  }
`

const pulse = keyframes`
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.05);
  }
`

const moveParticle = keyframes`
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateY(-20vh) translateX(50px) rotate(360deg);
    opacity: 0;
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
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
  25% {
    background-position: 50% 100%;
  }
  50% {
    background-position: 100% 50%;
  }
  75% {
    background-position: 50% 0%;
  }
`

const breathe = keyframes`
  0%, 100% {
    filter: blur(60px) brightness(1);
  }
  50% {
    filter: blur(80px) brightness(1.2);
  }
`

// Glowing orb component
interface GlowingOrbProps {
  readonly size: number
  readonly color: string
  readonly top: string
  readonly left: string
  readonly animation: string
  readonly duration: string
  readonly blur?: number
  readonly glow?: boolean
}

function GlowingOrb({ size, color, top, left, animation, duration, blur = 60, glow = false }: GlowingOrbProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        top,
        left,
        animation: glow
          ? `${animation} ${duration} ease-in-out infinite, ${breathe} 8s ease-in-out infinite`
          : `${animation} ${duration} ease-in-out infinite`,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
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
  readonly color?: string
}

function Particle({ left, delay, duration, size, color = 'rgba(255, 255, 255, 0.9)' }: ParticleProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}`,
        left,
        bottom: '-5%',
        animation: `${moveParticle} ${duration} linear infinite`,
        animationDelay: delay,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    />
  )
}

// Road path SVG
function CyclingRoadPath() {
  return (
    <Box
      component="svg"
      viewBox="0 0 1920 300"
      sx={{
        position: 'absolute',
        bottom: '10%',
        left: 0,
        width: '100%',
        height: 'auto',
        opacity: 0.15,
        overflow: 'visible',
      }}
    >
      {/* Main road path */}
      <path
        d="M-100,150 Q200,100 400,120 T800,80 T1200,140 T1600,100 T2020,120"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="6"
        strokeDasharray="30,15"
        style={{
          animation: `${roadMove} 10s linear infinite`,
        } as React.CSSProperties}
      />
      {/* Road glow */}
      <path
        d="M-100,150 Q200,100 400,120 T800,80 T1200,140 T1600,100 T2020,120"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="20"
        filter="url(#roadGlow)"
      />
      <defs>
        <filter id="roadGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </Box>
  )
}

// Cyclist silhouette
function CyclistSilhouette() {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '18%',
        right: '8%',
        width: { xs: 100, md: 180 },
        height: 'auto',
        opacity: 0.12,
        animation: `${pulse} 5s ease-in-out infinite`,
      }}
    >
      <svg viewBox="0 0 100 60" fill="white">
        {/* Wheels */}
        <circle cx="20" cy="45" r="12" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="80" cy="45" r="12" fill="none" stroke="white" strokeWidth="2" />
        {/* Spokes */}
        <line x1="20" y1="33" x2="20" y2="57" stroke="white" strokeWidth="0.5" />
        <line x1="8" y1="45" x2="32" y2="45" stroke="white" strokeWidth="0.5" />
        <line x1="80" y1="33" x2="80" y2="57" stroke="white" strokeWidth="0.5" />
        <line x1="68" y1="45" x2="92" y2="45" stroke="white" strokeWidth="0.5" />
        {/* Frame */}
        <path d="M20,45 L45,25 L60,25 L80,45" fill="none" stroke="white" strokeWidth="2.5" />
        <path d="M45,25 L35,45 M60,25 L60,45" fill="none" stroke="white" strokeWidth="2" />
        {/* Handlebars */}
        <path d="M60,25 L70,20 M70,20 L65,18 M70,20 L72,25" fill="none" stroke="white" strokeWidth="2" />
        {/* Cyclist body */}
        <circle cx="55" cy="12" r="6" fill="white" />
        <path d="M55,18 L50,35 M50,28 L60,25" fill="none" stroke="white" strokeWidth="2.5" />
        <path d="M50,35 L35,45 M50,35 L55,45" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    </Box>
  )
}

// Mountain range
function MountainRange() {
  return (
    <Box
      component="svg"
      viewBox="0 0 1920 400"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '35%',
        opacity: 0.08,
      }}
    >
      <defs>
        <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Serra de Tramuntana silhouette */}
      <path
        d="M0,400 L0,300 L100,250 L200,280 L300,200 L400,220 L500,150 L600,180 L700,120 L800,160 L900,100 L1000,140 L1100,90 L1200,130 L1300,80 L1400,150 L1500,180 L1600,140 L1700,200 L1800,160 L1920,220 L1920,400 Z"
        fill="url(#mountainGrad)"
      />
    </Box>
  )
}

export function AnimatedBackground() {
  // Generate particles with varied properties
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${(i * 3.3) % 100}%`,
    delay: `${(i * 0.7) % 15}s`,
    duration: `${18 + (i % 12)}s`,
    size: 1.5 + (i % 4),
    color: i % 3 === 0
      ? 'rgba(100, 200, 255, 0.9)'
      : i % 3 === 1
        ? 'rgba(255, 180, 100, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
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
        // Animated gradient background - Deep Mediterranean blues
        background: `linear-gradient(
          135deg,
          #050a15 0%,
          #0a1929 15%,
          #0d2137 30%,
          #0d47a1 50%,
          #1565c0 65%,
          #0d2137 80%,
          #0a1929 90%,
          #050a15 100%
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 25s ease infinite`,
      }}
    >
      {/* Large primary orbs - main visual elements */}
      <GlowingOrb
        size={800}
        color="rgba(13, 71, 161, 0.5)"
        top="-20%"
        left="-15%"
        animation={float1}
        duration="30s"
        blur={100}
        glow
      />
      <GlowingOrb
        size={700}
        color="rgba(0, 188, 212, 0.4)"
        top="50%"
        left="65%"
        animation={float2}
        duration="35s"
        blur={90}
        glow
      />
      <GlowingOrb
        size={600}
        color="rgba(103, 58, 183, 0.35)"
        top="20%"
        left="45%"
        animation={float3}
        duration="40s"
        blur={80}
      />

      {/* Medium accent orbs */}
      <GlowingOrb
        size={400}
        color="rgba(0, 150, 136, 0.4)"
        top="65%"
        left="5%"
        animation={float2}
        duration="28s"
        blur={60}
      />
      <GlowingOrb
        size={350}
        color="rgba(255, 152, 0, 0.3)"
        top="5%"
        left="75%"
        animation={float1}
        duration="32s"
        blur={55}
      />
      <GlowingOrb
        size={300}
        color="rgba(33, 150, 243, 0.4)"
        top="75%"
        left="80%"
        animation={float3}
        duration="25s"
        blur={50}
      />

      {/* Small detail orbs */}
      <GlowingOrb
        size={200}
        color="rgba(233, 30, 99, 0.3)"
        top="45%"
        left="15%"
        animation={float3}
        duration="22s"
        blur={40}
      />
      <GlowingOrb
        size={180}
        color="rgba(76, 175, 80, 0.25)"
        top="15%"
        left="30%"
        animation={float1}
        duration="38s"
        blur={35}
      />
      <GlowingOrb
        size={150}
        color="rgba(255, 235, 59, 0.2)"
        top="60%"
        left="40%"
        animation={float2}
        duration="20s"
        blur={30}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          left={p.left}
          delay={p.delay}
          duration={p.duration}
          size={p.size}
          color={p.color}
        />
      ))}

      {/* Cycling road path */}
      <CyclingRoadPath />

      {/* Cyclist silhouette */}
      <CyclistSilhouette />

      {/* Mountain range - Serra de Tramuntana */}
      <MountainRange />

      {/* Subtle noise texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* Shimmer line accent */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
          backgroundSize: '200% 100%',
          animation: `${shimmer} 8s linear infinite`,
          opacity: 0.5,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '70%',
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(100,200,255,0.4), transparent)`,
          backgroundSize: '200% 100%',
          animation: `${shimmer} 12s linear infinite reverse`,
          opacity: 0.4,
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
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  )
}
