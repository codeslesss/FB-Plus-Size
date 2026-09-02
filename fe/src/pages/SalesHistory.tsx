import { useState } from 'react'
import MetricCard from '../components/dashboard/MetricCard'
import SalesHistoryToolbar from '../components/sales-history/SalesHistoryToolbar'
import SalesHistoryTable from '../components/sales-history/SalesHistoryTable'
import AsyncState from '../components/common/AsyncState'
import { fetchSales } from '../api/sales'
import { useApi } from '../hooks/useApi'
import type { SaleStatus } from '../types/saleRecord'
import { formatCurrency } from '../utils/currency'
import { isWithinPeriod, type Period } from '../utils/period'
import { mapApiSaleToRecord } from '../utils/mapApiSale'

function SalesHistory() {
  const { data, loading, error, reload } = useApi(() => fetchSales({ limit: 100 }), [])
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<SaleStatus | ''>('')
  const [period, setPeriod] = useState<Period>('7d')

  const salesHistory = (data ?? []).map(mapApiSaleToRecord)

  const trimmedTerm = searchTerm.trim().toLowerCase()
  const filteredSales = salesHistory
    .filter((sale) => isWithinPeriod(sale.date, period))
    .filter((sale) => !status || sale.status === status)
    .filter(
      (sale) =>
        !trimmedTerm ||
        sale.id.toLowerCase().includes(trimmedTerm) ||
        sale.items.some((item) => item.name.toLowerCase().includes(trimmedTerm)),
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const validSales = filteredSales.filter((sale) => sale.status !== 'cancelled')
  const revenue = filteredSales
    .filter((sale) => sale.status === 'completed' || sale.status === 'exchanged')
    .reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.price, 0), 0)
  const averageTicket = validSales.length > 0 ? revenue / validSales.length : 0
  const exchangesReturns = filteredSales.filter((sale) => sale.status === 'exchanged' || sale.status === 'returned').length

  return (
    <div className="flex flex-col">
      <header className="mb-lg">
        <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Histórico de Vendas</h1>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">
          Histórico de Vendas
        </h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-xs">
          Consulte vendas passadas, filtre por período e veja o detalhe de cada pedido.
        </p>
      </header>

      {error ? (
        <AsyncState error={error} onRetry={reload} />
      ) : loading ? (
        <p className="text-body-md font-body-md text-on-surface-variant">Carregando vendas...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-md">
            <MetricCard label="Vendas no Período" value={String(validSales.length)} />
            <MetricCard label="Faturamento" value={formatCurrency(revenue)} emphasize />
            <MetricCard label="Ticket Médio" value={formatCurrency(averageTicket)} />
            <MetricCard label="Trocas/Devoluções" value={String(exchangesReturns)} />
          </div>

          <SalesHistoryToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            status={status}
            onStatusChange={setStatus}
            period={period}
            onPeriodChange={setPeriod}
          />

          <SalesHistoryTable sales={filteredSales} />
        </>
      )}
    </div>
  )
}

export default SalesHistory
