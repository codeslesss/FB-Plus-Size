import type { HistoryEntry } from '../../types/exchange'
import { formatCurrency } from '../../utils/currency'

interface ExchangeHistoryTableProps {
  entries: HistoryEntry[]
}

function ExchangeHistoryTable({ entries }: ExchangeHistoryTableProps) {
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden mt-md">
      <div className="px-md py-sm border-b border-outline-variant bg-surface-container">
        <h3 className="text-headline-sm font-headline-sm text-on-surface">Histórico de Trocas/Devoluções</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
              <th className="px-md py-sm font-medium">Hora</th>
              <th className="px-md py-sm font-medium">Pedido</th>
              <th className="px-md py-sm font-medium">Produto</th>
              <th className="px-md py-sm font-medium">Tipo</th>
              <th className="px-md py-sm font-medium">Detalhe</th>
              <th className="px-md py-sm font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="text-body-md font-body-md text-on-surface">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-md py-lg text-center text-on-surface-variant">
                  Nenhuma troca ou devolução registrada ainda.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-surface-container transition-colors ${
                    index < entries.length - 1 ? 'border-b border-outline-variant' : ''
                  }`}
                >
                  <td className="px-md py-sm">{entry.createdAt}</td>
                  <td className="px-md py-sm font-mono">{entry.saleId}</td>
                  <td className="px-md py-sm">
                    {entry.itemName} <span className="text-on-surface-variant">({entry.itemSize})</span>
                  </td>
                  <td className="px-md py-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-md font-label-md font-bold ${
                        entry.action === 'return'
                          ? 'bg-error-container/10 text-error'
                          : 'bg-primary-container/10 text-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {entry.action === 'return' ? 'assignment_return' : 'sync_alt'}
                      </span>
                      {entry.action === 'return' ? 'Devolução' : 'Troca'}
                    </span>
                  </td>
                  <td className="px-md py-sm text-on-surface-variant">{entry.detail}</td>
                  <td className="px-md py-sm text-right font-bold">
                    {entry.value === 0 ? formatCurrency(0) : formatCurrency(Math.abs(entry.value))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExchangeHistoryTable
