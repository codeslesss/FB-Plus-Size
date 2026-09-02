import { useState } from 'react'
import type { Sale } from '../../types/exchange'
import { formatCurrency } from '../../utils/currency'
import { shortSaleId } from '../../utils/saleId'

interface SaleSearchProps {
  sales: Sale[]
  selectedSaleId: string | null
  onSelectSale: (sale: Sale) => void
}

function SaleSearch({ sales, selectedSaleId, onSelectSale }: SaleSearchProps) {
  const [term, setTerm] = useState('')

  const trimmedTerm = term.trim().toLowerCase()
  const results = trimmedTerm
    ? sales.filter(
        (sale) =>
          shortSaleId(sale.id).toLowerCase().includes(trimmedTerm) ||
          sale.items.some((item) => item.name.toLowerCase().includes(trimmedTerm) || item.code.includes(trimmedTerm)),
      )
    : sales

  return (
    <div>
      <div className="relative mb-sm">
        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full h-12 bg-background border border-outline-variant rounded-lg pl-xl pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant"
          placeholder="Buscar por nº do pedido ou produto"
          type="text"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-xs max-h-80 overflow-y-auto">
        {results.length === 0 ? (
          <p className="text-body-md font-body-md text-on-surface-variant text-center py-md">
            Nenhuma venda encontrada.
          </p>
        ) : (
          results.map((sale) => {
            const total = sale.items.reduce((sum, item) => sum + item.price, 0)
            const isSelected = sale.id === selectedSaleId
            return (
              <button
                key={sale.id}
                type="button"
                onClick={() => onSelectSale(sale)}
                className={`text-left p-sm rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-primary-container bg-primary-container/10'
                    : 'border-outline-variant bg-background hover:border-primary-container'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-label-lg font-label-lg font-bold text-on-surface">{shortSaleId(sale.id)}</span>
                  <span className="text-label-md font-label-md text-on-surface-variant">{sale.time}</span>
                </div>
                <p className="text-body-md font-body-md text-on-surface-variant truncate">
                  {sale.items.map((item) => item.name).join(', ')}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-label-md font-label-md text-on-surface-variant">{sale.paymentMethod}</span>
                  <span className="text-body-md font-body-md font-bold text-on-surface">{formatCurrency(total)}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SaleSearch
