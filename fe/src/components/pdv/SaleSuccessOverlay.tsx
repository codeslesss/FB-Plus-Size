import { useEffect } from 'react'
import { formatCurrency } from '../../utils/currency'

interface SaleSuccessOverlayProps {
  total: number
  customerName?: string
  onClose: () => void
}

const AUTO_CLOSE_MS = 2600

function SaleSuccessOverlay({ total, customerName, onClose }: SaleSuccessOverlayProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, AUTO_CLOSE_MS)
    return () => window.clearTimeout(timeout)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md animate-[success-fade-in_0.2s_ease-out]"
      role="status"
      aria-live="polite"
    >
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="relative bg-surface-container-low rounded-xl shadow-2xl p-xl flex flex-col items-center text-center gap-sm w-full max-w-[22rem] animate-[success-pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--color-primary-container)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="214"
            strokeDashoffset="214"
            className="animate-[success-circle-draw_0.5s_ease-out_0.1s_forwards]"
          />
          <path
            d="M24,42 L36,54 L58,28"
            fill="none"
            stroke="var(--color-primary-container)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="52"
            strokeDashoffset="52"
            className="animate-[success-check-draw_0.3s_ease-out_0.55s_forwards]"
          />
        </svg>

        <h3 className="text-headline-md font-headline-md font-bold text-on-surface">Venda Finalizada!</h3>
        <p className="text-display-lg font-display-lg font-bold text-primary-container">
          {formatCurrency(total)}
        </p>
        {customerName && (
          <p className="text-body-md font-body-md text-on-surface-variant">Cliente: {customerName}</p>
        )}
      </div>
    </div>
  )
}

export default SaleSuccessOverlay
