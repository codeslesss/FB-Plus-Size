import { Router } from 'express'
import { z } from 'zod'
import { Prisma, PaymentMethod } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'

const router = Router()

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
    const { limit, since } = req.query
    const take = typeof limit === 'string' ? Math.min(Number(limit) || 20, 100) : 20
    const createdAt = typeof since === 'string' ? { gte: new Date(since) } : undefined

    const sales = await prisma.sale.findMany({
      take,
      where: { createdAt },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true, productVariant: true } },
        exchanges: true,
      },
    })

    res.json(sales)
  }),
)

router.get(
  '/:id',
  asyncHandler<{ id: string }>(async (req, res) => {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true, productVariant: true } }, exchanges: true },
    })

    if (!sale) throw new NotFoundError('Venda não encontrada')
    res.json(sale)
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = saleCreateSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const { paymentMethod, discount, customerName, customerPhone, installments, cardBrand, items } = parsed.data
    const isCardPayment = paymentMethod === 'CREDITO' || paymentMethod === 'DEBITO'

    const sale = await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: items.map((item) => item.productVariantId) } },
        include: { product: true },
      })

      const variantsById = new Map(variants.map((variant) => [variant.id, variant]))

      let subtotalSum = new Prisma.Decimal(0)
      const saleItemsData = items.map((item) => {
        const variant = variantsById.get(item.productVariantId)
        if (!variant) throw new NotFoundError(`Variante ${item.productVariantId} não encontrada`)
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestError(`Estoque insuficiente para ${variant.product.name} (${variant.size}/${variant.color})`)
        }

        const subtotal = variant.product.price.mul(item.quantity)
        subtotalSum = subtotalSum.add(subtotal)

        return {
          productId: variant.productId,
          productVariantId: variant.id,
          quantity: item.quantity,
          unitPrice: variant.product.price,
          subtotal,
        }
      })

      const discountDecimal = Prisma.Decimal.min(new Prisma.Decimal(discount), subtotalSum)
      const total = subtotalSum.sub(discountDecimal)

      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      }

      return tx.sale.create({
        data: {
          total,
          discount: discountDecimal,
          paymentMethod,
          installments: paymentMethod === 'CREDITO' ? installments : 1,
          cardBrand: isCardPayment ? cardBrand || null : null,
          customerName,
          customerPhone: customerPhone || null,
          items: { create: saleItemsData },
        },
        include: { items: { include: { product: true, productVariant: true } } },
      })
    })

    res.status(201).json(sale)
  }),
)

export default router
