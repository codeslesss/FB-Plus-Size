import { useEffect, useState } from 'react'
import type { AppNotification, NotificationVariant } from '../../types/notification'

interface ToastProps {
  notification: AppNotification
  onDismiss: (id: string) => void
}

const variantStyles: Record<NotificationVariant, { border: string; iconBg: string; iconText: string; titleText: string }> = {
  warning: {
    border: 'border-tertiary',
    iconBg: 'bg-tertiary/20',
    iconText: 'text-tertiary',
    titleText: 'text-tertiary',
  },
  error: {
    border: 'border-error-container',
    iconBg: 'bg-error-container/20',
    iconText: 'text-error-container',
    titleText: 'text-error',
  },
  info: {
    border: 'border-secondary-container',
    iconBg: 'bg-secondary-container/20',
    iconText: 'text-secondary',
    titleText: 'text-secondary',
  },
}

function Toast({ notification, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const styles = variantStyles[notification.variant]

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`w-80 max-w-[calc(100vw-2rem)] bg-surface-container-high rounded-xl p-md border-l-4 ${styles.border} shadow-lg flex items-start gap-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className={`${styles.iconBg} p-2 rounded-lg ${styles.iconText}`}>
        <span className="material-symbols-outlined">{notification.icon}</span>
      </div>
      <div className="flex-1">
        <h3 className={`text-label-lg font-label-lg font-bold mb-1 ${styles.titleText}`}>{notification.title}</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">{notification.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="Dispensar notificação"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}

export default Toast
