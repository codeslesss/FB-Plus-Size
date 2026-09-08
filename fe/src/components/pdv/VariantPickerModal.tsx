import { useState } from 'react'
import Modal from '../common/Modal'
import type { CartLineInput, CatalogEntry } from '../../types/sale'
import { formatCurrency } from '../../utils/currency'

interface VariantPickerModalProps {
  entry: CatalogEntry
  cartQuantities: Record<string, number>
  onClose: () => void
  onConfirm: (input: CartLineInput, quantity: number) => void
}

function VariantPickerModal({ entry, cartQuantities, onClose, onConfirm }: VariantPickerModalProps) {
  const availableVariants = entry.variants.filter((v) => v.stock > 0)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(availableVariants[0]?.variantId ?? null)
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = availableVariants.find((v) => v.variantId === selectedVariantId) ?? null
  const alreadyInCart = selectedVariant ? (cartQuantities[selectedVariant.variantId] ?? 0) : 0
  const maxAddable = selectedVariant ? Math.max(selectedVariant.stock - alreadyInCart, 0) : 0

  const selectVariant = (variantId: string) => {
    setSelectedVariantId(variantId)
    setQuantity(1)
  }

  const handleConfirm = () => {
    if (!selectedVariant || maxAddable === 0) return
    const finalQuantity = Math.min(Math.max(quantity, 1), maxAddable)
    onConfirm(
      {
        id: selectedVariant.variantId,
        productId: entry.productId,
        code: entry.code,
        name: entry.name,
        color: selectedVariant.color,
        size: selectedVariant.size,
        price: entry.price,
        stock: selectedVariant.stock,
      },
      finalQuantity,
    )
  }

  return (
    <Modal
      title={entry.name}
      subtitle={`Cód: ${entry.code}${entry.brand ? ` · ${entry.brand}` : ''} · ${formatCurrency(entry.price)}`}
      onClose={onClose}
      maxWidthClassName="max-w-md"
    >
      <div className="flex flex-col gap-md">
        {availableVariants.length === 0 ? (
          <p className="text-body-md font-body-md text-on-surface-variant text-center py-md">
            Nenhuma variação com estoque disponível no momento.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
                Escolha tamanho e cor
              </label>
              <div className="grid grid-cols-2 gap-xs max-h-56 overflow-y-auto pr-1">
                {availableVariants.map((variant) => {
                  const inCart = cartQuantities[variant.variantId] ?? 0
                  const remaining = variant.stock - inCart
                  const isSelected = variant.variantId === selectedVariantId
                  return (
                    <button
                      key={variant.variantId}
                      type="button"
                      onClick={() => selectVariant(variant.variantId)}
                      disabled={remaining <= 0}
                      className={`flex flex-col items-start p-sm rounded-lg border text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-2 border-primary-container bg-primary-container/10'
                          : 'border-outline-variant bg-background hover:border-primary-container'
                      }`}
                    >
                      <span className="text-body-md font-body-md font-semibold text-on-surface">
                        {variant.size} · {variant.color}
                      </span>
                      <span className="text-label-md font-label-md text-on-surface-variant">
                        {remaining > 0 ? `${remaining} un. disponíveis` : 'Sem estoque disponível'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedVariant && (
              <div className="flex items-center justify-between p-sm bg-surface-container rounded-lg border border-outline-variant">
                <span className="text-body-md font-body-md text-on-surface-variant">Quantidade</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuir quantidade"
                    className="w-8 h-8 rounded-full bg-background border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-10 text-center text-body-lg font-body-lg font-bold text-on-surface">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
                    disabled={quantity >= maxAddable}
                    aria-label="Aumentar quantidade"
                    className="w-8 h-8 rounded-full bg-background border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedVariant || maxAddable === 0}
              className="flex items-center justify-center gap-2 w-full h-touch-target rounded-lg bg-primary-container text-white font-label-lg text-label-lg font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Adicionar ao Carrinho
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default VariantPickerModal
