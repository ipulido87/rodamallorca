import { NextFunction, Request, Response } from 'express'
import { createWorkshop } from '../../application/create-workshop'
import { deleteWorkshop } from '../../application/delete-workshop'
import { updateWorkshop } from '../../application/update-workshop'
import { WorkshopRepositoryPrisma } from '../../infrastructure/persistence/prisma/workshop-repository-prisma'
import {
  CreateWorkshopSchema,
  UpdateWorkshopSchema,
} from '../http/schemas/workshop.schemas'

const repo = new WorkshopRepositoryPrisma()

// Aliases para mantener compatibilidad con código existente
const createWorkshopSchema = CreateWorkshopSchema
const updateWorkshopSchema = UpdateWorkshopSchema

export const createWorkshopController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ VALIDACIÓN: Verificar que req.user.id exista
    if (!req.user?.id) {
      console.error('❌ [createWorkshopController] req.user.id es undefined!')
      console.error('req.user:', req.user)
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.'
      })
    }

    // ✅ VALIDACIÓN: Un usuario solo puede tener un taller
    const existingWorkshops = await repo.findByOwnerId(req.user.id)
    if (existingWorkshops.length > 0) {
      console.log(`❌ [createWorkshopController] Usuario ${req.user.id} ya tiene ${existingWorkshops.length} taller(es)`)
      return res.status(403).json({
        error: 'MAX_WORKSHOPS_REACHED',
        message: 'Solo puedes tener un taller por cuenta. Si necesitas gestionar múltiples talleres, contáctanos.',
        existingWorkshopId: existingWorkshops[0].id,
      })
    }

    const body = createWorkshopSchema.parse(req.body)
    const result = await createWorkshop(
      { ownerId: req.user.id, ...body },
      { repo, authenticatedUserId: req.user.id }
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
    // ✅ VALIDACIÓN: Verificar que req.user.id exista
    if (!req.user?.id) {
      console.error('❌ [getMyWorkshopsController] req.user.id es undefined!')
      console.error('req.user:', req.user)
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.'
      })
    }

    const workshops = await repo.findByOwnerId(req.user.id)
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
    // ✅ VALIDACIÓN: Verificar que req.user.id exista
    if (!req.user?.id) {
      console.error('❌ [updateWorkshopController] req.user.id es undefined!')
      console.error('req.user:', req.user)
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.'
      })
    }

    const body = updateWorkshopSchema.parse(req.body)

    // Verificar que el taller pertenece al usuario
    const existingWorkshop = await repo.findById(req.params.id)
    if (!existingWorkshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }
    if (existingWorkshop.ownerId !== req.user.id) {
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
    // ✅ VALIDACIÓN: Verificar que req.user.id exista
    if (!req.user?.id) {
      console.error('❌ [deleteWorkshopController] req.user.id es undefined!')
      console.error('req.user:', req.user)
      return res.status(401).json({
        error: 'Token inválido: falta ID de usuario. Por favor, vuelve a iniciar sesión.'
      })
    }

    // Verificar que el taller pertenece al usuario
    const existingWorkshop = await repo.findById(req.params.id)
    if (!existingWorkshop) {
      return res.status(404).json({ error: 'Workshop no encontrado' })
    }
    if (existingWorkshop.ownerId !== req.user.id) {
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
