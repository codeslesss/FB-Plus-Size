import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

// Match every original identifier, not just an SKU that a real product could reuse.
const demoProducts = [
  { sku: 'CAL-001', name: 'Calça Jeans Plus Size Flare', category: 'Calças', price: 189.9 },
  { sku: 'BLU-001', name: 'Blusa Tricot Gola V', category: 'Blusas', price: 89.9 },
  { sku: 'VES-001', name: 'Vestido Estampado Floral', category: 'Vestidos', price: 210 },
  { sku: 'CON-001', name: 'Conjunto Moletom Casual', category: 'Conjuntos', price: 250 },
  { sku: 'VES-002', name: 'Vestido Longo Manga Curta', category: 'Vestidos', price: 220 },
]

async function main() {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--apply')) throw new Error('Use apenas --apply para aplicar a remoção.')
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL no arquivo be/.env antes de executar a limpeza.')
  const prisma = new PrismaClient()
  try {
    const where = { active: true, OR: demoProducts }
    const products = await prisma.product.findMany({ where, select: { id: true, sku: true, name: true } })
    console.table(products)
    if (!args.includes('--apply')) {
      console.log(`${products.length} produto(s) identificado(s). Nenhuma alteração feita. Use --apply para retirar do catálogo.`)
      return
    }
    // Same removal behavior as the application's product deletion endpoint:
    // hide from catalog, PDV and inventory, preserving references in past sales.
    const result = await prisma.product.updateMany({
      where: { ...where, id: { in: products.map((product) => product.id) } },
      data: { active: false },
    })
    console.log(`${result.count} produto(s) de demonstração retirado(s) do catálogo. Histórico e usuários preservados.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Não foi possível remover os produtos de demonstração.')
  process.exitCode = 1
})
