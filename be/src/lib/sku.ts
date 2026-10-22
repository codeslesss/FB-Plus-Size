import { prisma } from './prisma.js'

/** "Vestidos" -> "VES", "Calças Jeans" -> "CAL"; falls back to "PRD" when the category has no letters. */
export function skuPrefix(category: string): string {
  const letters = category
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
  return letters.length >= 3 ? letters.slice(0, 3) : 'PRD'
}

export function nextSku(prefix: string, existingSkus: string[]): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  const highest = existingSkus.reduce((max, sku) => {
    const match = pattern.exec(sku)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `${prefix}-${String(highest + 1).padStart(4, '0')}`
}

export async function generateSku(category: string): Promise<string> {
  const prefix = skuPrefix(category)
  const existing = await prisma.product.findMany({
    where: { sku: { startsWith: `${prefix}-` } },
    select: { sku: true },
  })
  return nextSku(prefix, existing.map((product) => product.sku))
}
