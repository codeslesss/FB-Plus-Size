import type { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  description?: string
  icon: string
  children: ReactNode
}

function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-md">
      <div className="flex items-center gap-sm mb-sm">
        <span className="material-symbols-outlined text-primary-container">{icon}</span>
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
          {description && <p className="text-label-md font-label-md text-on-surface-variant">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export default SettingsSection
