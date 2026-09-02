export type SaleStatus = 'completed' | 'exchanged' | 'returned' | 'cancelled'

export interface SaleRecordItem {
  name: string
  size: string
  price: number
  quantity: number
}

export interface SaleRecord {
  id: string
  date: Date
  paymentMethod: string
  status: SaleStatus
  items: SaleRecordItem[]
}
