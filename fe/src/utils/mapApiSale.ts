import type { ApiSale } from '../api/types'
import type { SaleRecord } from '../types/saleRecord'
import { paymentMethodLabel } from './paymentMethod'
import { deriveSaleStatus } from './deriveSaleStatus'

export function mapApiSaleToRecord(sale: ApiSale): SaleRecord {
  return {
    id: sale.id,
    date: new Date(sale.createdAt),
    paymentMethod: paymentMethodLabel(sale.paymentMethod),
    status: deriveSaleStatus(sale),
    items: sale.items.map((item) => ({
      name: item.product.name,
      size: item.productVariant.size,
      price: Number(item.subtotal),
      quantity: item.quantity,
    })),
  }
}
