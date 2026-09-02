import { useState } from 'react'
import Modal from '../common/Modal'
import { createProduct } from '../../api/products'
import { ApiError } from '../../api/client'

interface VariantDraft {
  size: string
  color: string
  stock: string
}

interface NewProductModalProps {
  existingCategories: string[]
  onClose: () => void
  onCreated: () => void
}

const emptyVariant: VariantDraft = { size: '', color: '', stock: '' }

function NewProductModal({ existingCategories, onClose, onCreated }: NewProductModalProps) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [priceDraft, setPriceDraft] = useState('')
  const [description, setDescription] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>([{ ...emptyVariant }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)))
  }

  const addVariant = () => setVariants((current) => [...current, { ...emptyVariant }])

  const removeVariant = (index: number) => setVariants((current) => current.filter((_, i) => i !== index))

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

    const validVariants = variants
      .filter((variant) => variant.size.trim() || variant.color.trim() || variant.stock.trim())
      .map((variant) => ({
        size: variant.size.trim(),
        color: variant.color.trim(),
        stockQuantity: Number(variant.stock.replace(',', '.')) || 0,
      }))

    if (validVariants.some((variant) => !variant.size || !variant.color)) {
      setError('Toda variante precisa de tamanho e cor preenchidos.')
      return
    }
    if (validVariants.some((variant) => variant.stockQuantity < 0 || !Number.isInteger(variant.stockQuantity))) {
      setError('O estoque de cada variante precisa ser um número inteiro maior ou igual a zero.')
      return
    }

    setSubmitting(true)
    try {
      await createProduct({
        name: name.trim(),
        sku: sku.trim(),
        category: category.trim(),
        price: parsedPrice,
        description: description.trim() || undefined,
        variants: validVariants,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cadastrar o produto. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Novo Produto"
      subtitle="Cadastre novos itens no seu inventário de forma rápida."
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-lg">
        {/* Informações Básicas */}
        <div className="flex flex-col gap-sm pb-lg border-b border-outline-variant">
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
              Nome do Produto
            </label>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg px-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Vestido Longo Floral"
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
                SKU
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                  tag
                </span>
                <input
                  className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="Ex: VES-003"
                />
              </div>
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
                Preço
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-lg font-label-lg font-medium text-on-surface-variant pointer-events-none">
                  R$
                </span>
                <input
                  className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={priceDraft}
                  onChange={(event) => setPriceDraft(event.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classificação */}
        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
            Categoria
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              category
            </span>
            <input
              className="w-full h-11 bg-background border border-outline-variant rounded-lg pl-9 pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Selecione ou digite uma categoria"
              list="product-categories"
            />
            <datalist id="product-categories">
              {existingCategories.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Detalhes */}
        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
            Descrição (opcional)
          </label>
          <textarea
            className="w-full bg-background border border-outline-variant rounded-lg px-sm py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva os detalhes do produto..."
            rows={3}
          />
        </div>

        {/* Variações e Estoque */}
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant flex flex-col gap-sm">
          <div className="flex justify-between items-center">
            <h4 className="text-headline-sm font-headline-sm text-on-surface">Variações e Estoque</h4>
            <button
              type="button"
              onClick={addVariant}
              className="text-label-lg font-label-lg text-primary-container hover:opacity-80 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Adicionar
            </button>
          </div>
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
                    Qtd.
                  </th>
                  <th className="py-xs px-xs w-10" />
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={index} className="border-b border-outline-variant last:border-b-0">
                    <td className="py-xs px-xs">
                      <input
                        className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        value={variant.size}
                        onChange={(event) => updateVariant(index, { size: event.target.value })}
                        placeholder="Ex: G"
                        list="product-variant-sizes"
                      />
                    </td>
                    <td className="py-xs px-xs">
                      <input
                        className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        value={variant.color}
                        onChange={(event) => updateVariant(index, { color: event.target.value })}
                        placeholder="Ex: Preto"
                      />
                    </td>
                    <td className="py-xs px-xs">
                      <input
                        className="w-full h-9 bg-background border border-outline-variant rounded-md px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        value={variant.stock}
                        onChange={(event) => updateVariant(index, { stock: event.target.value })}
                        placeholder="0"
                        inputMode="numeric"
                      />
                    </td>
                    <td className="py-xs px-xs text-center">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1}
                        aria-label="Remover variante"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <datalist id="product-variant-sizes">
              {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].map((size) => (
                <option key={size} value={size} />
              ))}
            </datalist>
          </div>
        </div>

        {error && <p className="text-label-md font-label-md text-error">{error}</p>}

        <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
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
            {submitting ? 'Salvando...' : 'Cadastrar Produto'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default NewProductModal
