import { api } from './client'
import type { ApiPaymentMethod, ApiSale } from './types'

export interface CreateSalePayload {
  paymentMethod: ApiPaymentMethod
  discount?: number
  customerName: string
  customerPhone?: string
  installments?: number
  cardBrand?: string
  items: { productVariantId: string; quantity: number }[]
}

export function fetchSales(params?: { limit?: number; since?: string }) {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.since) query.set('since', params.since)
  const qs = query.toString()
  return api.get<ApiSale[]>(`/sales${qs ? `?${qs}` : ''}`)
}

export function fetchSaleById(id: string) {
  return api.get<ApiSale>(`/sales/${id}`)
}

export function createSale(payload: CreateSalePayload) {
  return api.post<ApiSale>('/sales', payload)
}
