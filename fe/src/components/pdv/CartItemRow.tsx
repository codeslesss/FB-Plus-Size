import type { CartItem } from '../../types/sale'
import { formatCurrency } from '../../utils/currency'

interface CartItemRowProps {
  item: CartItem
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
}

function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  return (
    <div className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] items-center gap-sm p-md hover:bg-surface-container transition-colors group">
      <div className="flex items-center gap-sm min-w-0">
        <div className="w-12 h-12 bg-surface-container-highest rounded border border-outline-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
          {item.image ? (
            <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant">apparel</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-body-md font-body-md font-semibold text-on-surface truncate">{item.name}</p>
          <div className="flex gap-xs mt-1 items-center">
            <span className="px-2 py-0.5 bg-surface-container-highest rounded-full text-[10px] font-label-md text-on-surface-variant">
              {item.size}
            </span>
            <span className="text-[10px] font-label-md text-on-surface-variant">Cód: {item.code}</span>
          </div>
        </div>
      </div>

      <div className="text-right text-body-md font-body-md text-on-surface-variant">{formatCurrency(item.price)}</div>

      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onDecrement(item.id)}
          aria-label={`Diminuir quantidade de ${item.name}`}
          className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>
        <span className="w-8 text-center text-body-md font-body-md font-bold text-on-surface">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onIncrement(item.id)}
          aria-label={`Aumentar quantidade de ${item.name}`}
          className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
      </div>

      <div className="text-right text-body-md font-body-md font-bold text-on-surface">
        {formatCurrency(item.price * item.quantity)}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remover ${item.name}`}
          className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  )
}

export default CartItemRow
