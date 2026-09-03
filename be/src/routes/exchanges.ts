import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'

const router = Router()

const exchangeCreateSchema = z.object({
  saleId: z.string().min(1),
  returnedVariantId: z.string().min(1),
  returnedQuantity: z.number().int().positive().default(1),
  newVariantId: z.string().min(1).optional(),
  newQuantity: z.number().int().positive().optional(),
  reason: z.string().optional(),
  refundMethod: z.string().optional(),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit } = req.query
    const take = typeof limit === 'string' ? Math.min(Number(limit) || 20, 100) : 20

    const exchanges = await prisma.exchange.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sale: true,
        returnedVariant: { include: { product: true } },
        newVariant: { include: { product: true } },
      },
    })

    res.json(exchanges)
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = exchangeCreateSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const { saleId, returnedVariantId, returnedQuantity, newVariantId, newQuantity, reason, refundMethod } = parsed.data

    if (newVariantId && !newQuantity) {
      throw new BadRequestError('newQuantity é obrigatório quando newVariantId é informado')
    }

    const exchange = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId } })
      if (!sale) throw new NotFoundError('Venda não encontrada')

      const returnedVariant = await tx.productVariant.findUnique({
        where: { id: returnedVariantId },
        include: { product: true },
      })
      if (!returnedVariant) throw new NotFoundError('Variante devolvida não encontrada')

      let priceDifference = 0
      let newVariant = null

      if (newVariantId && newQuantity) {
        newVariant = await tx.productVariant.findUnique({
          where: { id: newVariantId },
          include: { product: true },
        })
        if (!newVariant) throw new NotFoundError('Variante nova não encontrada')
        if (newVariant.stockQuantity < newQuantity) {
          throw new BadRequestError(`Estoque insuficiente para ${newVariant.product.name} (${newVariant.size}/${newVariant.color})`)
        }

        const returnedValue = returnedVariant.product.price * returnedQuantity
        const newValue = newVariant.product.price * newQuantity
        priceDifference = newValue - returnedValue

        await tx.productVariant.update({
          where: { id: newVariantId },
          data: { stockQuantity: { decrement: newQuantity } },
        })
      }

      await tx.productVariant.update({
        where: { id: returnedVariantId },
        data: { stockQuantity: { increment: returnedQuantity } },
      })

      return tx.exchange.create({
        data: {
          saleId,
          returnedVariantId,
          returnedQuantity,
          newVariantId,
          newQuantity,
          priceDifference,
          reason,
          refundMethod,
        },
        include: {
          returnedVariant: { include: { product: true } },
          newVariant: { include: { product: true } },
        },
      })
    })

    res.status(201).json(exchange)
  }),
)

export default router
