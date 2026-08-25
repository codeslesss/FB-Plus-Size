import { useNotifications } from '../../context/NotificationsContext'
import Toast from './Toast'

function ToastViewport() {
  const { toasts, dismissToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-md right-md z-50 flex flex-col gap-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} notification={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}

export default ToastViewport
