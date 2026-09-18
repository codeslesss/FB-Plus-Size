import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import express from 'express'
import { prisma } from '../src/lib/prisma.js'
import sales from '../src/routes/sales.js'
import exchanges from '../src/routes/exchanges.js'
import inventory from '../src/routes/inventory.js'
import dashboard from '../src/routes/dashboard.js'
import { HttpError } from '../src/lib/errors.js'

// Only the database boundary is replaced. Requests exercise the actual Express routes.
const app = express()
app.use(express.json())
app.use('/sales', sales)
app.use('/exchanges', exchanges)
app.use('/inventory', inventory)
app.use('/dashboard', dashboard)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err instanceof HttpError ? err.status : 500).json({ error: err.message })
})
const server = app.listen(0, '127.0.0.1')
await new Promise<void>((resolve) => server.once('listening', resolve))
const address = server.address() as { port: number }
after(() => new Promise<void>((resolve) => server.close(() => resolve())))

async function request(path: string, body?: unknown, method = 'POST') {
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method: body === undefined ? 'GET' : method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}

function database({ stock = 3, sold = 2, returned = 0, active = true } = {}) {
  const variant = { id: 'variant', productId: 'product', size: 'G', color: 'Azul', stockQuantity: stock,
    product: { id: 'product', name: 'Blusa', price: 50, active } }
  const sale = { id: 'sale', status: 'COMPLETED', total: 80, discount: 20, exchangeVersion: 0,
    items: [{ productVariantId: 'variant', quantity: sold, unitPrice: 50, subtotal: sold * 50 }],
    exchanges: returned ? [{ returnedVariantId: 'variant', returnedQuantity: returned, newVariantId: null, priceDifference: -40 * returned }] : [] }
  const tx = {
    productVariant: {
      findUnique: async () => variant,
      findMany: async () => [variant],
      updateMany: async ({ where, data }: any) => {
        if (where.stockQuantity?.gte > variant.stockQuantity) return { count: 0 }
        variant.stockQuantity += data.stockQuantity.increment ?? -data.stockQuantity.decrement
        return { count: 1 }
      },
      update: async ({ data }: any) => {
        if (typeof data.stockQuantity === 'number') variant.stockQuantity = data.stockQuantity
        else variant.stockQuantity += data.stockQuantity.increment ?? -data.stockQuantity.decrement
        return variant
      },
    },
    sale: { findUnique: async () => sale, update: async () => sale,
      create: async ({ data }: any) => ({ id: 'new-sale', ...data }) },
    exchange: { findMany: async () => sale.exchanges,
      create: async ({ data }: any) => { sale.exchanges.push(data); return data } },
  }
  Object.assign(prisma.productVariant, tx.productVariant)
  Object.assign(prisma.sale, tx.sale)
  Object.assign(prisma.exchange, tx.exchange)
  prisma.$transaction = (async (callback: any) => callback(tx)) as typeof prisma.$transaction
  return { variant, sale, tx }
}

test('histórico permite buscar a segunda página e rejeita limites inválidos', async () => {
  let query: any
  prisma.sale.findMany = (async (args: any) => { query = args; return [] }) as any
  assert.equal((await request('/sales?limit=100&offset=100')).status, 200)
  assert.equal(query.skip, 100)
  assert.equal((await request('/sales?limit=-1')).status, 400)
  assert.equal((await request('/sales?since=invalid')).status, 400)
})

test('não vende mais estoque quando a mesma variação aparece em duas linhas', async () => {
  const { variant } = database({ stock: 3 })
  const result = await request('/sales', { paymentMethod: 'PIX', customerName: 'Teste',
    items: [{ productVariantId: 'variant', quantity: 2 }, { productVariantId: 'variant', quantity: 2 }] })
  assert.equal(result.status, 400)
  assert.equal(variant.stockQuantity, 3)
})

