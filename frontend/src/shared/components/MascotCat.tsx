import { Box, alpha } from '@mui/material'
import { motion, useMotionValue, animate } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

const MotionBox = motion.create(Box)

// ─── SVG: gato negro montado en bicicleta ────────────────────────────────────

function CatOnBikeSvg({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 140"
      width="100%"
      height="100%"
      style={{
        transform: flipped ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* ══════════ BICICLETA ══════════ */}

      {/* Rueda trasera */}
      <circle cx="50" cy="110" r="24" fill="none" stroke="#ccc" strokeWidth="3" />
      <circle cx="50" cy="110" r="22" fill="none" stroke="#999" strokeWidth="1" />
      {/* Radios traseros */}
      <motion.g
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 110px' }}
      >
        <line x1="50" y1="88" x2="50" y2="132" stroke="#aaa" strokeWidth="0.8" />
        <line x1="28" y1="110" x2="72" y2="110" stroke="#aaa" strokeWidth="0.8" />
        <line x1="33" y1="94" x2="67" y2="126" stroke="#aaa" strokeWidth="0.8" />
        <line x1="67" y1="94" x2="33" y2="126" stroke="#aaa" strokeWidth="0.8" />
      </motion.g>
      {/* Buje trasero */}
      <circle cx="50" cy="110" r="3" fill="#666" />

      {/* Rueda delantera */}
      <circle cx="150" cy="110" r="24" fill="none" stroke="#ccc" strokeWidth="3" />
      <circle cx="150" cy="110" r="22" fill="none" stroke="#999" strokeWidth="1" />
      {/* Radios delanteros */}
      <motion.g
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '150px 110px' }}
      >
        <line x1="150" y1="88" x2="150" y2="132" stroke="#aaa" strokeWidth="0.8" />
        <line x1="128" y1="110" x2="172" y2="110" stroke="#aaa" strokeWidth="0.8" />
        <line x1="133" y1="94" x2="167" y2="126" stroke="#aaa" strokeWidth="0.8" />
        <line x1="167" y1="94" x2="133" y2="126" stroke="#aaa" strokeWidth="0.8" />
      </motion.g>
      {/* Buje delantero */}
      <circle cx="150" cy="110" r="3" fill="#666" />

      {/* Cuadro de la bici */}
      {/* Tubo superior (sillín → dirección) */}
      <line x1="72" y1="82" x2="138" y2="78" stroke="#e65100" strokeWidth="3.5" strokeLinecap="round" />
      {/* Tubo diagonal (dirección → pedalier) */}
      <line x1="138" y1="78" x2="100" y2="108" stroke="#e65100" strokeWidth="3.5" strokeLinecap="round" />
      {/* Tubo del sillín (sillín → pedalier) */}
      <line x1="72" y1="82" x2="100" y2="108" stroke="#e65100" strokeWidth="3.5" strokeLinecap="round" />
      {/* Vainas (pedalier → rueda trasera) */}
      <line x1="100" y1="108" x2="50" y2="110" stroke="#e65100" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tirantes (sillín → rueda trasera) */}
      <line x1="72" y1="82" x2="50" y2="110" stroke="#e65100" strokeWidth="2.5" strokeLinecap="round" />
      {/* Horquilla delantera */}
      <line x1="138" y1="78" x2="150" y2="110" stroke="#e65100" strokeWidth="3" strokeLinecap="round" />
      {/* Manillar */}
      <line x1="133" y1="72" x2="145" y2="72" stroke="#555" strokeWidth="3" strokeLinecap="round" />
      <line x1="138" y1="78" x2="139" y2="72" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tija del sillín */}
      <line x1="72" y1="82" x2="68" y2="72" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sillín */}
      <ellipse cx="68" cy="71" rx="10" ry="3" fill="#333" />

      {/* Pedalier */}
      <circle cx="100" cy="108" r="5" fill="#666" stroke="#555" strokeWidth="1" />
      {/* Bielas y pedales girando */}
      <motion.g
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 108px' }}
      >
        {/* Biela derecha */}
        <line x1="100" y1="108" x2="100" y2="122" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="100" cy="123" rx="4" ry="1.5" fill="#444" />
        {/* Biela izquierda */}
        <line x1="100" y1="108" x2="100" y2="94" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="100" cy="93" rx="4" ry="1.5" fill="#444" />
      </motion.g>

      {/* ══════════ GATO ══════════ */}

      {/* Cola (sale por detrás del gato sentado) */}
      <motion.path
        d="M 52 52 Q 30 25, 25 10 Q 23 4, 28 12 Q 35 28, 55 48"
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="5"
        strokeLinecap="round"
        animate={{ d: [
          'M 52 52 Q 30 25, 25 10 Q 23 4, 28 12 Q 35 28, 55 48',
          'M 52 52 Q 25 30, 18 18 Q 15 10, 22 16 Q 32 30, 55 48',
          'M 52 52 Q 30 25, 25 10 Q 23 4, 28 12 Q 35 28, 55 48',
        ]}}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cuerpo del gato (sentado en el sillín) */}
      <ellipse cx="75" cy="55" rx="22" ry="18" fill="#1a1a2e" />

      {/* Pata trasera (sobre el pedal izquierdo, se mueve con la biela) */}
      <motion.g
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 108px' }}
      >
        <path
          d="M 100 94 Q 88 80, 78 68"
          fill="none" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round"
        />
        <ellipse cx="100" cy="93" rx="5" ry="3" fill="#1a1a2e" />
      </motion.g>

      {/* Pata delantera (agarra el manillar) */}
      <path
        d="M 90 50 Q 110 55, 130 68 Q 135 70, 135 72"
        fill="none" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round"
      />
      <circle cx="135" cy="72" r="4" fill="#1a1a2e" />

      {/* Cabeza */}
      <circle cx="95" cy="32" r="20" fill="#1a1a2e" />

      {/* Orejas */}
      <polygon points="79,20 83,0 92,17" fill="#1a1a2e" />
      <polygon points="81,18 84,6 90,16" fill="#2d2d44" />
      <polygon points="98,17 108,0 112,20" fill="#1a1a2e" />
      <polygon points="100,16 107,6 110,18" fill="#2d2d44" />

      {/* Ojos grandes */}
      <ellipse cx="88" cy="30" rx="7" ry="8" fill="#c8e6c9" />
      <ellipse cx="104" cy="30" rx="7" ry="8" fill="#c8e6c9" />
      {/* Pupilas */}
      <motion.ellipse
        cx="89" cy="30" rx="3.5" ry="5.5"
        fill="#1b5e20"
        animate={{ cx: [89, 90, 89, 88, 89] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="105" cy="30" rx="3.5" ry="5.5"
        fill="#1b5e20"
        animate={{ cx: [105, 106, 105, 104, 105] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Brillo en ojos */}
      <circle cx="86" cy="27" r="2.2" fill="white" opacity="0.9" />
      <circle cx="102" cy="27" r="2.2" fill="white" opacity="0.9" />
      <circle cx="91" cy="32" r="1" fill="white" opacity="0.5" />
      <circle cx="107" cy="32" r="1" fill="white" opacity="0.5" />

      {/* Nariz */}
      <ellipse cx="96" cy="37" rx="2.5" ry="1.8" fill="#e91e63" />

      {/* Boca */}
      <path d="M 93.5 39 Q 96 41.5, 96 39" fill="none" stroke="#555" strokeWidth="0.7" />
      <path d="M 96 39 Q 96 41.5, 98.5 39" fill="none" stroke="#555" strokeWidth="0.7" />

      {/* Bigotes */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '96px 37px' }}
      >
        <line x1="72" y1="33" x2="84" y2="35" stroke="#888" strokeWidth="0.7" />
        <line x1="72" y1="38" x2="84" y2="37" stroke="#888" strokeWidth="0.7" />
        <line x1="108" y1="35" x2="120" y2="33" stroke="#888" strokeWidth="0.7" />
        <line x1="108" y1="37" x2="120" y2="38" stroke="#888" strokeWidth="0.7" />
      </motion.g>

      {/* Sonrisa determinada - está pedaleando! */}
      <motion.path
        d="M 92 40 Q 96 43, 100 40"
        fill="none"
        stroke="#555"
        strokeWidth="0.8"
        strokeLinecap="round"
        animate={{ d: [
          'M 92 40 Q 96 43, 100 40',
          'M 92 40 Q 96 44, 100 40',
          'M 92 40 Q 96 43, 100 40',
        ]}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface MascotCatProps {
  /** Callback cuando el gato pasa por encima de una zona del texto */
  onZoneChange?: (zone: 'none' | 'roda' | 'mallorca') => void
  /** Ancho del contenedor del título para calcular posición */
  containerWidth?: number
}

export function MascotCat({ onZoneChange, containerWidth = 600 }: MascotCatProps) {
  const [isRinging, setIsRinging] = useState(false)
  const [direction, setDirection] = useState<'right' | 'left'>('right')
  const catX = useMotionValue(0)
  const lastZone = useRef<string>('none')

  const catSize = { width: 110, height: 80 }

  // Calcular la zona según la posición X
  const updateZone = useCallback((x: number) => {
    const totalTravel = containerWidth + catSize.width * 2
    const progress = (x + catSize.width) / totalTravel

    let zone: 'none' | 'roda' | 'mallorca' = 'none'
    if (progress > 0.05 && progress < 0.28) zone = 'roda'
    else if (progress > 0.32 && progress < 0.78) zone = 'mallorca'

    if (zone !== lastZone.current) {
      lastZone.current = zone
      onZoneChange?.(zone)
    }
  }, [containerWidth, catSize.width, onZoneChange])

  // Animar el gato pedaleando de lado a lado
  useEffect(() => {
    const startX = -catSize.width
    const endX = containerWidth + catSize.width

    const runCycle = () => {
      setDirection('right')
      animate(catX, endX, {
        duration: 6,
        ease: 'linear',
        onUpdate: updateZone,
        onComplete: () => {
          setTimeout(() => {
            setDirection('left')
            animate(catX, startX, {
              duration: 6,
              ease: 'linear',
              onUpdate: updateZone,
              onComplete: () => {
                setTimeout(runCycle, 5000)
              },
            })
          }, 3000)
        },
      })
    }

    catX.set(-catSize.width)
    const timeout = setTimeout(runCycle, 4000)
    return () => clearTimeout(timeout)
  }, [containerWidth]) // eslint-disable-line react-hooks/exhaustive-deps

  // Click = ring ring! (timbre de bici)
  const handleClick = () => {
    if (isRinging) return
    setIsRinging(true)
    setTimeout(() => setIsRinging(false), 800)
  }

  return (
    <MotionBox
      style={{ x: catX }}
      sx={{
        position: 'absolute',
        bottom: { xs: -22, md: -28 },
        width: catSize.width,
        height: catSize.height,
        zIndex: 10,
        cursor: 'pointer',
        filter: `drop-shadow(0 4px 16px ${alpha('#000', 0.5)})`,
        pointerEvents: 'auto',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      onClick={handleClick}
    >
      {/* Bounce suave al pedalear + ring al hacer click */}
      <motion.div
        animate={
          isRinging
            ? { y: [0, -2, 0], rotate: [0, -4, 4, -3, 3, 0] }
            : { y: [0, -2, 0] }
        }
        transition={
          isRinging
            ? { duration: 0.6, ease: 'easeOut' }
            : { duration: 1, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <CatOnBikeSvg flipped={direction === 'left'} />
      </motion.div>

      {/* Ring ring! texto al hacer click */}
      {isRinging && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.8 }}
          animate={{ opacity: 1, y: -10, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            fontWeight: 700,
            color: '#ffd54f',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        >
          ring ring!
        </motion.div>
      )}
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
