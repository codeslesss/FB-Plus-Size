interface QuickAction {
  label: string
  icon: string
  iconClassName: string
}

const actions: QuickAction[] = [
  { label: 'Adicionar Produto', icon: 'add_circle', iconClassName: 'text-primary' },
  { label: 'Contagem de Estoque', icon: 'inventory', iconClassName: 'text-tertiary' },
]

function QuickActions() {
  return (
    <div className="bg-surface-container-high/80 backdrop-blur-md rounded-xl p-md border border-outline-variant flex-1">
      <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-sm">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="bg-surface-container-low hover:bg-surface-bright border border-outline-variant rounded-lg py-sm flex flex-col items-center justify-center gap-xs transition-colors"
          >
            <span className={`material-symbols-outlined ${action.iconClassName}`}>{action.icon}</span>
            <span className="text-label-md font-label-md text-on-surface">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
