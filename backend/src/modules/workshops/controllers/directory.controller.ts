import type { Request, Response, NextFunction } from 'express'
import prisma from '../../../lib/prisma'

interface WorkshopWhereFilter {
  isListed: boolean
  city?: string
  country?: string
  isVerified?: boolean
}

/**
 * GET /api/directory/workshops
 * Lista todos los talleres del directorio (verificados + no verificados)
 */
export const getDirectoryWorkshops = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { city, country, verified } = req.query

    const where: WorkshopWhereFilter = {
      isListed: true,
    }

    if (city) where.city = city as string
    if (country) where.country = country as string
    if (verified !== undefined) where.isVerified = verified === 'true'

    const workshops = await prisma.workshop.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        googleMapsUrl: true,
        website: true,
        latitude: true,
        longitude: true,
        averageRating: true,
        reviewCount: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: [
        { isVerified: 'desc' },
        { averageRating: 'desc' },
        { name: 'asc' },
      ],
    })

    res.json({
      success: true,
      workshops,
      total: workshops.length,
      verified: workshops.filter((w) => w.isVerified).length,
      directory: workshops.filter((w) => !w.isVerified).length,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/directory/claim/:claimToken
 * Permite a un owner reclamar su negocio del directorio
 */
export const claimWorkshop = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { claimToken } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    const workshop = await prisma.workshop.findUnique({
      where: { claimToken },
      include: { owner: true },
    })

    if (!workshop) {
      res.status(404).json({
        error: 'Token de reclamación inválido',
        message: 'No se encontró ningún negocio con este token',
      })
      return
    }

    if (workshop.claimedAt) {
      res.status(400).json({
        error: 'Negocio ya reclamado',
        message: `Este negocio fue reclamado el ${workshop.claimedAt.toLocaleDateString()}`,
      })
      return
    }

    const updated = await prisma.workshop.update({
      where: { id: workshop.id },
      data: {
        ownerId: userId,
        claimedAt: new Date(),
        isVerified: false,
      },
    })

    res.json({
      success: true,
      workshop: {
        id: updated.id,
        name: updated.name,
        city: updated.city,
      },
      message: `¡Felicidades! Ahora eres el propietario de ${updated.name}`,
      nextSteps: [
        'Completa tu perfil y agrega información adicional',
        'Conecta tu cuenta de Stripe para recibir pagos',
        'Activa tu suscripción para ser verificado',
      ],
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/directory/cities
 * Lista de ciudades con talleres (para filtros)
 */
export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cities = await prisma.workshop.groupBy({
      by: ['city', 'country'],
      where: {
        isListed: true,
        city: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
    })

    res.json({
      success: true,
      cities: cities.map((c) => ({
        city: c.city,
        country: c.country,
        count: c._count,
      })),
    })
  } catch (error) {
    next(error)
  }
}
