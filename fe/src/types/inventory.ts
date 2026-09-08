export const LOW_STOCK_THRESHOLD = 3

export interface StockVariant {
  id: string
  productId: string
  code: string
  barcode: string | null
  brand: string | null
  name: string
  category: string
  size: string
  color: string
  price: number
  description: string | null
  stock: number
}
