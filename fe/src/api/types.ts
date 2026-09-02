export type ApiPaymentMethod = 'CREDITO' | 'DEBITO' | 'PIX' | 'DINHEIRO'
export type ApiSaleStatus = 'COMPLETED' | 'CANCELLED'

export interface ApiProductVariant {
  id: string
  productId: string
  size: string
  color: string
  stockQuantity: number
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export interface ApiProduct {
  id: string
  name: string
  sku: string
  category: string
  price: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  variants: ApiProductVariant[]
}

export interface ApiVariantWithProductBase extends ApiProductVariant {
  product: ApiProduct
}

export interface ApiVariantWithProduct extends ApiVariantWithProductBase {
  lowStock: boolean
}

export interface ApiSaleItem {
  id: string
  saleId: string
  productId: string
  productVariantId: string
  quantity: number
  unitPrice: string
  subtotal: string
  product: ApiProduct
  productVariant: ApiProductVariant
}

export interface ApiExchange {
  id: string
  saleId: string
  returnedVariantId: string
  returnedQuantity: number
  newVariantId: string | null
  newQuantity: number | null
  priceDifference: string
  reason: string | null
  refundMethod: string | null
  createdAt: string
}

export interface ApiSale {
  id: string
  total: string
  discount: string
  paymentMethod: ApiPaymentMethod
  installments: number
  cardBrand: string | null
  status: ApiSaleStatus
  customerName: string | null
  customerPhone: string | null
  createdAt: string
  items: ApiSaleItem[]
  exchanges?: ApiExchange[]
}

export interface ApiExchangeDetailed extends ApiExchange {
  sale: Pick<ApiSale, 'id' | 'total' | 'discount' | 'paymentMethod' | 'status' | 'createdAt'>
  returnedVariant: ApiVariantWithProductBase
  newVariant: ApiVariantWithProductBase | null
}

export interface DashboardMetrics {
  salesTodayTotal: string
  salesTodayCount: number
  averageTicket: string
  exchangesToday: number
}

export interface RecentSale {
  id: string
  time: string
  product: string
  value: string
  payment: string
  paymentIcon: string
}
