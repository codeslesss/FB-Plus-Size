import type { ApiPaymentMethod, ApiSale } from '../api/types'
import type { PaymentMethod } from '../types/sale'

const TO_API: Record<PaymentMethod, ApiPaymentMethod> = {
  cash: 'DINHEIRO',
  debit: 'DEBITO',
  credit: 'CREDITO',
  pix: 'PIX',
}

const TO_LABEL: Record<ApiPaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  PIX: 'Pix',
}

export function toApiPaymentMethod(method: PaymentMethod): ApiPaymentMethod {
  return TO_API[method]
}

export function paymentMethodLabel(method: ApiPaymentMethod): string {
  return TO_LABEL[method]
}

export function paymentMethodDetailLabel(sale: Pick<ApiSale, 'paymentMethod' | 'installments' | 'cardBrand'>): string {
  const label = paymentMethodLabel(sale.paymentMethod)

  if (sale.paymentMethod === 'CREDITO') {
    const installmentsLabel = sale.installments > 1 ? `Parcelado em ${sale.installments}x` : 'À vista'
    return sale.cardBrand ? `${label} ${sale.cardBrand} — ${installmentsLabel}` : `${label} — ${installmentsLabel}`
  }

  if (sale.paymentMethod === 'DEBITO') {
    return sale.cardBrand ? `${label} ${sale.cardBrand}` : label
  }

  return label
}
