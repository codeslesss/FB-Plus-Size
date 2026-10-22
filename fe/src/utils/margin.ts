export interface PricingInput {
  price: number
  costPrice: number | null
  taxRate: number | null
}

export interface PricingBreakdown {
  taxValue: number
  profit: number
  marginPercent: number
  markup: number | null
}

/** Tax is a percentage of the sale price; margin is the net profit over the sale price. */
export function computePricing({ price, costPrice, taxRate }: PricingInput): PricingBreakdown | null {
  if (costPrice === null || !(price > 0)) return null
  const taxValue = price * ((taxRate ?? 0) / 100)
  const profit = price - costPrice - taxValue
  return {
    taxValue,
    profit,
    marginPercent: (profit / price) * 100,
    markup: costPrice > 0 ? price / costPrice : null,
  }
}

export function averageMargin(products: PricingInput[]): number | null {
  const margins = products
    .map((product) => computePricing(product)?.marginPercent)
    .filter((margin): margin is number => margin !== undefined)
  if (margins.length === 0) return null
  return margins.reduce((sum, margin) => sum + margin, 0) / margins.length
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function parseDecimalDraft(draft: string): number | null {
  const trimmed = draft.trim()
  if (!trimmed) return null
  return Number(trimmed.replace(',', '.'))
}

export function toDecimalDraft(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value).replace('.', ',')
}
