import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { returnedValue, roundMoney } from '../lib/saleTotals.js'
import { transaction } from '../lib/transaction.js'

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
        sale: { include: { items: true, exchanges: true } },
        returnedVariant: { include: { product: true } },
        newVariant: { include: { product: true } },
      },
    })

    res.json(exchanges.map((exchange) => {
      if (exchange.newVariantId || exchange.priceDifference !== 0) return exchange
      const previous = exchange.sale.exchanges.filter((line) =>
        line.returnedVariantId === exchange.returnedVariantId &&
        (line.createdAt < exchange.createdAt || (line.createdAt.getTime() === exchange.createdAt.getTime() && line.id < exchange.id)),
      ).reduce((sum, line) => sum + line.returnedQuantity, 0)
      return { ...exchange, priceDifference: -returnedValue(exchange.sale, exchange.returnedVariantId, exchange.returnedQuantity, previous) }
    }))
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
    if (!newVariantId && newQuantity) throw new BadRequestError('Informe a variante nova para realizar uma troca')

    const exchange = await transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: saleId }, include: { items: true, exchanges: true } })
      if (!sale) throw new NotFoundError('Venda não encontrada')
      if (sale.status !== 'COMPLETED') throw new BadRequestError('Venda cancelada não permite trocas ou devoluções')
      const sold = sale.items.filter((item) => item.productVariantId === returnedVariantId)
        .reduce((sum, item) => sum + item.quantity, 0)
      const previouslyReturned = sale.exchanges.filter((item) => item.returnedVariantId === returnedVariantId)
        .reduce((sum, item) => sum + item.returnedQuantity, 0)
      if (returnedQuantity > sold - previouslyReturned) {
        throw new BadRequestError('Quantidade devolvida excede os itens restantes desta venda')
      }
      // Concurrent returns must write the same sale document so MongoDB detects
      // a conflict and the retry reads the latest remaining quantity.
      await tx.sale.update({ where: { id: saleId }, data: { exchangeVersion: sale.exchangeVersion + 1 } })

      const returnedVariant = await tx.productVariant.findUnique({
        where: { id: returnedVariantId },
        include: { product: true },
      })
      if (!returnedVariant) throw new NotFoundError('Variante devolvida não encontrada')

      const returnedAmount = returnedValue(sale, returnedVariantId, returnedQuantity, previouslyReturned)
      let priceDifference = -returnedAmount
      let newVariant = null

      if (newVariantId && newQuantity) {
        newVariant = await tx.productVariant.findUnique({
          where: { id: newVariantId },
          include: { product: true },
        })
        if (!newVariant) throw new NotFoundError('Variante nova não encontrada')
        if (!newVariant.product.active) throw new BadRequestError('Produto inativo não pode ser usado na troca')
        if (newVariant.stockQuantity < newQuantity) {
          throw new BadRequestError(`Estoque insuficiente para ${newVariant.product.name} (${newVariant.size}/${newVariant.color})`)
        }

        const newValue = roundMoney(newVariant.product.price * newQuantity)
        priceDifference = roundMoney(newValue - returnedAmount)

        const updated = await tx.productVariant.updateMany({
          where: { id: newVariantId, stockQuantity: { gte: newQuantity } },
          data: { stockQuantity: { decrement: newQuantity } },
        })
        if (updated.count !== 1) throw new BadRequestError('Estoque insuficiente para realizar a troca')
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
