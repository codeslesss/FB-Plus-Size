import type { SaleStatus } from '../../types/saleRecord'
import { PERIOD_OPTIONS, type Period } from '../../utils/period'

const statusOptions: { value: SaleStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'completed', label: 'Concluída' },
  { value: 'exchanged', label: 'Trocada' },
  { value: 'returned', label: 'Devolvida' },
  { value: 'cancelled', label: 'Cancelada' },
]

interface SalesHistoryToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  status: SaleStatus | ''
  onStatusChange: (value: SaleStatus | '') => void
  period: Period
  onPeriodChange: (value: Period) => void
}

function SalesHistoryToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  period,
  onPeriodChange,
}: SalesHistoryToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-md mb-md bg-surface-container-low p-sm rounded-xl border border-outline-variant shadow-sm">
      <div className="relative flex-1 max-w-[28rem]">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full h-12 bg-surface-container text-on-surface border border-outline-variant rounded-lg pl-12 pr-4 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-body-md text-body-md transition-all placeholder:text-on-surface-variant"
          placeholder="Buscar por nº do pedido ou produto..."
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="relative w-full md:w-52">
        <select
          className="w-full h-12 bg-surface-container text-on-surface border border-outline-variant rounded-lg pl-4 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-body-md text-body-md appearance-none"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as SaleStatus | '')}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
          expand_more
        </span>
      </div>

      <div className="relative w-full md:w-52">
        <select
          className="w-full h-12 bg-surface-container text-on-surface border border-outline-variant rounded-lg pl-4 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-body-md text-body-md appearance-none"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value as Period)}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
          expand_more
        </span>
      </div>
    </div>
  )
}

export default SalesHistoryToolbar
