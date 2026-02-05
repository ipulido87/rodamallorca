import { Box } from '@mui/material'
import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const MotionBox = motion.create(Box)

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const variantMap = {
  'fade-up': fadeUpVariants,
  'fade-in': fadeInVariants,
  'scale-up': scaleUpVariants,
  stagger: staggerContainerVariants,
}

interface ScrollRevealProps {
  readonly children: ReactNode
  readonly variant?: keyof typeof variantMap
  readonly delay?: number
  readonly className?: string
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
}: ScrollRevealProps) {
  const variants = variantMap[variant]

  return (
    <MotionBox
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionBox>
  )
}

// Export stagger item for use inside stagger containers
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}
