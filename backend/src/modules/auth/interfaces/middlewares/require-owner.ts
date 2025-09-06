import { NextFunction, Response } from 'express'
import prisma from '../../../../lib/prisma'
import { AuthenticatedRequest } from './auth.middleware'

export const requireOwner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' })

    const workshop = await prisma.workshop.findFirst({
      where: { ownerId: req.user.id },
      select: { id: true },
    })

    if (!workshop) {
      return res
        .status(403)
        .json({ message: 'Forbidden: not a workshop owner' })
    }

    next()
  } catch (err) {
    console.error('requireOwner error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}
