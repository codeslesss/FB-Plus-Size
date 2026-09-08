import { useState } from 'react'
import { useNotifications } from '../../context/NotificationsContext'

function TopBar() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current
      if (next) markAllAsRead()
      return next
    })
  }

  return (
    <header className="flex items-center w-full px-gutter py-xs bg-surface-container md:border-b md:border-surface-container-highest z-30 relative">
      <div className="flex items-center gap-sm md:hidden">
        <span className="material-symbols-outlined text-on-surface text-headline-md cursor-pointer">menu</span>
        <span className="text-headline-md font-headline-md font-bold text-primary">FB Plus Size</span>
      </div>

      <div className="flex items-center ml-auto text-primary">
        <div className="relative">
          <button
            type="button"
            onClick={toggleOpen}
            aria-label="Notificações"
            className="relative material-symbols-outlined hover:bg-surface-bright transition-colors cursor-pointer active:scale-95 p-2 rounded-full"
          >
            notifications
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-container ring-2 ring-surface-container" />
              </span>
            )}
          </button>

          {open && (
            <>
              <button
                type="button"
                aria-label="Fechar notificações"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 top-full mt-sm w-80 max-w-[calc(100vw-2rem)] bg-surface-container-high rounded-xl border border-outline-variant shadow-lg z-50 overflow-hidden">
                <div className="px-md py-sm border-b border-outline-variant">
                  <h3 className="text-label-lg font-label-lg text-on-surface font-bold">Notificações</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-body-md font-body-md text-on-surface-variant p-md text-center">
                      Nenhuma notificação por aqui.
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-sm px-md py-sm border-b border-outline-variant last:border-b-0 hover:bg-surface-bright/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-tertiary">{item.icon}</span>
                        <div>
                          <p className="text-label-md font-label-md text-on-surface font-bold">{item.title}</p>
                          <p className="text-body-md font-body-md text-on-surface-variant">{item.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
