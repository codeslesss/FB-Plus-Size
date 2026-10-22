import { formatCurrency } from '../../utils/currency'
import { computePricing, formatPercent, parseDecimalDraft } from '../../utils/margin'

export interface PricingDrafts {
  price: string
  costPrice: string
  taxRate: string
}

interface PricingFieldsProps {
  drafts: PricingDrafts
  onChange: (patch: Partial<PricingDrafts>) => void
  labelClassName: string
}

const inputClassName =
  'w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'

export function parsePricingDrafts(drafts: PricingDrafts):
  | { ok: true; price: number; costPrice: number | null; taxRate: number | null }
  | { ok: false; error: string } {
  const price = parseDecimalDraft(drafts.price)
  const costPrice = parseDecimalDraft(drafts.costPrice)
  const taxRate = parseDecimalDraft(drafts.taxRate)

  if (price === null || Number.isNaN(price) || price <= 0) {
    return { ok: false, error: 'Informe um preço de venda válido (ex: 89,90).' }
  }
  if (costPrice !== null && (Number.isNaN(costPrice) || costPrice < 0)) {
    return { ok: false, error: 'Informe um preço de custo válido (ex: 45,00).' }
  }
  if (taxRate !== null && (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100)) {
    return { ok: false, error: 'O imposto precisa ser um percentual entre 0 e 100.' }
  }
  return { ok: true, price, costPrice, taxRate }
}

function PricingFields({ drafts, onChange, labelClassName }: PricingFieldsProps) {
  const parsed = parsePricingDrafts(drafts)
  const breakdown = parsed.ok ? computePricing(parsed) : null

  return (
    <div className="flex flex-col gap-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
        <div>
          <label className={labelClassName}>Preço de custo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-lg font-label-lg font-medium text-on-surface-variant pointer-events-none">
              R$
            </span>
            <input
              className={inputClassName}
              value={drafts.costPrice}
              onChange={(event) => onChange({ costPrice: event.target.value })}
              placeholder="0,00"
              inputMode="decimal"
            />
          </div>
        </div>
        <div>
          <label className={labelClassName}>Preço de venda</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-lg font-label-lg font-medium text-on-surface-variant pointer-events-none">
              R$
            </span>
            <input
              className={inputClassName}
              value={drafts.price}
              onChange={(event) => onChange({ price: event.target.value })}
              placeholder="0,00"
              inputMode="decimal"
            />
          </div>
        </div>
        <div>
          <label className={labelClassName}>Imposto sobre a venda</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-lg font-label-lg font-medium text-on-surface-variant pointer-events-none">
              %
            </span>
            <input
              className={inputClassName}
              value={drafts.taxRate}
              onChange={(event) => onChange({ taxRate: event.target.value })}
              placeholder="Ex: 6"
              inputMode="decimal"
            />
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-sm rounded-lg bg-surface-container border border-outline-variant p-sm"
        aria-live="polite"
      >
        {breakdown ? (
          <>
            <PricingStat label="Imposto" value={formatCurrency(breakdown.taxValue)} />
            <PricingStat
              label="Lucro por peça"
              value={formatCurrency(breakdown.profit)}
              negative={breakdown.profit < 0}
            />
            <PricingStat
              label="Margem"
              value={formatPercent(breakdown.marginPercent)}
              negative={breakdown.marginPercent < 0}
              highlight
            />
            <PricingStat
              label="Markup"
              value={breakdown.markup === null ? '—' : `${breakdown.markup.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x`}
            />
          </>
        ) : (
          <p className="col-span-full text-label-md font-label-md text-on-surface-variant">
            Preencha custo e venda para ver a margem deste produto.
          </p>
        )}
      </div>
    </div>
  )
}

function PricingStat({
  label,
  value,
  negative = false,
  highlight = false,
}: {
  label: string
  value: string
  negative?: boolean
  highlight?: boolean
}) {
  const valueClassName = negative ? 'text-error' : highlight ? 'text-primary' : 'text-on-surface'
  return (
    <div className="flex flex-col">
      <span className="text-label-md font-label-md text-on-surface-variant uppercase">{label}</span>
      <span className={`text-body-lg font-body-lg font-semibold ${valueClassName}`}>{value}</span>
    </div>
  )
}

export default PricingFields
