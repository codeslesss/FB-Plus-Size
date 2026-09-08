import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import {
  fetchProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from '../../api/products'
import { ApiError } from '../../api/client'

interface EditableProduct {
  id: string
  name: string
  sku: string
  barcode: string | null
  brand: string | null
  category: string
  price: number
  description: string | null
}

interface VariantRow {
  key: string
  variantId?: string
  size: string
  color: string
  stock: string
  lowStockThreshold: string
}

interface EditProductModalProps {
  product: EditableProduct
  existingCategories: string[]
  onClose: () => void
  onUpdated: () => void
}

function EditProductModal({ product, existingCategories, onClose, onUpdated }: EditProductModalProps) {
  const [name, setName] = useState(product.name)
  const [sku, setSku] = useState(product.sku)
  const [barcode, setBarcode] = useState(product.barcode ?? '')
  const [brand, setBrand] = useState(product.brand ?? '')
  const [category, setCategory] = useState(product.category)
  const [priceDraft, setPriceDraft] = useState(String(product.price).replace('.', ','))
  const [description, setDescription] = useState(product.description ?? '')

  const [variants, setVariants] = useState<VariantRow[]>([])
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([])
  const [loadingVariants, setLoadingVariants] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchProduct(product.id)
      .then((full) => {
        if (cancelled) return
        setVariants(
          full.variants.map((variant) => ({
            key: variant.id,
            variantId: variant.id,
            size: variant.size,
            color: variant.color,
            stock: String(variant.stockQuantity),
            lowStockThreshold: String(variant.lowStockThreshold),
          })),
        )
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar as variações deste produto.')
      })
      .finally(() => {
        if (!cancelled) setLoadingVariants(false)
      })
    return () => {
      cancelled = true
    }
  }, [product.id])

  const updateVariantRow = (key: string, patch: Partial<VariantRow>) => {
    setVariants((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const addVariantRow = () => {
    setVariants((current) => [
      ...current,
      { key: `new-${Date.now()}-${current.length}`, size: '', color: '', stock: '0', lowStockThreshold: '5' },
    ])
  }

  const removeVariantRow = (row: VariantRow) => {
    if (row.variantId) setRemovedVariantIds((current) => [...current, row.variantId!])
    setVariants((current) => current.filter((item) => item.key !== row.key))
  }

  const handleSubmit = async () => {
    setError(null)

    const parsedPrice = Number(priceDraft.replace(',', '.'))
    if (!name.trim() || !sku.trim() || !category.trim()) {
      setError('Preencha nome, código e categoria.')
      return
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Informe um preço válido (ex: 89,90).')
      return
    }

    const activeVariants = variants.filter((row) => row.size.trim() || row.color.trim())
    if (activeVariants.some((row) => !row.size.trim() || !row.color.trim())) {
      setError('Toda variação precisa de tamanho e cor preenchidos.')
      return
    }

    setSubmitting(true)
    try {
      await updateProduct(product.id, {
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode.trim(),
        brand: brand.trim(),
        category: category.trim(),
        price: parsedPrice,
        description: description.trim(),
      })

      const results = await Promise.allSettled([
        ...removedVariantIds.map((variantId) => deleteVariant(product.id, variantId)),
        ...activeVariants
          .filter((row) => row.variantId)
          .map((row) =>
            updateVariant(product.id, row.variantId!, {
              size: row.size.trim(),
              color: row.color.trim(),
              lowStockThreshold: Number(row.lowStockThreshold.replace(',', '.')) || 0,
            }),
          ),
        ...activeVariants
          .filter((row) => !row.variantId)
          .map((row) =>
            createVariant(product.id, {
              size: row.size.trim(),
              color: row.color.trim(),
              stockQuantity: Number(row.stock.replace(',', '.')) || 0,
              lowStockThreshold: Number(row.lowStockThreshold.replace(',', '.')) || 0,
            }),
          ),
      ])

      const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')

      onUpdated()

      if (failures.length > 0) {
        const message = failures
          .map((failure) => (failure.reason instanceof ApiError ? failure.reason.message : 'Erro desconhecido'))
          .join(' ')
        setError(`Produto salvo, mas houve problemas nas variações: ${message}`)
        setSubmitting(false)
        return
      }

      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Editar Produto" onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="flex flex-col gap-md">
        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Nome do Produto</label>
          <input
            className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Vestido Longo Floral"
          />
        </div>

        <div className="grid grid-cols-2 gap-sm">
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Código (SKU)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                tag
              </span>
              <input
                className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="Ex: VES-003"
              />
            </div>
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Preço</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-lg font-label-lg font-medium text-on-surface-variant pointer-events-none">
                R$
              </span>
              <input
                className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={priceDraft}
                onChange={(event) => setPriceDraft(event.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-sm">
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Marca (opcional)</label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Ex: Malwee"
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">
              Código de Barras (opcional)
            </label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="Ex: 7891234567890"
              inputMode="numeric"
            />
          </div>
        </div>

        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Categoria</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              category
            </span>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ex: Vestidos"
              list="product-categories-edit"
            />
            <datalist id="product-categories-edit">
              {existingCategories.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-xs">Descrição</label>
          <textarea
            className="w-full bg-background border border-outline-variant rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Adicione detalhes sobre o produto..."
            rows={3}
          />
        </div>

        <div className="bg-surface-container rounded-lg p-md border border-outline-variant flex flex-col gap-sm">
          <div className="flex justify-between items-center">
            <h4 className="text-headline-sm font-headline-sm text-on-surface">Tamanhos e Cores</h4>
            <button
              type="button"
              onClick={addVariantRow}
              className="text-label-lg font-label-lg text-primary-container hover:opacity-80 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Adicionar
            </button>
          </div>

          {loadingVariants ? (
            <p className="text-label-md font-label-md text-on-surface-variant py-sm">Carregando variações...</p>
          ) : variants.length === 0 ? (
            <p className="text-label-md font-label-md text-on-surface-variant py-sm">
              Nenhuma variação cadastrada. Use "Adicionar" para incluir tamanhos e cores.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-xs px-xs text-label-md font-label-md text-on-surface-variant uppercase font-normal">
                      Tamanho
                    </th>
                    <th className="py-xs px-xs text-label-md font-label-md text-on-surface-variant uppercase font-normal">
                      Cor
                    </th>
                    <th className="py-xs px-xs w-24 text-label-md font-label-md text-on-surface-variant uppercase font-normal">
                      Estoque
                    </th>
                    <th className="py-xs px-xs w-24 text-label-md font-label-md text-on-surface-variant uppercase font-normal">
                      Alerta Baixo
                    </th>
                    <th className="py-xs px-xs w-10" />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((row) => (
                    <tr key={row.key} className="border-b border-outline-variant last:border-b-0">
                      <td className="py-xs px-xs">
                        <input
                          className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          value={row.size}
                          onChange={(event) => updateVariantRow(row.key, { size: event.target.value })}
                          placeholder="Ex: G"
                        />
                      </td>
                      <td className="py-xs px-xs">
                        <input
                          className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          value={row.color}
                          onChange={(event) => updateVariantRow(row.key, { color: event.target.value })}
                          placeholder="Ex: Preto"
                        />
                      </td>
                      <td className="py-xs px-xs">
                        {row.variantId ? (
                          <span
                            className="block h-9 leading-9 text-center text-body-md font-body-md text-on-surface-variant"
                            title="Ajuste a quantidade na tela de Estoque"
                          >
                            {row.stock} un.
                          </span>
                        ) : (
                          <input
                            className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            value={row.stock}
                            onChange={(event) => updateVariantRow(row.key, { stock: event.target.value })}
                            placeholder="0"
                            inputMode="numeric"
                          />
                        )}
                      </td>
                      <td className="py-xs px-xs">
                        <input
                          className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          value={row.lowStockThreshold}
                          onChange={(event) => updateVariantRow(row.key, { lowStockThreshold: event.target.value })}
                          placeholder="5"
                          inputMode="numeric"
                        />
                      </td>
                      <td className="py-xs px-xs text-center">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(row)}
                          aria-label="Remover variação"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-label-md font-label-md text-on-surface-variant">
            Para ajustar a quantidade em estoque de uma variação já existente, use a tela de Estoque.
          </p>
        </div>

        {error && <p className="text-label-md font-label-md text-error">{error}</p>}

        <div className="flex justify-end gap-sm mt-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-6 h-11 rounded-lg border border-outline-variant text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 h-11 rounded-lg bg-primary-container text-white font-label-lg text-label-lg font-bold hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,87,34,0.3)] hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span className="material-symbols-outlined text-[18px]">{submitting ? 'hourglass_empty' : 'check'}</span>
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default EditProductModal
