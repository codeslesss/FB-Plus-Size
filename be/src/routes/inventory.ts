import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'

const router = Router()

const stockAdjustSchema = z.object({
  delta: z.number().int(),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { lowStockOnly } = req.query

    const variants = await prisma.productVariant.findMany({
      where: { product: { active: true } },
      include: { product: true },
      orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
    })

    const withFlags = variants.map((variant) => ({
      ...variant,
      lowStock: variant.stockQuantity <= variant.lowStockThreshold,
    }))

    const result = lowStockOnly === 'true' ? withFlags.filter((v) => v.lowStock) : withFlags

    res.json(result)
  }),
)

router.patch(
  '/:variantId/stock',
  asyncHandler<{ variantId: string }>(async (req, res) => {
    const parsed = stockAdjustSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const variant = await prisma.productVariant.findUnique({ where: { id: req.params.variantId } })
    if (!variant) throw new NotFoundError('Variante não encontrada')

    const nextQuantity = variant.stockQuantity + parsed.data.delta
    if (nextQuantity < 0) throw new BadRequestError('Estoque não pode ficar negativo')

    const updated = await prisma.productVariant.update({
      where: { id: req.params.variantId },
      data: { stockQuantity: nextQuantity },
      include: { product: true },
    })

    res.json(updated)
  }),
)

export default router
