import type { Prisma } from '@prisma/client'
import { Router } from 'express'
import prisma from '../../../../lib/prisma'

const r = Router()

r.get('/workshops', async (req, res) => {
  const q = req.query.q?.toString()
  const city = req.query.city?.toString()
  const country = req.query.country?.toString()
  const page = Number(req.query.page ?? 1)
  const size = Math.min(Number(req.query.size ?? 12), 50) // cap 50

  const skip = (page - 1) * size

  const where: Prisma.WorkshopWhereInput = {
    ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(country ? { country: { equals: country } } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.workshop.findMany({
      where,
      skip,
      take: size,
      orderBy: { createdAt: 'desc' },
      // select: { id: true, name: true, city: true, country: true, createdAt: true }, // opcional: proyecta campos
    }),
    prisma.workshop.count({ where }),
  ])

  res.json({ items, total, page, size })
})

export default r
