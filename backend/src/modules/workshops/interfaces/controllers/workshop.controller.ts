import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { createWorkshop } from '../../application/create-workshop'
import { deleteWorkshop } from '../../application/delete-workshop'
import { updateWorkshop } from '../../application/update-workshop'
import { WorkshopRepositoryPrisma } from '../../infrastructure/persistence/prisma/workshop-repository-prisma'

const repo = new WorkshopRepositoryPrisma()

const createWorkshopSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().length(2).optional().nullable(),
  phone: z.string().optional().nullable(),
})

// Schema para actualizar (campos opcionales)
const updateWorkshopSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().length(2).optional().nullable(),
  phone: z.string().optional().nullable(),
})

export const createWorkshopController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = createWorkshopSchema.parse(req.body)
    const result = await createWorkshop(
      { ownerId: req.user!.id, ...body },
      { repo, authenticatedUserId: req.user!.id }
    )
    res.status(201).json(result)
  } catch (e) {
    next(e)
  }
}

export const getWorkshopController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workshop = await repo.findById(req.params.id)

    if (!workshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }

    // Si hay usuario autenticado y está en ruta protegida, verificar ownership
    if (
      req.user &&
      req.originalUrl.includes('/owner/') &&
      workshop.ownerId !== req.user.id
    ) {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    res.json(workshop)
  } catch (e) {
    next(e)
  }
}

export const getMyWorkshopsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workshops = await repo.findByOwnerId(req.user!.id)
    res.json(workshops)
  } catch (e) {
    next(e)
  }
}

export const updateWorkshopController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = updateWorkshopSchema.parse(req.body)

    // Verificar que el taller pertenece al usuario
    const existingWorkshop = await repo.findById(req.params.id)
    if (!existingWorkshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }
    if (existingWorkshop.ownerId !== req.user!.id) {
      return res
        .status(403)
        .json({ error: 'No tienes permisos para editar este taller' })
    }

    const result = await updateWorkshop(req.params.id, body, { repo })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const deleteWorkshopController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar que el taller pertenece al usuario
    const existingWorkshop = await repo.findById(req.params.id)
    if (!existingWorkshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }
    if (existingWorkshop.ownerId !== req.user!.id) {
      return res
        .status(403)
        .json({ error: 'No tienes permisos para eliminar este taller' })
    }

    await deleteWorkshop(req.params.id, { repo })
    res.json({ message: 'Taller eliminado correctamente' })
  } catch (e) {
    next(e)
  }
}
