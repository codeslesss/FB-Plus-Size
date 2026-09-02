import { api } from './client'
import type { ApiVariantWithProduct } from './types'

export function fetchInventory(params?: { lowStockOnly?: boolean }) {
  const qs = params?.lowStockOnly ? '?lowStockOnly=true' : ''
  return api.get<ApiVariantWithProduct[]>(`/inventory${qs}`)
}

export function adjustStock(variantId: string, delta: number) {
  return api.patch<ApiVariantWithProduct>(`/inventory/${variantId}/stock`, { delta })
}
