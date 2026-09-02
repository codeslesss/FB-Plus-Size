import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  maxWidthClassName?: string
}

function Modal({ title, subtitle, onClose, children, maxWidthClassName = 'max-w-[32rem]' }: ModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const raf = requestAnimationFrame(() => setVisible(true))

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      cancelAnimationFrame(raf)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={`absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-sm cursor-default transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`relative w-full ${maxWidthClassName} max-h-[85vh] overflow-y-auto bg-surface-container-low rounded-xl border border-outline-variant shadow-lg transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant sticky top-0 bg-surface-container-low z-10">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
            {subtitle && (
              <p className="text-label-md font-label-md text-on-surface-variant mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-md">{children}</div>
      </div>
    </div>
  )
}

export default Modal
