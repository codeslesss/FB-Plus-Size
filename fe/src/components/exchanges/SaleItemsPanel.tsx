import type { ExchangeAction, ItemDraft, ReplacementProduct, Sale } from '../../types/exchange'
import { formatCurrency } from '../../utils/currency'

const reasons = ['Tamanho errado', 'Defeito de fabricação', 'Não gostou / arrependimento', 'Produto trocado por engano', 'Outro']
const refundMethods = ['Dinheiro', 'Estorno no Cartão', 'Vale-Troca (Crédito na Loja)']

interface SaleItemsPanelProps {
  sale: Sale
  drafts: Record<string, ItemDraft>
  replacementCatalog: ReplacementProduct[]
  onSetAction: (itemId: string, action: ExchangeAction) => void
  onUpdateDraft: (itemId: string, patch: Partial<ItemDraft>) => void
}

function SaleItemsPanel({ sale, drafts, replacementCatalog, onSetAction, onUpdateDraft }: SaleItemsPanelProps) {
  return (
    <div className="flex flex-col gap-sm">
      {sale.items.map((item) => {
        const draft = drafts[item.id] ?? {
          action: null,
          reason: '',
          refundMethod: '',
          replacementCode: '',
          replacementVariantId: '',
        }
        const replacement = replacementCatalog.find((product) => product.code === draft.replacementCode)
        const priceDifference = replacement ? replacement.price - item.price : 0

        return (
          <div key={item.id} className="p-sm rounded-lg border border-outline-variant bg-background">
            <div className="flex items-center justify-between gap-sm mb-sm">
              <div className="min-w-0">
                <p className="text-body-md font-body-md font-semibold text-on-surface truncate">{item.name}</p>
                <p className="text-label-md font-label-md text-on-surface-variant">
                  {item.size} · Cód: {item.code} · {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex gap-xs flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onSetAction(item.id, 'return')}
                  className={`h-9 px-3 rounded-lg border text-label-md font-label-md font-bold flex items-center gap-1 transition-colors ${
                    draft.action === 'return'
                      ? 'border-error text-error bg-error-container/10'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                  Devolver
                </button>
                <button
                  type="button"
                  onClick={() => onSetAction(item.id, 'exchange')}
                  className={`h-9 px-3 rounded-lg border text-label-md font-label-md font-bold flex items-center gap-1 transition-colors ${
                    draft.action === 'exchange'
                      ? 'border-primary-container text-primary-container bg-primary-container/10'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                  Trocar
                </button>
              </div>
            </div>

            {draft.action === 'return' && (
              <div className="bg-surface-container p-sm rounded-lg space-y-sm">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Motivo</label>
                  <div className="relative">
                    <select
                      className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={draft.reason}
                      onChange={(event) => onUpdateDraft(item.id, { reason: event.target.value })}
                    >
                      <option value="">Selecione o motivo</option>
                      {reasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">
                    Forma de Reembolso
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={draft.refundMethod}
                      onChange={(event) => onUpdateDraft(item.id, { refundMethod: event.target.value })}
                    >
                      <option value="">Selecione a forma</option>
                      {refundMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            )}

            {draft.action === 'exchange' && (
              <div className="bg-surface-container p-sm rounded-lg space-y-sm">
                <div className="flex gap-sm">
                  <div className="flex-1">
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">
                      Novo Produto
                    </label>
                    <div className="relative">
                      <select
                        className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        value={draft.replacementCode}
                        onChange={(event) =>
                          onUpdateDraft(item.id, { replacementCode: event.target.value, replacementVariantId: '' })
                        }
                      >
                        <option value="">Selecione o produto</option>
                        {replacementCatalog.map((product) => (
                          <option key={product.code} value={product.code}>
                            {product.name} — {formatCurrency(product.price)}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Tam.</label>
                    <div className="relative">
                      <select
                        className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                        value={draft.replacementVariantId}
                        onChange={(event) => onUpdateDraft(item.id, { replacementVariantId: event.target.value })}
                        disabled={!replacement}
                      >
                        <option value="">—</option>
                        {replacement?.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.size}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
                {replacement && (
                  <div className="pt-sm border-t border-outline-variant flex justify-between items-center text-body-md font-body-md">
                    <span className="text-on-surface-variant">
                      {priceDifference > 0 ? 'Cliente paga a diferença:' : priceDifference < 0 ? 'Diferença a devolver:' : 'Sem diferença de valor'}
                    </span>
                    {priceDifference !== 0 && (
                      <span className={`font-bold ${priceDifference > 0 ? 'text-on-surface' : 'text-error'}`}>
                        {formatCurrency(Math.abs(priceDifference))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SaleItemsPanel
