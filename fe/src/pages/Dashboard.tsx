import { Link } from 'react-router-dom'
import MetricCard from '../components/dashboard/MetricCard'
import QuickActions from '../components/dashboard/QuickActions'
import RecentSalesTable from '../components/dashboard/RecentSalesTable'

const metrics = [
  { label: 'Vendas de Hoje', value: 'R$ 1.250,00', emphasize: true },
  { label: 'Nº de Vendas', value: '12' },
  { label: 'Ticket Médio', value: 'R$ 104,16' },
  { label: 'Trocas do Dia', value: '1' },
]

function Dashboard() {
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
        <div className="md:col-span-8 grid grid-cols-2 gap-sm">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="md:col-span-4 flex flex-col gap-sm">
          <QuickActions />
        </div>

        <RecentSalesTable />
      </div>
    </>
  )
}

export default Dashboard
