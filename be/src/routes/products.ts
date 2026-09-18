import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'

const router = Router()

const variantInputSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stockQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
})

const variantUpdateSchema = z.object({
  size: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
})

const productCreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().trim().max(64).optional(),
  brand: z.string().trim().max(80).optional(),
  category: z.string().min(1),
  price: z.number().positive(),
  description: z.string().trim().max(2000).optional(),
  variants: z.array(variantInputSchema).default([]),
})

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().trim().max(64).optional(),
  brand: z.string().trim().max(80).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().trim().max(2000).optional(),
  active: z.boolean().optional(),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, active } = req.query

    const products = await prisma.product.findMany({
      where: {
        category: typeof category === 'string' ? category : undefined,
        active: typeof active === 'string' ? active === 'true' : undefined,
      },
      include: { variants: true },
      orderBy: { name: 'asc' },
    })

    res.json(products)
  }),
)

router.get(
  '/:id',
  asyncHandler<{ id: string }>(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: true },
    })

    if (!product) throw new NotFoundError('Produto não encontrado')
    res.json(product)
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = productCreateSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const { variants, ...productData } = parsed.data

    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: { create: variants },
      },
      include: { variants: true },
    })

    res.status(201).json(product)
  }),
)

router.put(
  '/:id',
  asyncHandler<{ id: string }>(async (req, res) => {
    const parsed = productUpdateSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const exists = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!exists) throw new NotFoundError('Produto não encontrado')

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: { variants: true },
    })

    res.json(product)
  }),
)

router.delete(
  '/:id',
  asyncHandler<{ id: string }>(async (req, res) => {
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!exists) throw new NotFoundError('Produto não encontrado')

    await prisma.product.update({ where: { id: req.params.id }, data: { active: false } })
    res.status(204).send()
  }),
)

router.post(
  '/:id/variants',
  asyncHandler<{ id: string }>(async (req, res) => {
    const parsed = variantInputSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) throw new NotFoundError('Produto não encontrado')

    const variant = await prisma.productVariant.create({
      data: { ...parsed.data, productId: product.id },
    })

    res.status(201).json(variant)
  }),
)

router.put(
  '/:id/variants/:variantId',
  asyncHandler<{ id: string; variantId: string }>(async (req, res) => {
    const parsed = variantUpdateSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError(parsed.error.message)

    const variant = await prisma.productVariant.findUnique({ where: { id: req.params.variantId } })
    if (!variant || variant.productId !== req.params.id) throw new NotFoundError('Variante não encontrada')

    try {
      const updated = await prisma.productVariant.update({
        where: { id: req.params.variantId },
        data: parsed.data,
      })
      res.json(updated)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestError('Já existe uma variante com esse tamanho e cor para este produto')
      }
      throw err
    }
  }),
)

router.delete(
  '/:id/variants/:variantId',
  asyncHandler<{ id: string; variantId: string }>(async (req, res) => {
    const variant = await prisma.productVariant.findUnique({ where: { id: req.params.variantId } })
    if (!variant || variant.productId !== req.params.id) throw new NotFoundError('Variante não encontrada')

    const [saleItemCount, exchangeCount, purchaseCount] = await Promise.all([
      prisma.saleItem.count({ where: { productVariantId: variant.id } }),
      prisma.exchange.count({
        where: { OR: [{ returnedVariantId: variant.id }, { newVariantId: variant.id }] },
      }),
      prisma.purchaseInvoiceItem.count({ where: { productVariantId: variant.id } }),
    ])

    if (saleItemCount > 0 || exchangeCount > 0 || purchaseCount > 0) {
      throw new BadRequestError('Não é possível excluir uma variante com compras, vendas ou trocas registradas')
    }

    await prisma.productVariant.delete({ where: { id: variant.id } })
    res.status(204).send()
  }),
)

export default router
