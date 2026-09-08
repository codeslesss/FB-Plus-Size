import { api } from './client'
import type { ApiProduct, ApiProductVariant } from './types'

export function fetchProducts(params?: { active?: boolean; category?: string }) {
  const query = new URLSearchParams()
  if (params?.active !== undefined) query.set('active', String(params.active))
  if (params?.category) query.set('category', params.category)
  const qs = query.toString()
  return api.get<ApiProduct[]>(`/products${qs ? `?${qs}` : ''}`)
}

export function fetchProduct(id: string) {
  return api.get<ApiProduct>(`/products/${id}`)
}

export interface CreateProductPayload {
  name: string
  sku: string
  barcode?: string
  brand?: string
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
  barcode?: string
  brand?: string
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

export interface VariantInputPayload {
  size: string
  color: string
  stockQuantity: number
  lowStockThreshold?: number
}

export function createVariant(productId: string, payload: VariantInputPayload) {
  return api.post<ApiProductVariant>(`/products/${productId}/variants`, payload)
}

export interface UpdateVariantPayload {
  size?: string
  color?: string
  lowStockThreshold?: number
}

export function updateVariant(productId: string, variantId: string, payload: UpdateVariantPayload) {
  return api.put<ApiProductVariant>(`/products/${productId}/variants/${variantId}`, payload)
}

export function deleteVariant(productId: string, variantId: string) {
  return api.delete<void>(`/products/${productId}/variants/${variantId}`)
}
