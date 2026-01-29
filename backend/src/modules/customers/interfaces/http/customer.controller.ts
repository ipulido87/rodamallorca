// backend/src/modules/customers/interfaces/http/customer.controller.ts
import type { Request, Response, NextFunction } from 'express'
import prisma from '../../../../lib/prisma'
import { customerRepositoryPrisma } from '../../infrastructure/persistence/prisma/customer-repository-prisma'
import { getCustomers } from '../../application/get-customers'
import { getCustomerById } from '../../application/get-customer-by-id'
import { createCustomer } from '../../application/create-customer'
import { updateCustomer } from '../../application/update-customer'
import { deleteCustomer } from '../../application/delete-customer'

// Helper function to get user's workshop
async function getUserWorkshop(userId: string) {
  return prisma.workshop.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  })
}

// GET /api/customers - Listar clientes del taller
export const getCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const workshop = await getUserWorkshop(userId)
    if (!workshop) {
      return res.status(403).json({ message: 'No tienes un taller asignado' })
    }

    const customers = await getCustomers({
      customerRepository: customerRepositoryPrisma,
      workshopId: workshop.id,
    })

    res.json(customers)
  } catch (error) {
    next(error)
  }
}

// GET /api/customers/:id - Obtener cliente por ID
export const getCustomerByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const workshop = await getUserWorkshop(userId)
    if (!workshop) {
      return res.status(403).json({ message: 'No tienes un taller asignado' })
    }

    const customer = await getCustomerById(id as string, {
      customerRepository: customerRepositoryPrisma,
      workshopId: workshop.id,
    })

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    res.json(customer)
  } catch (error) {
    next(error)
  }
}

// POST /api/customers - Crear cliente
export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const workshop = await getUserWorkshop(userId)
    if (!workshop) {
      return res.status(403).json({ message: 'No tienes un taller asignado' })
    }

    const customer = await createCustomer(
      {
        ...req.body,
        workshopId: workshop.id,
      },
      {
        customerRepository: customerRepositoryPrisma,
      }
    )

    res.status(201).json(customer)
  } catch (error) {
    next(error)
  }
}

// PUT /api/customers/:id - Actualizar cliente
export const updateCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const workshop = await getUserWorkshop(userId)
    if (!workshop) {
      return res.status(403).json({ message: 'No tienes un taller asignado' })
    }

    const customer = await updateCustomer(id as string, req.body, {
      customerRepository: customerRepositoryPrisma,
      workshopId: workshop.id,
    })

    res.json(customer)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/customers/:id - Eliminar cliente
export const deleteCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    const workshop = await getUserWorkshop(userId)
    if (!workshop) {
      return res.status(403).json({ message: 'No tienes un taller asignado' })
    }

    await deleteCustomer(id as string, {
      customerRepository: customerRepositoryPrisma,
      workshopId: workshop.id,
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
