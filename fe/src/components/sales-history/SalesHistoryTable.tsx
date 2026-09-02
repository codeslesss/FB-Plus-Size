import { useState } from 'react'
import type { SaleRecord, SaleStatus } from '../../types/saleRecord'
import StatusBadge from '../common/StatusBadge'
import SaleDetailsModal from '../dashboard/SaleDetailsModal'
import { formatCurrency } from '../../utils/currency'
import { formatRelativeDateTime } from '../../utils/date'
import { paymentIcon } from '../../utils/paymentIcon'
import { shortSaleId } from '../../utils/saleId'

const statusBadge: Record<SaleStatus, { label: string; tone: 'neutral' | 'brand' | 'danger' | 'muted' }> = {
  completed: { label: 'Concluída', tone: 'neutral' },
  exchanged: { label: 'Trocada', tone: 'brand' },
  returned: { label: 'Devolvida', tone: 'danger' },
  cancelled: { label: 'Cancelada', tone: 'muted' },
}

interface SalesHistoryTableProps {
  sales: SaleRecord[]
}

function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container border-b border-outline-variant">
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Pedido
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Data/Hora
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Produtos
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Valor Total
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Pagamento
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Status
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider text-right">
                Detalhes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-body-md font-body-md text-on-surface-variant">
                  Nenhuma venda encontrada.
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const total = sale.items.reduce((sum, item) => sum + item.price, 0)
                const badge = statusBadge[sale.status]
                const isVoided = sale.status === 'cancelled'

                return (
                  <tr
                    key={sale.id}
                    onClick={() => setSelectedSaleId(sale.id)}
                    className="hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface font-mono">{shortSaleId(sale.id)}</td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface-variant">
                      {formatRelativeDateTime(sale.date)}
                    </td>
                    <td className={`px-6 py-4 text-body-md font-body-md text-on-surface truncate max-w-[240px] ${isVoided ? 'line-through text-on-surface-variant' : ''}`}>
                      {sale.items.map((item) => (item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name)).join(', ')}
                    </td>
                    <td className={`px-6 py-4 text-body-md font-body-md font-bold text-on-surface ${isVoided ? 'line-through text-on-surface-variant' : ''}`}>
                      {formatCurrency(total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container text-label-md font-label-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">{paymentIcon(sale.paymentMethod)}</span>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedSaleId(sale.id)
                        }}
                        aria-label="Ver detalhes"
                        className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedSaleId && (
        <SaleDetailsModal saleId={selectedSaleId} onClose={() => setSelectedSaleId(null)} />
      )}
    </div>
  )
}

export default SalesHistoryTable
