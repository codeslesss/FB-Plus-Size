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
    <header className="flex justify-between items-center w-full px-gutter py-xs bg-surface-container md:border-b md:border-surface-container-highest z-30 relative">
      <div className="flex items-center gap-sm md:hidden">
        <span className="material-symbols-outlined text-on-surface text-headline-md cursor-pointer">menu</span>
        <span className="text-headline-md font-headline-md font-bold text-primary">FB Plus Size</span>
      </div>

      <div className="hidden md:flex items-center">
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-on-surface text-body-md font-body-md focus:outline-none focus:border-primary-container transition-colors"
            placeholder="Buscar..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md text-primary">
        <div className="relative">
          <button
            type="button"
            onClick={toggleOpen}
            aria-label="Notificações"
            className="relative material-symbols-outlined hover:bg-surface-bright transition-colors cursor-pointer active:scale-95 p-2 rounded-full"
          >
            notifications
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
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

        <span className="material-symbols-outlined hover:bg-surface-bright transition-colors cursor-pointer active:scale-95 p-2 rounded-full">
          calendar_today
        </span>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden cursor-pointer ml-sm">
          <img
            alt="Foto de perfil do gerente"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJinj3F7o9b5RCDO3eFEVu7HB6WGxuWUY0IF6g7gItMqEN3pjDNG79SofPIfaKbmw5SJNTkEJ4TR771alkx021W1tLGS8e42lErTp3K4Sm6H4tpES2g7PThsV5jFUlNsW4r5wIieS7uOn97xifYeFw-9Y10SJXhvOr4p0goDl8jlisEDSdtBu_zLo_Dsbt6jriJHWxzONiCpnWHzuX1WFgsqujz-nLix-qDM9vALnAPa8D4W2Q8tw"
          />
        </div>
      </div>
    </header>
  )
}

export default TopBar
