type SaleAmounts = {
  total: number
  status?: string
  items: { productVariantId: string; quantity: number; subtotal: number }[]
  exchanges?: { returnedVariantId: string; returnedQuantity: number; newVariantId: string | null; priceDifference: number }[]
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

// Allocate the original discount proportionally; cumulative rounding preserves cents
// when a customer returns several units in separate visits.
export function returnedValue(sale: SaleAmounts, variantId: string, quantity: number, previouslyReturned = 0) {
  const groups = new Map<string, { quantity: number; gross: number }>()
  for (const item of sale.items) {
    const group = groups.get(item.productVariantId) ?? { quantity: 0, gross: 0 }
    group.quantity += item.quantity
    group.gross += Math.round(item.subtotal * 100)
    groups.set(item.productVariantId, group)
  }
  const gross = [...groups.values()].reduce((sum, group) => sum + group.gross, 0)
  if (!gross || !groups.get(variantId)?.quantity) return 0
  const totalCents = Math.round(sale.total * 100)
  const allocations = [...groups].map(([id, group]) => {
    const exact = totalCents * group.gross / gross
    return { id, quantity: group.quantity, cents: Math.floor(exact), remainder: exact - Math.floor(exact) }
  }).sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id))
  // Assign leftover cents deterministically so returning all products refunds
  // exactly the original total, including discounts spanning multiple variants.
  const leftover = totalCents - allocations.reduce((sum, group) => sum + group.cents, 0)
  for (let index = 0; index < leftover; index++) allocations[index].cents++
  const allocated = allocations.find((group) => group.id === variantId)!
  return (Math.round(allocated.cents * (previouslyReturned + quantity) / allocated.quantity)
    - Math.round(allocated.cents * previouslyReturned / allocated.quantity)) / 100
}

export function netSaleTotal(sale: SaleAmounts) {
  if (sale.status === 'CANCELLED') return 0
  const returned = new Map<string, number>()
  let total = sale.total
  for (const exchange of sale.exchanges ?? []) {
    const previous = returned.get(exchange.returnedVariantId) ?? 0
    // Legacy returns stored a zero difference. Compute their refund from the sale.
    total += !exchange.newVariantId && exchange.priceDifference === 0
      ? -returnedValue(sale, exchange.returnedVariantId, exchange.returnedQuantity, previous)
      : exchange.priceDifference
    returned.set(exchange.returnedVariantId, previous + exchange.returnedQuantity)
  }
  return Math.max(0, roundMoney(total))
}

export function saleWithTotals<T extends SaleAmounts>(sale: T) {
  const returnableItems: Record<string, { quantity: number; unitValue: number }> = {}
  for (const item of sale.items) {
    if (returnableItems[item.productVariantId]) continue
    const sold = sale.items.filter((line) => line.productVariantId === item.productVariantId)
      .reduce((sum, line) => sum + line.quantity, 0)
    const returned = (sale.exchanges ?? []).filter((line) => line.returnedVariantId === item.productVariantId)
      .reduce((sum, line) => sum + line.returnedQuantity, 0)
    returnableItems[item.productVariantId] = {
      quantity: sale.status === 'CANCELLED' ? 0 : Math.max(0, sold - returned),
      unitValue: returnedValue(sale, item.productVariantId, 1, returned),
    }
  }
  return { ...sale, netTotal: netSaleTotal(sale), returnableItems }
}
