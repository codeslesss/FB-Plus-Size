type BadgeTone = 'neutral' | 'brand' | 'warning' | 'danger' | 'muted'

interface StatusBadgeProps {
  label: string
  icon?: string
  tone: BadgeTone
  strikethrough?: boolean
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-container-highest text-on-surface-variant',
  brand: 'bg-primary-container/10 text-primary-container',
  warning: 'bg-tertiary/15 text-tertiary',
  danger: 'bg-error-container/10 text-error',
  muted: 'bg-outline-variant/20 text-on-surface-variant',
}

function StatusBadge({ label, icon, tone, strikethrough = false }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-md font-label-md font-bold ${toneClasses[tone]} ${strikethrough ? 'line-through' : ''}`}
    >
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {label}
    </span>
  )
}

export default StatusBadge
