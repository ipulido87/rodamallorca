import { Request, Response, NextFunction } from 'express'
import prisma from '../../../lib/prisma'
import crypto from 'crypto'

/**
 * GET /api/directory/workshops
 * Lista todos los talleres del directorio (verificados + no verificados)
 */
export const getDirectoryWorkshops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, country, verified } = req.query

    const where: any = {
      isListed: true, // Solo talleres listados públicamente
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
        isVerified: true, // Importante: distinguir verificados de no verificados
        createdAt: true,
      },
      orderBy: [
        { isVerified: 'desc' }, // Verificados primero
        { averageRating: 'desc' }, // Luego por rating
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
  } catch (error: any) {
    console.error('❌ Error obteniendo directorio:', error)
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
) => {
  try {
    const { claimToken } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    console.log(`🔐 [Claim] Usuario ${userId} intentando reclamar con token ${claimToken}`)

    // Buscar el workshop con este claim token
    const workshop = await prisma.workshop.findUnique({
      where: { claimToken },
      include: { owner: true },
    })

    if (!workshop) {
      return res.status(404).json({
        error: 'Token de reclamación inválido',
        message: 'No se encontró ningún negocio con este token',
      })
    }

    // Verificar si ya fue reclamado
    if (workshop.claimedAt) {
      return res.status(400).json({
        error: 'Negocio ya reclamado',
        message: `Este negocio fue reclamado el ${workshop.claimedAt.toLocaleDateString()}`,
      })
    }

    console.log(`✅ [Claim] Workshop encontrado: ${workshop.name}`)

    // Transferir ownership al usuario que reclama
    const updated = await prisma.workshop.update({
      where: { id: workshop.id },
      data: {
        ownerId: userId,
        claimedAt: new Date(),
        isVerified: false, // Aún no verificado (necesita pagar suscripción)
        // NO eliminamos el claimToken por si hay problemas y necesitamos revertir
      },
    })

    console.log(`🎉 [Claim] Negocio reclamado exitosamente por usuario ${userId}`)

    // TODO: Enviar email de bienvenida al nuevo owner
    // TODO: Redirigir a onboarding/configuración

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
  } catch (error: any) {
    console.error('❌ Error reclamando negocio:', error)
    next(error)
  }
}

/**
 * GET /api/directory/cities
 * Lista de ciudades con talleres (para filtros)
 */
export const getCities = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    console.error('❌ Error obteniendo ciudades:', error)
    next(error)
  }
}
