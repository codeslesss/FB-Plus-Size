import { useState } from 'react'
import { useNotifications } from '../context/NotificationsContext'
import ProductSearch from '../components/pdv/ProductSearch'
import CartItemRow from '../components/pdv/CartItemRow'
import CheckoutSummary from '../components/pdv/CheckoutSummary'
import type { CartItem, PaymentMethod, Product } from '../types/sale'
import { formatCurrency } from '../utils/currency'

function PDV() {
  const { notify } = useNotifications()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit')
  const [cardBrand, setCardBrand] = useState('Mastercard')
  const [installments, setInstallments] = useState(1)

  const addProduct = (product: Product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const incrementItem = (id: string) => {
    setCartItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    )
  }

  const decrementItem = (id: string) => {
    setCartItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id))
  }

  const clearSale = () => {
    setCartItems([])
    setDiscount(0)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const finalizeSale = () => {
    if (cartItems.length === 0) return
    const total = Math.max(subtotal - discount, 0)
    notify({
      title: 'Venda Finalizada',
      message: `Venda de ${formatCurrency(total)} concluída com sucesso.`,
      icon: 'receipt_long',
      variant: 'info',
    })
    clearSale()
    setInstallments(1)
  }

  return (
    <div className="flex flex-col md:flex-row gap-gutter h-full min-h-0">
      <section className="flex-1 flex flex-col bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden relative min-h-0">
        <ProductSearch onSelect={addProduct} />

        <div className="flex-1 min-h-0 overflow-y-auto bg-surface">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-xl text-center">
              <span className="material-symbols-outlined text-[64px] text-surface-container-highest mb-md">
                shopping_bag
              </span>
              <p className="text-headline-sm font-headline-sm text-on-surface-variant mb-xs">
                Nenhum produto adicionado.
              </p>
              <p className="text-body-md font-body-md text-outline">Use a busca acima para começar.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[3fr_1fr_1fr_1fr_40px] gap-sm px-md py-sm bg-surface-container-highest border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider sticky top-0 z-10">
                <div>Produto</div>
                <div className="text-right">Preço</div>
                <div className="text-center">Qtd.</div>
                <div className="text-right">Subtotal</div>
                <div />
              </div>
              <div className="divide-y divide-outline-variant">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onIncrement={incrementItem}
                    onDecrement={decrementItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-sm bg-surface-container-highest border-t border-outline-variant flex justify-between items-center text-label-md font-label-md text-on-surface-variant flex-shrink-0">
          <span>
            {itemCount} {itemCount === 1 ? 'item' : 'itens'} na sacola
          </span>
          <button
            type="button"
            onClick={clearSale}
            disabled={cartItems.length === 0}
            className="text-primary-container hover:opacity-80 transition-colors uppercase font-bold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Limpar Venda
          </button>
        </div>
      </section>

      <CheckoutSummary
        subtotal={subtotal}
        discount={discount}
        onApplyDiscount={setDiscount}
        onRemoveDiscount={() => setDiscount(0)}
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={setPaymentMethod}
        cardBrand={cardBrand}
        onSelectCardBrand={setCardBrand}
        installments={installments}
        onSelectInstallments={setInstallments}
        itemCount={cartItems.length}
        onFinalize={finalizeSale}
      />
    </div>
  )
}

export default PDV
