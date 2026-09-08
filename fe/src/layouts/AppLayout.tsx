import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import ToastViewport from '../components/notifications/ToastViewport'
import { NotificationsProvider } from '../context/NotificationsContext'

function AppLayout() {
  return (
    <NotificationsProvider>
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
