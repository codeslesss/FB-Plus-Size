export interface ProductVariantOption {
  variantId: string
  size: string
  color: string
  stock: number
  lowStock: boolean
}

export interface CatalogEntry {
  productId: string
  code: string
  barcode: string | null
  brand: string | null
  name: string
  category: string
  price: number
  image?: string
  totalStock: number
  lowStock: boolean
  variants: ProductVariantOption[]
}

export interface CartLineInput {
  id: string
  productId: string
  code: string
  name: string
  color: string
  size: string
  price: number
  stock: number
  image?: string
}

export interface CartItem extends CartLineInput {
  quantity: number
}

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix'
