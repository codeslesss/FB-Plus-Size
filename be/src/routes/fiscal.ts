import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { fiscalIssuer } from '../lib/fiscal.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()
router.get('/settings', (_req, res) => res.json(fiscalIssuer()))
router.get('/documents', asyncHandler(async (_req, res) => {
  res.json(await prisma.fiscalDocument.findMany({
    take: 100, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, saleId: true, model: true, status: true, message: true, createdAt: true,
      sale: { select: { total: true, customerName: true, createdAt: true } } },
  }))
}))
router.get('/documents/:id', asyncHandler<{ id: string }>(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw new BadRequestError('Documento inválido')
  const document = await prisma.fiscalDocument.findUnique({ where: { id: req.params.id } })
  if (!document) throw new NotFoundError('Documento não encontrado')
  res.json(document)
}))
export default router