test('produto inativo não pode ser vendido', async () => {
  database({ active: false })
  assert.equal((await request('/sales', { paymentMethod: 'PIX', customerName: 'Teste',
    items: [{ productVariantId: 'variant', quantity: 1 }] })).status, 400)
})

test('devolução deve pertencer à venda e respeitar a quantidade restante', async () => {
  const { sale, variant } = database({ sold: 2, returned: 1 })
  assert.equal((await request('/exchanges', { saleId: 'sale', returnedVariantId: 'variant', returnedQuantity: 2 })).status, 400)
  assert.equal(variant.stockQuantity, 3)
  sale.items = []
  assert.equal((await request('/exchanges', { saleId: 'sale', returnedVariantId: 'variant' })).status, 400)
})

test('não aceita devolução de venda cancelada', async () => {
  const { sale } = database()
  sale.status = 'CANCELLED'
  assert.equal((await request('/exchanges', { saleId: 'sale', returnedVariantId: 'variant' })).status, 400)
})

test('reembolso usa preço da venda com desconto, mesmo após alteração no catálogo', async () => {
  const { variant } = database()
  variant.product.price = 99
  const result = await request('/exchanges', { saleId: 'sale', returnedVariantId: 'variant' })
  assert.equal(result.status, 201)
  assert.equal(result.body.priceDifference, -40)
  assert.equal(variant.stockQuantity, 4)
})

test('ajustes concorrentes de estoque não perdem incrementos', async () => {
  const { variant } = database({ stock: 3 })
  let reads = 0
  let release!: () => void
  const bothRead = new Promise<void>((resolve) => { release = resolve })
  prisma.productVariant.findUnique = (async () => {
    const snapshot = { ...variant }
    if (++reads === 2) release()
    if (reads <= 2) await bothRead
    return snapshot
  }) as any
  const results = await Promise.all([
    request('/inventory/variant/stock', { delta: 2 }, 'PATCH'),
    request('/inventory/variant/stock', { delta: 2 }, 'PATCH'),
  ])
  assert.deepEqual(results.map((result) => result.status), [200, 200])
  assert.equal(variant.stockQuantity, 7)
})

test('dashboard desconta reembolso parcial do faturamento', async () => {
  const { sale } = database({ returned: 1 })
  prisma.sale.findMany = (async () => [sale]) as any
  prisma.exchange.count = (async () => 1) as any
  const result = await request('/dashboard/metrics')
  assert.equal(result.status, 200)
  assert.equal(result.body.salesTodayTotal, '40.00')
})

test('frontend carrega mais de 100 vendas e mantém a mesma data limite nas páginas', async () => {
  const { fetchSalesHistory } = await import('../../fe/src/api/sales.ts')
  const realFetch = globalThis.fetch
  const queries: URLSearchParams[] = []
  const records = Array.from({ length: 207 }, (_, id) => ({ id: String(id) }))
  globalThis.fetch = (async (url: string) => {
    const query = new URL(url).searchParams
    queries.push(query)
    const offset = Number(query.get('offset'))
    return Response.json(records.slice(offset, offset + Number(query.get('limit'))))
  }) as typeof fetch
  try {
    assert.equal((await fetchSalesHistory()).length, 207)
    assert.deepEqual(queries.map((query) => query.get('offset')), ['0', '100', '200'])
    assert.equal(new Set(queries.map((query) => query.get('until'))).size, 1)
  } finally {
    globalThis.fetch = realFetch
  }
})

test('histórico preserva total com desconto e saldo após devolução parcial', async () => {
  const { mapApiSaleToRecord } = await import('../../fe/src/utils/mapApiSale.ts')
  const record = mapApiSaleToRecord({ id: 'sale', createdAt: new Date().toISOString(),
    total: '80', netTotal: 40, paymentMethod: 'PIX', status: 'COMPLETED',
    items: [{ subtotal: '100', quantity: 2, product: { name: 'Blusa' }, productVariant: { size: 'G' } }],
    exchanges: [{ returnedQuantity: 1, newVariantId: null }] } as any)
  assert.equal(record.total, 80)
  assert.equal(record.netTotal, 40)
})

