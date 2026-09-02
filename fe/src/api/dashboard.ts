import { api } from './client'
import type { DashboardMetrics, RecentSale } from './types'

export function fetchDashboardMetrics() {
  return api.get<DashboardMetrics>('/dashboard/metrics')
}

export function fetchRecentSales(limit = 5) {
  return api.get<RecentSale[]>(`/dashboard/recent-sales?limit=${limit}`)
}
