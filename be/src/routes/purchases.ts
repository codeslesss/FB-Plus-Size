import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { transaction } from '../lib/transaction.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { parsePurchaseXml } from '../lib/purchaseXml.js'
import { validatePurchase } from '../lib/fiscal.js'

const router = Router()
const mappingSchema = z.array(z.object({
  itemNumber: z.number().int().positive(),
  productVariantId: z.string().regex(/^[a-f\d]{24}$/i),
  stockQuantity: z.number().int().min(1).max(1_000_000),
})).min(1).max(500)

router.post('/preview', asyncHandler(async (req, res) => {
  const body = z.object({ xml: z.string() }).safeParse(req.body)
  if (!body.success) throw new BadRequestError('Selecione um arquivo XML')
  res.json(parsePurchaseXml(body.data.xml))
}))

router.get('/', asyncHandler(async (_req, res) => {
  res.json(await prisma.purchaseInvoice.findMany({
    take: 100, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, accessKey: true, supplierName: true, supplierCnpj: true, number: true, series: true,
      issuedAt: true, total: true, source: true, createdAt: true, _count: { select: { items: true } } },
  }))
}))

router.get('/:id', asyncHandler<{ id: string }>(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw new BadRequestError('Nota inválida')
  const invoice = await prisma.purchaseInvoice.findUnique({
    where: { id: req.params.id }, include: { items: { include: { productVariant: { include: { product: true } } } } },
  })
  if (!invoice) throw new NotFoundError('Nota de compra não encontrada')
  res.json(invoice)
}))

router.post('/', asyncHandler(async (req, res) => {
  const body = z.object({ xml: z.string().optional(), invoice: z.unknown().optional(), mappings: z.unknown() }).safeParse(req.body)
  if (!body.success) throw new BadRequestError('Dados da nota inválidos')
  const xml = body.data.xml
  if (xml !== undefined && typeof xml !== 'string') throw new BadRequestError('XML inválido')
  const invoice = xml !== undefined ? parsePurchaseXml(xml) : validatePurchase(body.data.invoice)
  if (xml === undefined && invoice.items.some(item => Math.round(item.subtotal * 100) !== Math.round(item.quantity * item.unitCost * 100))) {
    throw new BadRequestError('Subtotal do item não corresponde à quantidade e custo unitário')
  }
  const mappings = mappingSchema.safeParse(body.data.mappings)
  if (!mappings.success) throw new BadRequestError('Vincule cada item a uma variação e informe a quantidade recebida')
  const byItem = new Map(mappings.data.map((mapping) => [mapping.itemNumber, mapping]))
  if (byItem.size !== invoice.items.length || byItem.size !== mappings.data.length ||
      invoice.items.some((item) => !byItem.has(item.itemNumber))) {
    throw new BadRequestError('Todos os itens da nota devem ser vinculados uma única vez')
  }
  try {
    const saved = await transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: mappings.data.map((mapping) => mapping.productVariantId) } }, include: { product: true },
      })
      if (mappings.data.some((mapping) => !variants.some((variant) => variant.id === mapping.productVariantId && variant.product.active))) {
        throw new BadRequestError('Um dos produtos vinculados não existe ou está inativo')
      }
      const { items, ...header } = invoice
      // The unique invoice identifiers make registration and stock entry idempotent.
      const result = await tx.purchaseInvoice.create({
        data: { ...header, issuedAt: new Date(header.issuedAt), source: xml === undefined ? 'MANUAL' : 'XML',
          xml, createdById: req.user!.id,
          items: { create: items.map((item) => ({ ...item, ...byItem.get(item.itemNumber)! })) } },
        include: { items: true },
      })
      const received = new Map<string, { quantity: number; amount: number }>()
      for (const item of items) {
        const mapping = byItem.get(item.itemNumber)!
        const current = received.get(mapping.productVariantId) ?? { quantity: 0, amount: 0 }
        current.quantity += mapping.stockQuantity
        current.amount += item.subtotal
        received.set(mapping.productVariantId, current)
      }
      for (const [id, entry] of received) {
        await tx.productVariant.update({ where: { id },
          data: { stockQuantity: { increment: entry.quantity }, lastPurchaseUnitCost: entry.amount / entry.quantity } })
      }
      return result
    })
    res.status(201).json(saved)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      throw new BadRequestError('Esta nota de compra já foi registrada. O estoque não foi alterado novamente.')
    }
    throw error
  }
}))

export default router
