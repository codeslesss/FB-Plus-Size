interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-md py-sm">
      <div className="min-w-0">
        <p className="text-body-md font-body-md text-on-surface font-semibold">{label}</p>
        {description && <p className="text-label-md font-label-md text-on-surface-variant mt-1">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors ${
          checked ? 'bg-primary-container' : 'bg-surface-container-highest'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default ToggleSwitch
