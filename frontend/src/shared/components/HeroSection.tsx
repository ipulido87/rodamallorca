import { Box, Button, Chip, Container, Stack, useTheme, alpha } from '@mui/material'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Build, KeyboardArrowDown } from '@mui/icons-material'
import { SmartSearchBar } from './SmartSearchBar'
import { MascotCat, useCatTextInteraction } from './MascotCat'

// Wrap MUI components for Framer Motion
const MotionBox = motion.create(Box)
const MotionChip = motion.create(Chip)
const MotionButton = motion.create(Button)

// Scroll indicator at bottom
function ScrollIndicator() {
  const { t } = useTranslation()
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3, duration: 1 }}
      sx={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    >
      <Box
        component="span"
        sx={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {t('hero.discoverMore')}
      </Box>
      <Box sx={{ animation: 'scroll-bounce 1.5s ease-in-out infinite', '@keyframes scroll-bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(8px)' } } }}>
        <KeyboardArrowDown sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 28 }} />
      </Box>
    </MotionBox>
  )
}

// Text animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
}

const buttonVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

export function HeroSection() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [titleWidth, setTitleWidth] = useState(600)
  const { setCatZone, rodaAnimation, mallorcaAnimation, textTransition } = useCatTextInteraction()

  // Medir el ancho del título para la animación del gato
  const titleRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      titleRef.current = node
      setTitleWidth(node.offsetWidth)
    }
  }, [])

  // Parallax scroll effect - image zooms and fades as you scroll
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.3])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <Box
      ref={heroRef}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image with parallax zoom */}
      <MotionBox
        style={{ scale: imageScale, opacity: imageOpacity }}
        sx={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          right: '-5%',
          bottom: '-5%',
          backgroundImage: 'url(https://img.locationscout.net/images/2017-05/sa-calobra-road-mallorca-spain_l.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(
            135deg,
            rgba(10, 15, 30, 0.75) 0%,
            rgba(13, 27, 42, 0.55) 40%,
            rgba(10, 15, 30, 0.7) 100%
          )`,
        }}
      />

      {/* Bottom gradient fade to sections */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(10, 22, 40, 0.95))',
          pointerEvents: 'none',
        }}
      />

      {/* Main content with parallax */}
      <MotionBox
        style={{ y: contentY }}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Stack spacing={3} sx={{ maxWidth: { xs: '100%', md: '70%' } }}>
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <MotionChip
                  label={t('hero.badge')}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    backdropFilter: 'blur(10px)',
                    color: theme.palette.common.white,
                    px: 2,
                    py: 1,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    width: 'fit-content',
                  }}
                />
              </motion.div>

              {/* Title with word-by-word reveal + cat mascot */}
              <motion.div variants={itemVariants}>
                <Box
                  ref={titleRefCallback}
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem' },
                    lineHeight: 1.05,
                    m: 0,
                    letterSpacing: '-0.02em',
                    position: 'relative',
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0, ...rodaAnimation }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut', ...textTransition }}
                    style={{
                      display: 'inline-block',
                      background: `linear-gradient(135deg, #ffffff 0%, ${alpha('#ffffff', 0.85)} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Roda
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0, ...mallorcaAnimation }}
                    transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut', ...textTransition }}
                    style={{
                      display: 'inline-block',
                      background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Mallorca
                  </motion.span>

                  {/* Gato mascota caminando */}
                  <MascotCat
                    containerWidth={titleWidth}
                    onZoneChange={setCatZone}
                  />
                </Box>
              </motion.div>

              {/* Subtitle */}
              <motion.div variants={itemVariants}>
                <Box
                  component="p"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    fontWeight: 300,
                    lineHeight: 1.5,
                    color: alpha('#ffffff', 0.9),
                    m: 0,
                    maxWidth: 600,
                  }}
                >
                  {t('hero.subtitle')}
                </Box>
              </motion.div>

              {/* AI Search bar */}
              <motion.div variants={itemVariants}>
                <SmartSearchBar variant="hero" value={searchQuery} onChange={setSearchQuery} />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <MotionButton
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/catalog')}
                    startIcon={<Search />}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    variants={buttonVariants}
                    sx={{
                      backgroundColor: theme.palette.common.white,
                      color: '#0d1b2a',
                      px: 5,
                      py: 2,
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: `0 10px 40px ${alpha('#000', 0.3)}`,
                      textTransform: 'none',
                      transition: 'box-shadow 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        boxShadow: `0 20px 60px ${alpha('#000', 0.35)}`,
                      },
                    }}
                  >
                    {t('hero.exploreCatalog')}
                  </MotionButton>

                  <MotionButton
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register?type=owner')}
                    startIcon={<Build />}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    variants={buttonVariants}
                    sx={{
                      borderColor: alpha('#ffffff', 0.5),
                      color: theme.palette.common.white,
                      px: 5,
                      py: 2,
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      borderWidth: 2,
                      textTransform: 'none',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: alpha('#ffffff', 0.05),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: alpha('#ffffff', 0.15),
                        borderWidth: 2,
                      },
                    }}
                  >
                    {t('hero.joinAsWorkshop')}
                  </MotionButton>
                </Stack>
              </motion.div>
            </Stack>
          </motion.div>
        </Container>
      </MotionBox>

      {/* Scroll indicator */}
      <ScrollIndicator />

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
