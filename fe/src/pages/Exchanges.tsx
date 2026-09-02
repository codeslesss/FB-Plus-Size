import { useMemo, useState } from 'react'
import { useNotifications } from '../context/NotificationsContext'
import SaleSearch from '../components/exchanges/SaleSearch'
import SaleItemsPanel from '../components/exchanges/SaleItemsPanel'
import ExchangeSummary from '../components/exchanges/ExchangeSummary'
import ExchangeHistoryTable from '../components/exchanges/ExchangeHistoryTable'
import AsyncState from '../components/common/AsyncState'
import type { ExchangeAction, HistoryEntry, ItemDraft, ReplacementProduct, Sale } from '../types/exchange'
import { buildSummaryLines } from '../utils/exchangeSummary'
import { fetchSales } from '../api/sales'
import { fetchProducts } from '../api/products'
import { createExchange, fetchExchanges } from '../api/exchanges'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../api/client'
import { paymentMethodLabel } from '../utils/paymentMethod'
import { formatRelativeDateTime } from '../utils/date'
import { shortSaleId } from '../utils/saleId'
import type { ApiExchangeDetailed } from '../api/types'

const emptyDraft: ItemDraft = {
  action: null,
  reason: '',
  refundMethod: '',
  replacementCode: '',
  replacementVariantId: '',
}

function mapHistoryEntry(exchange: ApiExchangeDetailed): HistoryEntry {
  const isReturn = !exchange.newVariantId
  const value = isReturn
    ? -Number(exchange.returnedVariant.product.price) * exchange.returnedQuantity
    : Number(exchange.priceDifference)

  return {
    id: exchange.id,
    saleId: shortSaleId(exchange.saleId),
    itemName: exchange.returnedVariant.product.name,
    itemSize: exchange.returnedVariant.size,
    action: isReturn ? 'return' : 'exchange',
    detail: isReturn
      ? `Devolução${exchange.reason ? ` · ${exchange.reason}` : ''}${exchange.refundMethod ? ` · ${exchange.refundMethod}` : ''}`
      : `Troca por ${exchange.newVariant?.product.name} (${exchange.newVariant?.size})`,
    value,
    createdAt: formatRelativeDateTime(new Date(exchange.createdAt)),
  }
}

