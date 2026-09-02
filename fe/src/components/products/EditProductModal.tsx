import { useState } from 'react'
import Modal from '../common/Modal'
import { updateProduct } from '../../api/products'
import { ApiError } from '../../api/client'

interface EditableProduct {
  id: string
  name: string
  sku: string
  category: string
  price: number
  description: string | null
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
  const [category, setCategory] = useState(product.category)
  const [priceDraft, setPriceDraft] = useState(String(product.price).replace('.', ','))
  const [description, setDescription] = useState(product.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    setSubmitting(true)
    try {
      await updateProduct(product.id, {
        name: name.trim(),
        sku: sku.trim(),
        category: category.trim(),
        price: parsedPrice,
        description: description.trim(),
      })
      onUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Editar Produto" onClose={onClose}>
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
            rows={4}
          />
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
