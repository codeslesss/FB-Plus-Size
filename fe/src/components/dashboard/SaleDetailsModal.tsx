import { useEffect, useState } from 'react'
import { fetchSaleById } from '../../api/sales'
import { useApi } from '../../hooks/useApi'
import { formatCurrency } from '../../utils/currency'
import { paymentMethodDetailLabel } from '../../utils/paymentMethod'
import { deriveSaleStatus } from '../../utils/deriveSaleStatus'
import { shortSaleId } from '../../utils/saleId'
import type { SaleStatus } from '../../types/saleRecord'

const statusStyles: Record<SaleStatus, { label: string; className: string }> = {
  completed: { label: 'Concluída', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  exchanged: { label: 'Trocada', className: 'bg-orange-50 text-[#d84315] border-orange-200' },
  returned: { label: 'Devolvida', className: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

interface SaleDetailsModalProps {
  saleId: string
  onClose: () => void
}

function SaleDetailsModal({ saleId, onClose }: SaleDetailsModalProps) {
  const { data: sale, loading, error, reload } = useApi(() => fetchSaleById(saleId), [saleId])
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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div
        className={`relative bg-white text-gray-900 rounded-xl w-full max-w-[48rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex justify-between items-center p-md border-b border-gray-200 flex-shrink-0">
          <h2 className="text-headline-md font-headline-md text-gray-900">
            {sale ? `Venda ${shortSaleId(sale.id)}` : 'Detalhes da Venda'}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto p-md min-h-[22rem] flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-body-md font-body-md text-gray-500">Carregando...</p>
            </div>
          ) : error || !sale ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-sm text-center">
              <p className="text-body-md font-body-md text-gray-500">{error ?? 'Venda não encontrada.'}</p>
              <button
                type="button"
                onClick={reload}
                className="text-label-lg font-label-lg text-[#ff5722] hover:opacity-80"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="space-y-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="pb-md md:pb-0 md:pr-md">
                  <h3 className="text-body-lg font-body-lg font-semibold mb-sm text-gray-900">Resumo do Pedido</h3>
                  <div className="mb-sm">
                    <p className="text-label-md font-label-md text-gray-500 uppercase tracking-wider mb-xs">
                      Data e Hora
                    </p>
                    <p className="text-body-md font-body-md">
                      {new Date(sale.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-md font-label-md text-gray-500 uppercase tracking-wider mb-xs">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[deriveSaleStatus(sale)].className}`}
                    >
                      {statusStyles[deriveSaleStatus(sale)].label}
                    </span>
                  </div>

                  {deriveSaleStatus(sale) === 'returned' && (
                    <div className="mt-sm">
                      <p className="text-label-md font-label-md text-gray-500 uppercase tracking-wider mb-xs">
                        Motivo da Devolução
                      </p>
                      <div className="space-y-1">
                        {(sale.exchanges ?? [])
                          .filter((exchange) => !exchange.newVariantId)
                          .map((exchange) => {
                            const item = sale.items.find((saleItem) => saleItem.productVariantId === exchange.returnedVariantId)
                            return (
                              <p key={exchange.id} className="text-body-md font-body-md text-gray-600">
                                {item ? `${item.product.name}: ` : ''}
                                {exchange.reason?.trim() || 'Não informado'}
                              </p>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-md md:pt-0 md:pl-md">
                  <h3 className="text-body-lg font-body-lg font-semibold mb-sm text-gray-900">Cliente</h3>
                  <div className="mb-sm">
                    <p className="text-label-md font-label-md text-gray-500 uppercase tracking-wider mb-xs">Nome</p>
                    <p className="text-body-md font-body-md text-gray-600">
                      {sale.customerName?.trim() || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-md font-label-md text-gray-500 uppercase tracking-wider mb-xs">
                      Contato
                    </p>
                    <p className="text-body-md font-body-md text-gray-600">
                      {sale.customerPhone?.trim() || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="text-body-lg font-body-lg font-semibold mb-sm text-gray-900">Itens</h3>
                <div className="divide-y divide-gray-100">
                  {sale.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-sm">
                      <div className="flex items-center gap-md">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-[24px]">apparel</span>
                        </div>
                        <span className="text-body-md font-body-md text-gray-800">
                          {item.quantity}x {item.product.name}{' '}
                          <span className="text-gray-500">
                            ({item.productVariant.size}/{item.productVariant.color})
                          </span>
                        </span>
                      </div>
                      <span className="text-body-md font-body-md font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(Number(item.subtotal))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-md space-y-sm">
                <h3 className="text-body-lg font-body-lg font-semibold mb-sm text-gray-900">Detalhes Financeiros</h3>
                <div className="flex flex-col gap-2">
                  <p className="text-body-md font-body-md text-gray-700">
                    <span className="font-medium text-gray-900">Forma de Pagamento:</span>{' '}
                    {paymentMethodDetailLabel(sale)}
                  </p>
                  {Number(sale.discount) > 0 && (
                    <p className="text-body-md font-body-md text-gray-700">
                      <span className="font-medium text-gray-900">Desconto:</span> -{' '}
                      {formatCurrency(Number(sale.discount))}
                    </p>
                  )}
                </div>
                <div className="pt-sm mt-sm border-t border-gray-200">
                  <p className="text-headline-lg font-headline-lg text-[#ff5722]">
                    <span className="font-bold">Total:</span> {formatCurrency(Number(sale.total))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SaleDetailsModal
