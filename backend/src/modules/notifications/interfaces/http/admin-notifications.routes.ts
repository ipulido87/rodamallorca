import { Router, Request, Response, NextFunction } from 'express'
import {
  verifyToken,
  requireRole,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { sendWorkshopWelcomeEmail } from '../../services/email-service'
import prisma from '../../../../lib/prisma'

const router = Router()

/**
 * POST /api/admin/notify-workshops
 * Envía email de bienvenida a todos los talleres que aún no han reclamado su perfil.
 * Solo accesible para administradores.
 */
router.post(
  '/notify-workshops',
  verifyToken,
  requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.rodamallorca.es'

      // Obtener talleres sin reclamar que tengan claimToken y cuyo owner tenga email
      const workshops = await prisma.workshop.findMany({
        where: {
          claimedAt: null,
          claimToken: { not: null },
        },
        include: {
          owner: {
            select: { email: true, name: true },
          },
        },
      })

      if (workshops.length === 0) {
        return res.json({
          success: true,
          message: 'No hay talleres sin reclamar con claimToken.',
          sent: 0,
          skipped: 0,
        })
      }

      let sent = 0
      let skipped = 0
      const errors: string[] = []

      for (const workshop of workshops) {
        if (!workshop.owner?.email) {
          skipped++
          continue
        }

        try {
          await sendWorkshopWelcomeEmail({
            workshopName: workshop.name,
            ownerEmail: workshop.owner.email,
            ownerName: workshop.owner.name ?? undefined,
            city: workshop.city ?? undefined,
            claimUrl: `${frontendUrl}/api/directory/claim/${workshop.claimToken}`,
          })
          sent++
        } catch (err: any) {
          errors.push(`${workshop.name}: ${err.message}`)
          skipped++
        }
      }

      console.log(`📧 [ADMIN] Notificaciones enviadas: ${sent}/${workshops.length}`)

      res.json({
        success: true,
        total: workshops.length,
        sent,
        skipped,
        ...(errors.length > 0 && { errors }),
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/admin/unclaimed-workshops
 * Lista los talleres que aún no han reclamado su perfil.
 * Solo accesible para administradores.
 */
router.get(
  '/unclaimed-workshops',
  verifyToken,
  requireRole('ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const workshops = await prisma.workshop.findMany({
        where: {
          claimedAt: null,
          claimToken: { not: null },
        },
        select: {
          id: true,
          name: true,
          city: true,
          phone: true,
          claimToken: true,
          createdAt: true,
          owner: {
            select: { email: true, name: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      res.json({
        success: true,
        total: workshops.length,
        workshops,
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
