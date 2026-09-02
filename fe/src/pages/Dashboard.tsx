import { Link } from 'react-router-dom'
import MetricCard from '../components/dashboard/MetricCard'
import RecentSalesTable from '../components/dashboard/RecentSalesTable'
import AsyncState from '../components/common/AsyncState'
import { fetchDashboardMetrics, fetchRecentSales } from '../api/dashboard'
import { useApi } from '../hooks/useApi'
import { formatCurrency } from '../utils/currency'

function Dashboard() {
  const metrics = useApi(() => fetchDashboardMetrics(), [])
  const recentSales = useApi(() => fetchRecentSales(5), [])

  const loading = metrics.loading || recentSales.loading
  const error = metrics.error ?? recentSales.error

  const metricCards = metrics.data
    ? [
        { label: 'Vendas de Hoje', value: formatCurrency(Number(metrics.data.salesTodayTotal)), emphasize: true },
        { label: 'Nº de Vendas', value: String(metrics.data.salesTodayCount) },
        { label: 'Ticket Médio', value: formatCurrency(Number(metrics.data.averageTicket)) },
        { label: 'Trocas do Dia', value: String(metrics.data.exchangesToday) },
      ]
    : []

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-sm">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Dashboard</h1>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Dashboard</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-xs">Visão geral de vendas e operações.</p>
        </div>
        <Link
          to="/pdv"
          className="md:hidden w-full bg-primary-container text-white rounded-lg h-touch-target flex items-center justify-center font-label-lg text-label-lg font-bold hover:bg-opacity-90 active:scale-95 transition-all"
        >
          + Nova Venda
        </Link>
      </div>

      {error ? (
        <AsyncState
          error={error}
          onRetry={() => {
            metrics.reload()
            recentSales.reload()
          }}
        />
      ) : loading ? (
        <p className="text-body-md font-body-md text-on-surface-variant">Carregando dados...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-sm">
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <RecentSalesTable sales={recentSales.data ?? []} />
        </div>
      )}
    </>
  )
}

export default Dashboard
