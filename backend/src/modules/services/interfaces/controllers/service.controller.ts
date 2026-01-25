import type { NextFunction, Request, Response } from 'express'
import prisma from '../../../../lib/prisma'
import { serviceRepositoryPrisma } from '../../infrastructure/persistence/prisma/service-repository-prisma'
import { createService } from '../../application/create-service'
import { listServices, listWorkshopServices } from '../../application/list-services'
import { updateService } from '../../application/update-service'
import { deleteService } from '../../application/delete-service'
import { listServiceCategories } from '../../application/list-service-categories'

const repo = serviceRepositoryPrisma

const workshopRepo = {
  async findById(id: string) {
    return prisma.workshop.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    })
  },
}

/**
 * POST /api/owner/services
 * Crear un nuevo servicio
 */
export const createServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    // Validación ya realizada por middleware validateBody
    const body = req.body

    const service = await createService(body, {
      repo,
      workshopRepo,
      authenticatedUserId: req.user.id,
    })

    res.status(201).json(service)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/owner/services/workshop/:workshopId
 * Listar servicios de un taller (para el dueño)
 */
export const listWorkshopServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params

    // Verificar que el usuario es dueño del taller
    const workshop = await workshopRepo.findById(workshopId)

    if (!workshop) {
      return res.status(404).json({ error: 'Taller no encontrado' })
    }

    if (workshop.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'No tienes permisos para ver estos servicios' })
    }

    const services = await listWorkshopServices(workshopId, { repo })

    res.json(services)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/services
 * Buscar servicios (catálogo público)
 */
export const searchServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = searchServicesSchema.parse(req.query)

    const services = await listServices(filters, { repo })

    res.json(services)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/services/:id
 * Obtener un servicio por ID
 */
export const getServiceByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const service = await repo.findById(id)

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' })
    }

    res.json(service)
  } catch (e) {
    next(e)
  }
}

/**
 * PATCH /api/owner/services/:id
 * Actualizar un servicio
 */
export const updateServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { id } = req.params
    // Validación ya realizada por middleware validateBody
    const body = req.body

    const service = await updateService(id, body, {
      repo,
      workshopRepo,
      authenticatedUserId: req.user.id,
    })

    res.json(service)
  } catch (e) {
    next(e)
  }
}

/**
 * DELETE /api/owner/services/:id
 * Eliminar un servicio
 */
export const deleteServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { id } = req.params

    await deleteService(id, {
      repo,
      workshopRepo,
      authenticatedUserId: req.user.id,
    })

    res.status(204).send()
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/service-categories
 * Listar todas las categorías de servicios
 */
export const listServiceCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await listServiceCategories({ repo })

    res.json(categories)
  } catch (e) {
    next(e)
  }
}
