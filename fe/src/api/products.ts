import { api } from './client'
import type { ApiProduct } from './types'

export function fetchProducts(params?: { active?: boolean; category?: string }) {
  const query = new URLSearchParams()
  if (params?.active !== undefined) query.set('active', String(params.active))
  if (params?.category) query.set('category', params.category)
  const qs = query.toString()
  return api.get<ApiProduct[]>(`/products${qs ? `?${qs}` : ''}`)
}

export interface CreateProductPayload {
  name: string
  sku: string
  category: string
  price: number
  description?: string
  variants: { size: string; color: string; stockQuantity: number; lowStockThreshold?: number }[]
}

export function createProduct(payload: CreateProductPayload) {
  return api.post<ApiProduct>('/products', payload)
}

export interface UpdateProductPayload {
  name?: string
  sku?: string
  category?: string
  price?: number
  description?: string
  active?: boolean
}

export function updateProduct(id: string, payload: UpdateProductPayload) {
  return api.put<ApiProduct>(`/products/${id}`, payload)
}

export function deleteProduct(id: string) {
  return api.delete<void>(`/products/${id}`)
}
