export interface CatalogProduct {
  id: string
  code: string
  barcode: string | null
  brand: string | null
  name: string
  category: string
  price: number
  costPrice: number | null
  taxRate: number | null
  description: string | null
  stock: number
}
