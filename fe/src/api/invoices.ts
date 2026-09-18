import { api } from './client'
export interface PurchaseItem {
  itemNumber: number; supplierCode: string; name: string; ncm?: string
  quantity: number; unitCost: number; subtotal: number
}
export interface PurchaseDraft {
  accessKey?: string; supplierCnpj: string; supplierName: string; recipientCnpj: string
  number: string; series: string; issuedAt: string; total: number; items: PurchaseItem[]
}
export interface PurchaseSummary extends PurchaseDraft { id: string; source: string; createdAt: string }
export interface Mapping { itemNumber: number; productVariantId: string; stockQuantity: number }
export interface FiscalDocument {
  id: string; saleId: string; status: 'PENDING_CONFIGURATION'; message: string; createdAt: string
  snapshot?: unknown; sale?: { total: number; customerName: string | null; createdAt: string }
}
export const fetchPurchases = () => api.get<PurchaseSummary[]>('/purchases')
export const previewPurchase = (xml: string) => api.post<PurchaseDraft>('/purchases/preview', { xml })
export const registerPurchase = (invoice: PurchaseDraft, mappings: Mapping[], xml?: string) =>
  api.post<PurchaseSummary>('/purchases', { invoice, mappings, xml })
export const fetchFiscalDocuments = () => api.get<FiscalDocument[]>('/fiscal/documents')
export const fetchFiscalDocument = (id: string) => api.get<FiscalDocument>(`/fiscal/documents/${id}`)
export const fetchFiscalSettings = () => api.get<{ cnpj: string; message: string }>('/fiscal/settings')
