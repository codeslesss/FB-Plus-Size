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

export function fetchSales(params?: { limit?: number; offset?: number; since?: string; until?: string }) {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.since) query.set('since', params.since)
  if (params?.offset !== undefined) query.set('offset', String(params.offset))
  if (params?.until) query.set('until', params.until)
  const qs = query.toString()
  return api.get<ApiSale[]>(`/sales${qs ? `?${qs}` : ''}`)
}

export async function fetchSalesHistory(since?: string) {
  const sales: ApiSale[] = []
  const until = new Date().toISOString()
  const limit = 100
  for (let offset = 0; ; offset += limit) {
    const page = await fetchSales({ limit, offset, since, until })
    sales.push(...page)
    if (page.length < limit) return sales
  }
}

export function fetchSaleById(id: string) {
  return api.get<ApiSale>(`/sales/${id}`)
}

export function createSale(payload: CreateSalePayload) {
  return api.post<ApiSale>('/sales', payload)
}
