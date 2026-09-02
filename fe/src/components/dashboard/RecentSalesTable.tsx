import { useState } from 'react'
import type { RecentSale } from '../../api/types'
import SaleDetailsModal from './SaleDetailsModal'

interface RecentSalesTableProps {
  sales: RecentSale[]
}

function RecentSalesTable({ sales }: RecentSalesTableProps) {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)

  return (
    <div className="md:col-span-12 bg-surface-container-high rounded-xl p-md border border-outline-variant mt-sm overflow-x-auto">
      <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Últimas Vendas</h3>
      {sales.length === 0 ? (
        <p className="text-body-md font-body-md text-on-surface-variant text-center py-md">
          Nenhuma venda registrada ainda.
        </p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
              <th className="pb-sm font-medium pl-2">Hora</th>
              <th className="pb-sm font-medium">Produto</th>
              <th className="pb-sm font-medium">Valor</th>
              <th className="pb-sm font-medium pr-2">Forma de Pagamento</th>
            </tr>
          </thead>
          <tbody className="text-body-md font-body-md text-on-surface">
            {sales.map((sale, index) => (
              <tr
                key={sale.id}
                onClick={() => setSelectedSaleId(sale.id)}
                className={`hover:bg-surface-bright/50 transition-colors cursor-pointer ${
                  index < sales.length - 1 ? 'border-b border-outline-variant' : ''
                }`}
              >
                <td className="py-sm pl-2">
                  {new Date(sale.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-sm">{sale.product}</td>
                <td className="py-sm font-bold">
                  {Number(sale.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="py-sm pr-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container text-label-md font-label-md">
                    <span className="material-symbols-outlined text-[16px]">{sale.paymentIcon}</span>
                    {sale.payment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedSaleId && (
        <SaleDetailsModal saleId={selectedSaleId} onClose={() => setSelectedSaleId(null)} />
      )}
    </div>
  )
}

export default RecentSalesTable
