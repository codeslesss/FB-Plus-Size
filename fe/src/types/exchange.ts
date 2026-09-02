export interface SaleItem {
  id: string
  productVariantId: string
  code: string
  name: string
  size: string
  price: number
}

export interface Sale {
  id: string
  time: string
  paymentMethod: string
  items: SaleItem[]
}

export type ExchangeAction = 'return' | 'exchange'

export interface ItemDraft {
  action: ExchangeAction | null
  reason: string
  refundMethod: string
  replacementCode: string
  replacementVariantId: string
}

export interface ReplacementVariant {
  id: string
  size: string
  color: string
  stockQuantity: number
}

export interface ReplacementProduct {
  code: string
  name: string
  price: number
  variants: ReplacementVariant[]
}

export interface HistoryEntry {
  id: string
  saleId: string
  itemName: string
  itemSize: string
  action: ExchangeAction
  detail: string
  value: number
  createdAt: string
}
