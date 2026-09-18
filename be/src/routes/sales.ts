import { Router } from 'express'
import { z } from 'zod'
import { PaymentMethod } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { saleWithTotals, roundMoney } from '../lib/saleTotals.js'
import { transaction } from '../lib/transaction.js'
import { fiscalIssuer, FISCAL_PENDING_MESSAGE } from '../lib/fiscal.js'

const router = Router()

const salesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  since: z.string().datetime({ offset: true }).optional(),
  until: z.string().datetime({ offset: true }).optional(),
})

const saleCreateSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  discount: z.number().min(0).default(0),
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().max(20).optional(),
  installments: z.number().int().min(1).max(12).default(1),
  cardBrand: z.string().trim().max(40).optional(),
  items: z
    .array(
      z.object({
        productVariantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = salesQuerySchema.safeParse(req.query)
    if (!parsed.success) throw new BadRequestError('Filtros de vendas inválidos')
    const { limit, offset, since, until } = parsed.data
    const createdAt = { gte: since ? new Date(since) : undefined, lte: until ? new Date(until) : undefined }

    const sales = await prisma.sale.findMany({
      take: limit,
      skip: offset,
      where: { createdAt },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        items: { include: { product: true, productVariant: true } },
        exchanges: true,
        fiscalDocument: true,
      },
    })

    res.json(sales.map(saleWithTotals))
  }),
)

router.get(
  '/:id',
  asyncHandler<{ id: string }>(async (req, res) => {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true, productVariant: true } }, exchanges: true, fiscalDocument: true },
    })

    if (!sale) throw new NotFoundError('Venda não encontrada')
    res.json(saleWithTotals(sale))
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = saleCreateSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const { paymentMethod, discount, customerName, customerPhone, installments, cardBrand } = parsed.data
    const quantities = new Map<string, number>()
    for (const item of parsed.data.items) {
      quantities.set(item.productVariantId, (quantities.get(item.productVariantId) ?? 0) + item.quantity)
    }
    const items = [...quantities].map(([productVariantId, quantity]) => ({ productVariantId, quantity }))
    const isCardPayment = paymentMethod === 'CREDITO' || paymentMethod === 'DEBITO'

    const sale = await transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: items.map((item) => item.productVariantId) } },
        include: { product: true },
      })

      const variantsById = new Map(variants.map((variant) => [variant.id, variant]))

      let subtotalSum = 0
      const saleItemsData = items.map((item) => {
        const variant = variantsById.get(item.productVariantId)
        if (!variant) throw new NotFoundError(`Variante ${item.productVariantId} não encontrada`)
        if (!variant.product.active) throw new BadRequestError('Produto inativo não pode ser vendido')
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestError(`Estoque insuficiente para ${variant.product.name} (${variant.size}/${variant.color})`)
        }

        const subtotal = roundMoney(variant.product.price * item.quantity)
        subtotalSum += subtotal

        return {
          productId: variant.productId,
          productVariantId: variant.id,
          quantity: item.quantity,
          unitPrice: variant.product.price,
          subtotal,
        }
      })

      const discountValue = roundMoney(Math.min(discount, subtotalSum))
      const total = roundMoney(subtotalSum - discountValue)

      for (const item of items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        })
        if (updated.count !== 1) throw new BadRequestError('Estoque insuficiente para finalizar a venda')
      }

      return tx.sale.create({
        data: {
          total,
          discount: discountValue,
          paymentMethod,
          installments: paymentMethod === 'CREDITO' ? installments : 1,
          cardBrand: isCardPayment ? cardBrand || null : null,
          customerName,
          customerPhone: customerPhone || null,
          items: { create: saleItemsData },
          fiscalDocument: { create: {
            message: FISCAL_PENDING_MESSAGE,
            snapshot: { issuer: fiscalIssuer(), total, discount: discountValue, paymentMethod,
              customerName, items: saleItemsData.map((item) => ({ ...item,
                name: variantsById.get(item.productVariantId)!.product.name,
                sku: variantsById.get(item.productVariantId)!.product.sku })) },
          } },
        },
        include: { items: { include: { product: true, productVariant: true } }, fiscalDocument: true },
      })
    })

    res.status(201).json(sale)
  }),
)

export default router
