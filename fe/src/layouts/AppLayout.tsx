import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import ToastViewport from '../components/notifications/ToastViewport'
import { NotificationsProvider, useNotifications } from '../context/NotificationsContext'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { SETTINGS_KEYS } from '../config/settingsKeys'

function LowStockSeed() {
  const { notify } = useNotifications()
  const [lowStockAlerts] = useLocalStorageState(SETTINGS_KEYS.lowStockAlerts, true)
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current || !lowStockAlerts) return
    seeded.current = true

    notify({
      title: 'Estoque Baixo',
      message: '"Saia Midi Estampada" está com estoque baixo — restam apenas 3 unidades.',
      icon: 'warning',
      variant: 'warning',
    })
  }, [notify, lowStockAlerts])

  return null
}

function AppLayout() {
  return (
    <NotificationsProvider>
      <LowStockSeed />
      <div className="bg-background text-on-background font-body-md text-body-md h-screen overflow-hidden flex">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-gutter bg-background">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastViewport />
    </NotificationsProvider>
  )
}

export default AppLayout
