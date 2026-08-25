export type NotificationVariant = 'warning' | 'info' | 'error'

export interface AppNotification {
  id: string
  title: string
  message: string
  icon: string
  variant: NotificationVariant
  read: boolean
  createdAt: number
}