test('valores monetários fecham em centavos e devoluções antigas são contabilizadas', async () => {
  const { returnedValue, netSaleTotal } = await import('../src/lib/saleTotals.js')
  const sale = { total: 10, items: [{ productVariantId: 'v', quantity: 3, subtotal: 12 }],
    exchanges: [{ returnedVariantId: 'v', returnedQuantity: 1, newVariantId: null, priceDifference: 0 }] }
  const refunds = [0, 1, 2].map((previous) => returnedValue(sale, 'v', 1, previous))
  assert.deepEqual(refunds, [3.33, 3.34, 3.33])
  assert.equal(netSaleTotal(sale), 6.67)
})

test('devoluções sucessivas esgotam apenas a quantidade comprada', async () => {
  const { variant } = database({ sold: 2 })
  const payload = { saleId: 'sale', returnedVariantId: 'variant', returnedQuantity: 1 }
  assert.equal((await request('/exchanges', payload)).status, 201)
  assert.equal((await request('/exchanges', payload)).status, 201)
  assert.equal((await request('/exchanges', payload)).status, 400)
  assert.equal(variant.stockQuantity, 5)
})

test('conflito de transação refaz a leitura antes de processar a devolução', async () => {
  const { sale, tx } = database({ sold: 1 })
  let attempts = 0
  prisma.$transaction = (async (callback: any) => {
    if (++attempts === 1) {
      sale.exchanges.push({ returnedVariantId: 'variant', returnedQuantity: 1, newVariantId: null, priceDifference: -80 })
      throw Object.assign(new Error('write conflict'), { code: 'P2034' })
    }
    return callback(tx)
  }) as typeof prisma.$transaction
  assert.equal((await request('/exchanges', { saleId: 'sale', returnedVariantId: 'variant' })).status, 400)
  assert.equal(attempts, 2)
})

test('tela de trocas usa o reembolso correto e oculta itens já devolvidos', async () => {
  const { saleWithTotals } = await import('../src/lib/saleTotals.js')
  const { mapExchangeSale } = await import('../../fe/src/utils/mapExchangeSale.ts')
  const { sale, variant } = database({ sold: 2, returned: 1 })
  const apiSale = { ...sale, createdAt: new Date().toISOString(), paymentMethod: 'PIX',
    items: sale.items.map((item) => ({ ...item, id: 'item', unitPrice: 50,
      product: { ...variant.product, sku: 'SKU' }, productVariant: variant })) }
  assert.equal(mapExchangeSale(saleWithTotals(apiSale) as any).items[0].price, 40)
  sale.exchanges.push({ returnedVariantId: 'variant', returnedQuantity: 1, newVariantId: null, priceDifference: -40 })
  assert.equal(mapExchangeSale(saleWithTotals(apiSale) as any).items.length, 0)
})

test('falha na reserva de estoque não registra a venda', async () => {
  const { tx } = database()
  let created = false
  tx.productVariant.updateMany = async () => ({ count: 0 })
  tx.sale.create = async ({ data }: any) => { created = true; return data }
  assert.equal((await request('/sales', { paymentMethod: 'PIX', customerName: 'Teste',
    items: [{ productVariantId: 'variant', quantity: 1 }] })).status, 400)
  assert.equal(created, false)
})

test('rateio de desconto entre produtos não cria centavos extras de reembolso', async () => {
  const { returnedValue } = await import('../src/lib/saleTotals.js')
  const sale = { total: 0.01, items: [
    { productVariantId: 'a', quantity: 1, subtotal: 1 },
    { productVariantId: 'b', quantity: 1, subtotal: 1 },
  ] }
  assert.equal(returnedValue(sale, 'a', 1) + returnedValue(sale, 'b', 1), 0.01)
})
