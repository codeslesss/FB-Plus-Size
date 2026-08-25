interface MetricCardProps {
  label: string
  value: string
  emphasize?: boolean
}

function MetricCard({ label, value, emphasize = false }: MetricCardProps) {
  return (
    <div className="bg-surface-container-high rounded-xl p-md border border-transparent hover:border-outline-variant transition-colors flex flex-col justify-center">
      <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-xs">
        {label}
      </span>
      <span
        className={
          emphasize
            ? 'text-display-lg font-display-lg text-primary-container'
            : 'text-headline-lg font-headline-lg text-on-surface'
        }
      >
        {value}
      </span>
    </div>
  )
}

export default MetricCard
