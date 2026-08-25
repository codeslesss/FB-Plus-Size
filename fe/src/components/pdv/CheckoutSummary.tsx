import { useState } from 'react'
import type { PaymentMethod } from '../../types/sale'
import { formatCurrency } from '../../utils/currency'

interface PaymentOption {
  method: PaymentMethod
  label: string
  icon: string
}

const paymentOptions: PaymentOption[] = [
  { method: 'cash', label: 'Dinheiro', icon: 'payments' },
  { method: 'pix', label: 'Pix', icon: 'qr_code_2' },
  { method: 'debit', label: 'Débito', icon: 'credit_card' },
  { method: 'credit', label: 'Crédito', icon: 'credit_card' },
]

const cardBrands = ['Mastercard', 'Visa', 'Elo', 'Amex']
const installmentOptions = [1, 2, 3, 4]

interface CheckoutSummaryProps {
  subtotal: number
  discount: number
  onApplyDiscount: (value: number) => void
  onRemoveDiscount: () => void
  paymentMethod: PaymentMethod
  onSelectPaymentMethod: (method: PaymentMethod) => void
  cardBrand: string
  onSelectCardBrand: (brand: string) => void
  installments: number
  onSelectInstallments: (installments: number) => void
  itemCount: number
  onFinalize: () => void
}

