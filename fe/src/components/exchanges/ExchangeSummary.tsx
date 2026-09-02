import type { ItemDraft, ReplacementProduct, Sale } from '../../types/exchange'
import { buildSummaryLines } from '../../utils/exchangeSummary'
import { formatCurrency } from '../../utils/currency'

interface ExchangeSummaryProps {
  sale: Sale | null
  drafts: Record<string, ItemDraft>
  replacementCatalog: ReplacementProduct[]
  onFinalize: () => void
  submitting?: boolean
}

function ExchangeSummary({ sale, drafts, replacementCatalog, onFinalize, submitting = false }: ExchangeSummaryProps) {
  const lines = buildSummaryLines(sale, drafts, replacementCatalog)

  const allReady = lines.length > 0 && lines.every((line) => line.ready)
  const total = lines.reduce((sum, line) => sum + line.value, 0)

  const totalLabel = total < 0 ? 'Valor a devolver ao cliente' : total > 0 ? 'Cliente paga a diferença' : 'Sem diferença de valor'

  return (
    <section className="w-full md:w-[360px] bg-surface-container-low rounded-xl border border-outline-variant flex flex-col overflow-hidden flex-shrink-0">
      <div className="p-md bg-surface-container border-b border-outline-variant">
        <h3 className="text-label-lg font-label-lg text-on-surface-variant uppercase tracking-wider mb-xs">
          Resumo
        </h3>
        {!sale ? (
          <p className="text-body-md font-body-md text-on-surface-variant">Selecione uma venda para começar.</p>
        ) : lines.length === 0 ? (
          <p className="text-body-md font-body-md text-on-surface-variant">
            Marque um item como Devolver ou Trocar para ver o resumo aqui.
          </p>
        ) : (
          <>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1">{totalLabel}</p>
            <h3 className={`text-headline-lg font-headline-lg font-bold ${total < 0 ? 'text-error' : 'text-primary-container'}`}>
              {formatCurrency(Math.abs(total))}
            </h3>
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">
          {lines.map((line) => (
            <div key={line.itemId} className="flex justify-between items-start gap-sm text-body-md font-body-md">
              <div className="min-w-0">
                <p className="text-on-surface font-semibold truncate">{line.itemName}</p>
                <p className={`text-label-md font-label-md ${line.ready ? 'text-on-surface-variant' : 'text-error'}`}>
                  {line.detail}
                </p>
              </div>
              {line.ready && (
                <span className={`font-bold flex-shrink-0 ${line.value < 0 ? 'text-error' : 'text-on-surface'}`}>
                  {line.value === 0 ? formatCurrency(0) : formatCurrency(Math.abs(line.value))}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-md bg-surface-container border-t border-outline-variant">
        <button
          type="button"
          onClick={onFinalize}
          disabled={!allReady || submitting}
          className="w-full bg-primary-container text-white h-touch-target rounded-lg flex items-center justify-center gap-xs text-headline-sm font-headline-sm font-bold hover:opacity-90 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">{submitting ? 'hourglass_empty' : 'task_alt'}</span>
          {submitting ? 'Enviando...' : 'Finalizar'}
        </button>
      </div>
    </section>
  )
}

export default ExchangeSummary
