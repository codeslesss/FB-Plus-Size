import { api } from './client'
import type { ApiExchange, ApiExchangeDetailed } from './types'

export function fetchExchanges(limit = 20) {
  return api.get<ApiExchangeDetailed[]>(`/exchanges?limit=${limit}`)
}

export interface CreateExchangePayload {
  saleId: string
  returnedVariantId: string
  returnedQuantity?: number
  newVariantId?: string
  newQuantity?: number
  reason?: string
  refundMethod?: string
}

export function createExchange(payload: CreateExchangePayload) {
  return api.post<ApiExchange>('/exchanges', payload)
}