function Exchanges() {
  const { notify } = useNotifications()
  const salesQuery = useApi(() => fetchSales({ limit: 30 }), [])
  const productsQuery = useApi(() => fetchProducts({ active: true }), [])
  const historyQuery = useApi(() => fetchExchanges(20), [])

  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({})
  const [submitting, setSubmitting] = useState(false)

  const sales: Sale[] = useMemo(
    () =>
      (salesQuery.data ?? []).map((sale) => ({
        id: sale.id,
        time: new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: paymentMethodLabel(sale.paymentMethod),
        items: sale.items.map((item) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          code: item.product.sku,
          name: item.product.name,
          size: item.productVariant.size,
          price: Number(item.unitPrice),
        })),
      })),
    [salesQuery.data],
  )

  const replacementCatalog: ReplacementProduct[] = useMemo(
    () =>
      (productsQuery.data ?? [])
        .map((product) => ({
          code: product.sku,
          name: product.name,
          price: Number(product.price),
          variants: product.variants
            .filter((variant) => variant.stockQuantity > 0)
            .map((variant) => ({
              id: variant.id,
              size: variant.size,
              color: variant.color,
              stockQuantity: variant.stockQuantity,
            })),
        }))
        .filter((product) => product.variants.length > 0),
    [productsQuery.data],
  )

  const history: HistoryEntry[] = (historyQuery.data ?? []).map(mapHistoryEntry)

  const selectedSale = sales.find((sale) => sale.id === selectedSaleId) ?? null

  const selectSale = (sale: Sale) => {
    setSelectedSaleId(sale.id)
    setDrafts({})
  }

  const setAction = (itemId: string, action: ExchangeAction) => {
    setDrafts((current) => {
      const existing = current[itemId] ?? emptyDraft
      if (existing.action === action) {
        return { ...current, [itemId]: emptyDraft }
      }
      return { ...current, [itemId]: { ...emptyDraft, action } }
    })
  }

  const updateDraft = (itemId: string, patch: Partial<ItemDraft>) => {
    setDrafts((current) => ({ ...current, [itemId]: { ...(current[itemId] ?? emptyDraft), ...patch } }))
  }

  const finalize = async () => {
    if (!selectedSale || submitting) return
    const lines = buildSummaryLines(selectedSale, drafts, replacementCatalog).filter((line) => line.ready)
    if (lines.length === 0) return

    setSubmitting(true)
    try {
      for (const line of lines) {
        await createExchange({
          saleId: selectedSale.id,
          returnedVariantId: line.productVariantId,
          returnedQuantity: 1,
          newVariantId: line.action === 'exchange' ? line.replacementVariantId : undefined,
          newQuantity: line.action === 'exchange' ? 1 : undefined,
          reason: line.action === 'return' ? line.reason : undefined,
          refundMethod: line.action === 'return' ? line.refundMethod : undefined,
        })
      }

      notify({
        title:
          lines.length > 1
            ? 'Trocas/Devoluções Registradas'
            : lines[0].action === 'return'
              ? 'Devolução Registrada'
              : 'Troca Registrada',
        message: `${lines.length} item(ns) da venda ${selectedSale.id} processado(s) com sucesso.`,
        icon: 'task_alt',
        variant: 'info',
      })

      setSelectedSaleId(null)
      setDrafts({})
      productsQuery.reload()
      historyQuery.reload()
    } catch (err) {
      notify({
        title: 'Erro ao Processar',
        message: err instanceof ApiError ? err.message : 'Não foi possível concluir a operação. Tente novamente.',
        icon: 'error',
        variant: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const error = salesQuery.error ?? productsQuery.error
  const loading = salesQuery.loading || productsQuery.loading

  return (
    <div className="flex flex-col">
      <header className="mb-lg">
        <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Trocas/Devoluções</h1>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Trocas/Devoluções</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-xs">
          Busque uma venda, escolha os itens e processe a troca ou devolução.
        </p>
      </header>

      {error ? (
        <AsyncState
          error={error}
          onRetry={() => {
            salesQuery.reload()
            productsQuery.reload()
          }}
        />
      ) : loading ? (
        <p className="text-body-md font-body-md text-on-surface-variant">Carregando vendas...</p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-gutter items-start">
            <div className="flex-1 w-full bg-surface-container-low rounded-xl border border-outline-variant p-md">
              <h4 className="text-label-lg font-label-lg text-on-surface-variant uppercase tracking-wider mb-sm">
                Buscar Venda
              </h4>
              <SaleSearch sales={sales} selectedSaleId={selectedSaleId} onSelectSale={selectSale} />

              {selectedSale && (
                <div className="mt-md pt-md border-t border-outline-variant">
                  <h4 className="text-label-lg font-label-lg text-on-surface-variant uppercase tracking-wider mb-sm">
                    Itens da Venda {shortSaleId(selectedSale.id)}
                  </h4>
                  <SaleItemsPanel
                    sale={selectedSale}
                    drafts={drafts}
                    replacementCatalog={replacementCatalog}
                    onSetAction={setAction}
                    onUpdateDraft={updateDraft}
                  />
                </div>
              )}
            </div>

            <ExchangeSummary
              sale={selectedSale}
              drafts={drafts}
              replacementCatalog={replacementCatalog}
              onFinalize={finalize}
              submitting={submitting}
            />
          </div>

          {historyQuery.error ? (
            <p className="text-label-md font-label-md text-error mt-md">Não foi possível carregar o histórico.</p>
          ) : (
            <ExchangeHistoryTable entries={history} />
          )}
        </>
      )}
    </div>
  )
}

export default Exchanges
