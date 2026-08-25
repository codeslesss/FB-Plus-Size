import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { AppNotification, NotificationVariant } from '../types/notification'

const TOAST_DURATION_MS = 6000

interface NewNotificationInput {
  title: string
  message: string
  icon: string
  variant?: NotificationVariant
}

interface NotificationsContextValue {
  toasts: AppNotification[]
  notifications: AppNotification[]
  unreadCount: number
  notify: (input: NewNotificationInput) => void
  dismissToast: (id: string) => void
  markAllAsRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AppNotification[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const notify = useCallback(({ title, message, icon, variant = 'info' }: NewNotificationInput) => {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      icon,
      variant,
      read: false,
      createdAt: Date.now(),
    }

    setToasts((current) => [...current, notification])

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== notification.id))
      setNotifications((current) => [notification, ...current])
    }, TOAST_DURATION_MS)
  }, [])

  const dismissToast = (id: string) => {
    const toast = toasts.find((item) => item.id === id)
    setToasts((current) => current.filter((item) => item.id !== id))
    if (toast) {
      setNotifications((current) => [toast, ...current])
    }
  }

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [])

  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <NotificationsContext.Provider
      value={{ toasts, notifications, unreadCount, notify, dismissToast, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationsProvider')
  }
  return context
}
