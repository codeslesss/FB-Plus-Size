import { Router } from 'express'
import { PaymentMethod } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CREDITO: 'Crédito',
  DEBITO: 'Débito',
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
}

const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  CREDITO: 'credit_card',
  DEBITO: 'credit_card',
  PIX: 'qr_code_2',
  DINHEIRO: 'payments',
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

router.get(
  '/metrics',
  asyncHandler(async (req, res) => {
    const since = startOfToday()

    const [salesToday, exchangesToday] = await Promise.all([
      prisma.sale.findMany({ where: { createdAt: { gte: since }, status: 'COMPLETED' } }),
      prisma.exchange.count({ where: { createdAt: { gte: since } } }),
    ])

    const totalToday = salesToday.reduce((sum, sale) => sum + sale.total, 0)
    const averageTicket = salesToday.length > 0 ? totalToday / salesToday.length : 0

    res.json({
      salesTodayTotal: totalToday.toFixed(2),
      salesTodayCount: salesToday.length,
      averageTicket: averageTicket.toFixed(2),
      exchangesToday,
    })
  }),
)

router.get(
  '/recent-sales',
  asyncHandler(async (req, res) => {
    const { limit } = req.query
    const take = typeof limit === 'string' ? Math.min(Number(limit) || 5, 50) : 5

    const sales = await prisma.sale.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    })

    res.json(
      sales.map((sale) => ({
        id: sale.id,
        time: sale.createdAt.toISOString(),
        product: sale.items.map((item) => item.product.name).join(', '),
        value: sale.total.toFixed(2),
        payment: PAYMENT_LABELS[sale.paymentMethod],
        paymentIcon: PAYMENT_ICONS[sale.paymentMethod],
      })),
    )
  }),
)

export default router
