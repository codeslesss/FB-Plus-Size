export const LOW_STOCK_THRESHOLD = 3

export interface StockVariant {
  id: string
  productId: string
  code: string
  name: string
  category: string
  size: string
  color: string
  price: number
  description: string | null
  stock: number
}
