import type { ApiSale } from '../api/types'
import type { Sale } from '../types/exchange'
import { paymentMethodLabel } from './paymentMethod'

export function mapExchangeSale(sale: ApiSale): Sale {
  const seen = new Set<string>()
  return {
    id: sale.id,
    time: new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: paymentMethodLabel(sale.paymentMethod),
    items: sale.items.flatMap((item) => {
      if (sale.status === 'CANCELLED' || seen.has(item.productVariantId)) return []
      seen.add(item.productVariantId)
      const available = sale.returnableItems?.[item.productVariantId]
      if (available && available.quantity <= 0) return []
      return [{ id: item.id, productVariantId: item.productVariantId, code: item.product.sku,
        name: item.product.name, size: item.productVariant.size,
        price: available?.unitValue ?? Number(item.unitPrice) }]
    }),
  }
}
