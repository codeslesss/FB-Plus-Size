import type { ExchangeAction, ItemDraft, ReplacementProduct, Sale } from '../types/exchange'

export interface SummaryLine {
  itemId: string
  productVariantId: string
  itemName: string
  itemSize: string
  action: ExchangeAction
  detail: string
  value: number
  ready: boolean
  reason?: string
  refundMethod?: string
  replacementVariantId?: string
}

export function buildSummaryLines(
  sale: Sale | null,
  drafts: Record<string, ItemDraft>,
  replacementCatalog: ReplacementProduct[],
): SummaryLine[] {
  return (sale?.items ?? [])
    .map((item): SummaryLine | null => {
      const draft = drafts[item.id]
      if (!draft || !draft.action) return null

      if (draft.action === 'return') {
        const ready = Boolean(draft.reason && draft.refundMethod)
        return {
          itemId: item.id,
          productVariantId: item.productVariantId,
          itemName: item.name,
          itemSize: item.size,
          action: 'return',
          detail: ready ? `Devolução · ${draft.refundMethod}` : 'Devolução · selecione motivo e reembolso',
          value: -item.price,
          ready,
          reason: draft.reason || undefined,
          refundMethod: draft.refundMethod || undefined,
        }
      }

      const replacementProduct = replacementCatalog.find((product) => product.code === draft.replacementCode)
      const replacementVariant = replacementProduct?.variants.find((variant) => variant.id === draft.replacementVariantId)
      const ready = Boolean(replacementProduct && replacementVariant)
      return {
        itemId: item.id,
        productVariantId: item.productVariantId,
        itemName: item.name,
        itemSize: item.size,
        action: 'exchange',
        detail: ready
          ? `Troca por ${replacementProduct?.name} (${replacementVariant?.size})`
          : 'Troca · selecione o novo produto',
        value: replacementProduct ? replacementProduct.price - item.price : 0,
        ready,
        replacementVariantId: replacementVariant?.id,
      }
    })
    .filter((line): line is SummaryLine => line !== null)
}
