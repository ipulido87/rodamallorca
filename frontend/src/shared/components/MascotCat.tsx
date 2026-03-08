import { Box, alpha } from '@mui/material'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

const MotionBox = motion.create(Box)

// ─── SVG del gato mascota (estilo cartoon, gato negro con ojos verdes grandes) ──

function CatSvg({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 100"
      width="100%"
      height="100%"
      style={{ transform: flipped ? 'scaleX(-1)' : undefined }}
    >
      {/* Cola */}
      <motion.path
        d="M 95 55 Q 115 30, 110 15 Q 108 10, 105 18 Q 100 35, 88 50"
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="5"
        strokeLinecap="round"
        animate={{ d: [
          'M 95 55 Q 115 30, 110 15 Q 108 10, 105 18 Q 100 35, 88 50',
          'M 95 55 Q 120 35, 115 20 Q 113 12, 108 22 Q 102 38, 88 50',
          'M 95 55 Q 115 30, 110 15 Q 108 10, 105 18 Q 100 35, 88 50',
        ]}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cuerpo */}
      <ellipse cx="65" cy="62" rx="30" ry="22" fill="#1a1a2e" />

      {/* Patas traseras */}
      <motion.rect
        x="80" y="78" width="7" height="18" rx="3"
        fill="#1a1a2e"
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '83px 78px' }}
      />
      <motion.rect
        x="70" y="78" width="7" height="18" rx="3"
        fill="#22223b"
        animate={{ rotate: [8, -8, 8] }}
        transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '73px 78px' }}
      />

      {/* Patas delanteras */}
      <motion.rect
        x="45" y="78" width="7" height="18" rx="3"
        fill="#1a1a2e"
        animate={{ rotate: [8, -8, 8] }}
        transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '48px 78px' }}
      />
      <motion.rect
        x="55" y="78" width="7" height="18" rx="3"
        fill="#22223b"
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '58px 78px' }}
      />

      {/* Cabeza */}
      <circle cx="40" cy="45" r="22" fill="#1a1a2e" />

      {/* Orejas */}
      <polygon points="22,30 28,8 38,28" fill="#1a1a2e" />
      <polygon points="25,28 29,14 36,27" fill="#2d2d44" />
      <polygon points="42,28 52,8 58,30" fill="#1a1a2e" />
      <polygon points="44,27 51,14 55,28" fill="#2d2d44" />

      {/* Ojos grandes (estilo cartoon) */}
      <ellipse cx="33" cy="43" rx="8" ry="9" fill="#c8e6c9" />
      <ellipse cx="50" cy="43" rx="8" ry="9" fill="#c8e6c9" />
      {/* Pupilas */}
      <motion.ellipse
        cx="34" cy="43" rx="4" ry="6"
        fill="#1b5e20"
        animate={{ cx: [34, 35, 34, 33, 34] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="51" cy="43" rx="4" ry="6"
        fill="#1b5e20"
        animate={{ cx: [51, 52, 51, 50, 51] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Brillo en ojos */}
      <circle cx="31" cy="40" r="2.5" fill="white" opacity="0.9" />
      <circle cx="48" cy="40" r="2.5" fill="white" opacity="0.9" />
      <circle cx="36" cy="45" r="1.2" fill="white" opacity="0.5" />
      <circle cx="53" cy="45" r="1.2" fill="white" opacity="0.5" />

      {/* Nariz */}
      <ellipse cx="41" cy="51" rx="3" ry="2" fill="#e91e63" />

      {/* Boca */}
      <path d="M 38 53 Q 41 56, 41 53" fill="none" stroke="#555" strokeWidth="0.8" />
      <path d="M 41 53 Q 41 56, 44 53" fill="none" stroke="#555" strokeWidth="0.8" />

      {/* Bigotes */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '41px 51px' }}
      >
        <line x1="15" y1="46" x2="30" y2="48" stroke="#888" strokeWidth="0.8" />
        <line x1="15" y1="52" x2="30" y2="51" stroke="#888" strokeWidth="0.8" />
        <line x1="52" y1="48" x2="67" y2="46" stroke="#888" strokeWidth="0.8" />
        <line x1="52" y1="51" x2="67" y2="52" stroke="#888" strokeWidth="0.8" />
      </motion.g>
    </svg>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface MascotCatProps {
  /** Callback cuando el gato pasa por encima de una zona del texto */
  onZoneChange?: (zone: 'none' | 'roda' | 'mallorca') => void
  /** Ref al contenedor del título para calcular posición */
  containerWidth?: number
}

export function MascotCat({ onZoneChange, containerWidth = 600 }: MascotCatProps) {
  const [isJumping, setIsJumping] = useState(false)
  const [direction, setDirection] = useState<'right' | 'left'>('right')
  const catX = useMotionValue(0)
  const lastZone = useRef<string>('none')

  // Tamaño del gato según el viewport
  const catSize = { width: 70, height: 58 }

  // Calcular la zona según la posición X
  const updateZone = useCallback((x: number) => {
    const totalTravel = containerWidth + catSize.width * 2
    const progress = (x + catSize.width) / totalTravel

    let zone: 'none' | 'roda' | 'mallorca' = 'none'
    if (progress > 0.08 && progress < 0.3) zone = 'roda'
    else if (progress > 0.35 && progress < 0.75) zone = 'mallorca'

    if (zone !== lastZone.current) {
      lastZone.current = zone
      onZoneChange?.(zone)
    }
  }, [containerWidth, catSize.width, onZoneChange])

  // Animar el gato caminando de lado a lado
  useEffect(() => {
    const startX = -catSize.width
    const endX = containerWidth + catSize.width

    const runCycle = () => {
      // Ir a la derecha
      setDirection('right')
      const controlsRight = animate(catX, endX, {
        duration: 8,
        ease: 'linear',
        onUpdate: updateZone,
        onComplete: () => {
          // Pausa y luego ir a la izquierda
          setTimeout(() => {
            setDirection('left')
            const controlsLeft = animate(catX, startX, {
              duration: 8,
              ease: 'linear',
              onUpdate: updateZone,
              onComplete: () => {
                // Pausa y repetir
                setTimeout(runCycle, 4000)
              },
            })
            return () => controlsLeft.stop()
          }, 3000)
        },
      })
      return () => controlsRight.stop()
    }

    // Iniciar después de las animaciones del título
    catX.set(-catSize.width)
    const timeout = setTimeout(runCycle, 4000)
    return () => clearTimeout(timeout)
  }, [containerWidth]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    if (isJumping) return
    setIsJumping(true)
    setTimeout(() => setIsJumping(false), 600)
  }

  return (
    <MotionBox
      style={{ x: catX }}
      sx={{
        position: 'absolute',
        bottom: { xs: -8, md: -12 },
        width: catSize.width,
        height: catSize.height,
        zIndex: 10,
        cursor: 'pointer',
        filter: `drop-shadow(0 4px 12px ${alpha('#000', 0.4)})`,
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
    >
      {/* Bounce al caminar */}
      <motion.div
        animate={
          isJumping
            ? { y: [0, -30, 0], rotate: [0, -15, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isJumping
            ? { duration: 0.5, ease: 'easeOut' }
            : { duration: 0.35, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <CatSvg flipped={direction === 'left'} />
      </motion.div>
    </MotionBox>
  )
}

// ─── Hook para la interacción gato ↔ texto ──────────────────────────────────

export function useCatTextInteraction() {
  const [catZone, setCatZone] = useState<'none' | 'roda' | 'mallorca'>('none')

  const rodaAnimation = catZone === 'roda'
    ? {
        y: [0, -6, 2, -3, 0],
        rotate: [0, -3, 2, -1, 0],
      }
    : {}

  const mallorcaAnimation = catZone === 'mallorca'
    ? {
        y: [0, -6, 2, -3, 0],
        rotate: [0, 2, -3, 1, 0],
      }
    : {}

  const textTransition = {
    duration: 0.5,
    ease: 'easeOut' as const,
  }

  return {
    catZone,
    setCatZone,
    rodaAnimation,
    mallorcaAnimation,
    textTransition,
  }
}