function CheckoutSummary({
  subtotal,
  discount,
  onApplyDiscount,
  onRemoveDiscount,
  paymentMethod,
  onSelectPaymentMethod,
  cardBrand,
  onSelectCardBrand,
  installments,
  onSelectInstallments,
  itemCount,
  onFinalize,
}: CheckoutSummaryProps) {
  const [editingDiscount, setEditingDiscount] = useState(false)
  const [discountDraft, setDiscountDraft] = useState('')
  const [cashReceivedDraft, setCashReceivedDraft] = useState('')

  const total = Math.max(subtotal - discount, 0)
  const installmentValue = total / installments

  const parsedCashReceived = Number(cashReceivedDraft.replace(',', '.'))
  const hasCashReceived = cashReceivedDraft.trim() !== '' && !Number.isNaN(parsedCashReceived)
  const changeDue = hasCashReceived ? parsedCashReceived - total : null
  const cashInsufficient = paymentMethod === 'cash' && (!hasCashReceived || (changeDue ?? 0) < 0)

  const handleFinalize = () => {
    onFinalize()
    setCashReceivedDraft('')
  }

  const startEditingDiscount = () => {
    setDiscountDraft(discount > 0 ? String(discount).replace('.', ',') : '')
    setEditingDiscount(true)
  }

  const confirmDiscount = () => {
    const parsed = Number(discountDraft.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed > 0) {
      onApplyDiscount(Math.min(parsed, subtotal))
    } else {
      onRemoveDiscount()
    }
    setEditingDiscount(false)
  }

  return (
    <section className="w-full md:w-[380px] bg-surface-container-low rounded-xl border border-outline-variant flex flex-col overflow-hidden min-h-0">
      <div className="p-md bg-surface-container border-b border-outline-variant text-center relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent" />
        <p className="text-label-lg font-label-lg text-on-surface-variant uppercase tracking-widest relative z-10 mb-xs">
          Total a Pagar
        </p>
        <h3 className="text-display-lg font-display-lg font-bold text-primary-container relative z-10">
          {formatCurrency(total)}
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-md flex flex-col gap-md">
        <div className="space-y-sm pb-md border-b border-outline-variant">
          <div className="flex justify-between items-center">
            <span className="text-body-md font-body-md text-on-surface-variant">Subtotal</span>
            <span className="text-body-md font-body-md font-semibold text-on-surface">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center gap-sm">
            <span className="text-body-md font-body-md text-on-surface-variant">Desconto</span>
            {editingDiscount ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="w-24 h-8 bg-background border border-outline-variant rounded px-2 text-right text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
                  value={discountDraft}
                  onChange={(event) => setDiscountDraft(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && confirmDiscount()}
                  onBlur={confirmDiscount}
                  placeholder="0,00"
                  inputMode="decimal"
                />
                <button type="button" onClick={confirmDiscount} aria-label="Confirmar desconto" className="text-primary-container hover:opacity-80">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              </div>
            ) : discount > 0 ? (
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  onClick={startEditingDiscount}
                  className="text-body-md font-body-md font-semibold text-error hover:opacity-80"
                >
                  - {formatCurrency(discount)}
                </button>
                <button type="button" onClick={onRemoveDiscount} aria-label="Remover desconto" className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditingDiscount}
                className="text-primary-container text-body-md font-body-md border-b border-dashed border-primary-container pb-0.5 hover:opacity-80"
              >
                Adicionar
              </button>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-label-lg font-label-lg text-on-surface-variant uppercase tracking-wider mb-sm">
            Forma de Pagamento
          </h4>
          <div className="grid grid-cols-2 gap-xs">
            {paymentOptions.map((option) => {
              const isSelected = paymentMethod === option.method
              return (
                <button
                  key={option.method}
                  type="button"
                  onClick={() => onSelectPaymentMethod(option.method)}
                  className={`h-12 rounded-lg border text-label-md font-label-md flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                    isSelected
                      ? 'border-2 border-primary-container bg-primary-container/10 text-primary-container font-bold'
                      : 'border-outline-variant bg-background text-on-surface hover:border-primary-container'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary-container rounded-full border-2 border-surface-container-low" />
                  )}
                  <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {paymentMethod === 'credit' && (
          <div className="bg-surface-container p-md rounded-lg border border-outline-variant space-y-sm">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Bandeira</label>
              <div className="relative">
                <select
                  className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={cardBrand}
                  onChange={(event) => onSelectCardBrand(event.target.value)}
                >
                  {cardBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Parcelas</label>
              <div className="relative">
                <select
                  className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={installments}
                  onChange={(event) => onSelectInstallments(Number(event.target.value))}
                >
                  {installmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}x de {formatCurrency(total / option)} (Sem juros)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>
            <div className="pt-sm mt-sm border-t border-outline-variant flex justify-between items-center text-body-md font-body-md">
              <span className="text-on-surface-variant">Valor da Parcela:</span>
              <span className="font-bold text-on-surface">{formatCurrency(installmentValue)}</span>
            </div>
          </div>
        )}

        {paymentMethod === 'debit' && (
          <div className="bg-surface-container p-md rounded-lg border border-outline-variant">
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Bandeira</label>
            <div className="relative">
              <select
                className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={cardBrand}
                onChange={(event) => onSelectCardBrand(event.target.value)}
              >
                {cardBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="bg-surface-container p-md rounded-lg border border-outline-variant space-y-sm">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Valor Recebido</label>
              <input
                className="w-full h-10 bg-background border border-outline-variant rounded-md px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={cashReceivedDraft}
                onChange={(event) => setCashReceivedDraft(event.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
            <div className="pt-sm mt-sm border-t border-outline-variant flex justify-between items-center text-body-md font-body-md">
              <span className="text-on-surface-variant">Troco:</span>
              <span className="font-bold text-on-surface">{formatCurrency(Math.max(changeDue ?? 0, 0))}</span>
            </div>
            {cashReceivedDraft.trim() !== '' && cashInsufficient && (
              <p className="text-label-md font-label-md text-error">Valor recebido insuficiente.</p>
            )}
          </div>
        )}

        {paymentMethod === 'pix' && (
          <div className="bg-surface-container p-md rounded-lg border border-outline-variant flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary-container">qr_code_2</span>
            <p className="text-body-md font-body-md text-on-surface-variant">
              O QR Code para pagamento será exibido ao finalizar a venda.
            </p>
          </div>
        )}
      </div>

      <div className="p-md bg-surface-container border-t border-outline-variant flex-shrink-0">
        <button
          type="button"
          onClick={handleFinalize}
          disabled={itemCount === 0 || cashInsufficient}
          className="w-full bg-primary-container text-on-primary-container h-touch-target rounded-lg flex items-center justify-center gap-xs text-headline-sm font-headline-sm font-bold hover:opacity-90 transition-colors active:scale-95 shadow-[0_0_20px_rgba(255,87,34,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span className="material-symbols-outlined">receipt_long</span>
          Finalizar Venda
        </button>
      </div>
    </section>
  )
}

export default CheckoutSummary
