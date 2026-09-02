import { PrismaClient, PaymentMethod } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.exchange.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()

  const calca = await prisma.product.create({
    data: {
      name: 'Calça Jeans Plus Size Flare',
      sku: 'CAL-001',
      category: 'Calças',
      price: 189.9,
      variants: {
        create: [
          { size: '46', color: 'Azul', stockQuantity: 12 },
          { size: '48', color: 'Azul', stockQuantity: 3 },
          { size: '50', color: 'Azul', stockQuantity: 8 },
        ],
      },
    },
    include: { variants: true },
  })

  const blusa = await prisma.product.create({
    data: {
      name: 'Blusa Tricot Gola V',
      sku: 'BLU-001',
      category: 'Blusas',
      price: 89.9,
      variants: {
        create: [
          { size: 'G', color: 'Bege', stockQuantity: 15 },
          { size: 'GG', color: 'Bege', stockQuantity: 10 },
        ],
      },
    },
    include: { variants: true },
  })

  const vestido = await prisma.product.create({
    data: {
      name: 'Vestido Estampado Floral',
      sku: 'VES-001',
      category: 'Vestidos',
      price: 210.0,
      variants: {
        create: [
          { size: 'M', color: 'Floral', stockQuantity: 3, lowStockThreshold: 5 },
          { size: 'G', color: 'Floral', stockQuantity: 6 },
        ],
      },
    },
    include: { variants: true },
  })

  const conjunto = await prisma.product.create({
    data: {
      name: 'Conjunto Moletom Casual',
      sku: 'CON-001',
      category: 'Conjuntos',
      price: 250.0,
      variants: {
        create: [{ size: 'G', color: 'Cinza', stockQuantity: 7 }],
      },
    },
    include: { variants: true },
  })

  const vestidoLongo = await prisma.product.create({
    data: {
      name: 'Vestido Longo Manga Curta',
      sku: 'VES-002',
      category: 'Vestidos',
      price: 220.0,
      variants: {
        create: [{ size: 'M', color: 'Preto', stockQuantity: 3, lowStockThreshold: 5 }],
      },
    },
    include: { variants: true },
  })

  const now = new Date()
  const at = (hours: number, minutes: number) => {
    const d = new Date(now)
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  await prisma.sale.create({
    data: {
      total: 189.9,
      paymentMethod: PaymentMethod.CREDITO,
      createdAt: at(14, 32),
      items: {
        create: [
          {
            productId: calca.id,
            productVariantId: calca.variants[0].id,
            quantity: 1,
            unitPrice: calca.price,
            subtotal: calca.price,
          },
        ],
      },
    },
  })

  await prisma.sale.create({
    data: {
      total: 89.9,
      paymentMethod: PaymentMethod.PIX,
      createdAt: at(13, 15),
      items: {
        create: [
          {
            productId: blusa.id,
            productVariantId: blusa.variants[0].id,
            quantity: 1,
            unitPrice: blusa.price,
            subtotal: blusa.price,
          },
        ],
      },
    },
  })

  await prisma.sale.create({
    data: {
      total: 210.0,
      paymentMethod: PaymentMethod.DEBITO,
      createdAt: at(11, 45),
      items: {
        create: [
          {
            productId: vestido.id,
            productVariantId: vestido.variants[0].id,
            quantity: 1,
            unitPrice: vestido.price,
            subtotal: vestido.price,
          },
        ],
      },
    },
  })

  await prisma.sale.create({
    data: {
      total: 250.0,
      paymentMethod: PaymentMethod.DINHEIRO,
      createdAt: at(10, 20),
      items: {
        create: [
          {
            productId: conjunto.id,
            productVariantId: conjunto.variants[0].id,
            quantity: 1,
            unitPrice: conjunto.price,
            subtotal: conjunto.price,
          },
        ],
      },
    },
  })

  console.log('Seed concluído.', { produtos: 5, vendas: 4, vestidoLongoBaixoEstoque: vestidoLongo.name })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
