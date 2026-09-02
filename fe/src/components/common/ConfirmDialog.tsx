import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  submitting?: boolean
  onConfirm: () => void
  onClose: () => void
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  submitting = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-md">
        <p className="text-body-md font-body-md text-on-surface-variant">{message}</p>
        <div className="flex justify-end gap-sm">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 h-11 rounded-lg border border-outline-variant text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={`flex items-center gap-2 px-6 h-11 rounded-lg font-label-lg text-label-lg font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              destructive
                ? 'bg-error text-on-error hover:brightness-110'
                : 'bg-primary-container text-white hover:brightness-110'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {submitting ? 'hourglass_empty' : destructive ? 'delete' : 'check'}
            </span>
            {submitting ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
