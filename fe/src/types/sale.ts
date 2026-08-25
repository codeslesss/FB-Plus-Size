export interface Product {
  id: string
  code: string
  name: string
  size: string
  price: number
  image?: string
}

export interface CartItem extends Product {
  quantity: number
}

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix'
