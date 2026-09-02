import { useState } from 'react'
import { useNotifications } from '../context/NotificationsContext'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import SettingsSection from '../components/settings/SettingsSection'
import ToggleSwitch from '../components/settings/ToggleSwitch'
import { DEFAULT_STORE_PROFILE, SETTINGS_KEYS, type StoreProfile } from '../config/settingsKeys'

function Settings() {
  const { notify } = useNotifications()
  const [savedProfile, setSavedProfile] = useLocalStorageState<StoreProfile>(
    SETTINGS_KEYS.storeProfile,
    DEFAULT_STORE_PROFILE,
  )
  const [profileDraft, setProfileDraft] = useState<StoreProfile>(savedProfile)
  const [lowStockAlerts, setLowStockAlerts] = useLocalStorageState(SETTINGS_KEYS.lowStockAlerts, true)
  const [autoPrintReceipt, setAutoPrintReceipt] = useLocalStorageState(SETTINGS_KEYS.autoPrintReceipt, false)

  const isDirty = JSON.stringify(profileDraft) !== JSON.stringify(savedProfile)

  const saveProfile = () => {
    setSavedProfile(profileDraft)
    notify({
      title: 'Configurações Salvas',
      message: 'Os dados da loja foram atualizados com sucesso.',
      icon: 'check_circle',
      variant: 'info',
    })
  }

  return (
    <div className="flex flex-col gap-md max-w-3xl">
      <header className="mb-xs">
        <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Configurações</h1>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Configurações</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-xs">
          Ajuste os dados da loja e as preferências do sistema.
        </p>
      </header>

      <SettingsSection title="Dados da Loja" description="Usados nos recibos e nas notas fiscais." icon="storefront">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div className="sm:col-span-2">
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Nome Fantasia</label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={profileDraft.name}
              onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">CNPJ</label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="00.000.000/0000-00"
              value={profileDraft.cnpj}
              onChange={(event) => setProfileDraft((current) => ({ ...current, cnpj: event.target.value }))}
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Telefone</label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="(00) 00000-0000"
              value={profileDraft.phone}
              onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Endereço</label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={profileDraft.address}
              onChange={(event) => setProfileDraft((current) => ({ ...current, address: event.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end mt-md">
          <button
            type="button"
            onClick={saveProfile}
            disabled={!isDirty}
            className="flex items-center gap-2 px-6 h-11 rounded-lg bg-primary-container text-white font-label-lg text-label-lg font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Salvar
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Notificações" description="Controle os alertas exibidos no sistema." icon="notifications">
        <ToggleSwitch
          checked={lowStockAlerts}
          onChange={setLowStockAlerts}
          label="Alertas de estoque baixo"
          description="Mostra um aviso ao abrir o sistema quando algum item estiver com poucas unidades."
        />
      </SettingsSection>

      <SettingsSection title="Vendas" description="Preferências usadas no fluxo de Nova Venda." icon="point_of_sale">
        <ToggleSwitch
          checked={autoPrintReceipt}
          onChange={setAutoPrintReceipt}
          label="Impressão automática de recibo"
          description="Envia o recibo para a impressora assim que uma venda é finalizada."
        />
      </SettingsSection>

      <p className="text-label-md font-label-md text-on-surface-variant text-center mt-xs">FB Plus Size POS — v1.0.0</p>
    </div>
  )
}

export default Settings
