import type { ApiSale } from '../api/types'
import type { SaleStatus } from '../types/saleRecord'

export function deriveSaleStatus(sale: ApiSale): SaleStatus {
  if (sale.status === 'CANCELLED') return 'cancelled'

  const exchanges = sale.exchanges ?? []
  if (exchanges.some((exchange) => exchange.newVariantId)) return 'exchanged'
  if (exchanges.some((exchange) => !exchange.newVariantId)) return 'returned'
  return 'completed'
}
