export const SETTINGS_KEYS = {
  lowStockAlerts: 'fbps:settings:lowStockAlerts',
  autoPrintReceipt: 'fbps:settings:autoPrintReceipt',
  storeProfile: 'fbps:settings:storeProfile',
} as const

export interface StoreProfile {
  name: string
  cnpj: string
  address: string
  phone: string
}

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'FB Plus Size',
  cnpj: '',
  address: '',
  phone: '',
}
