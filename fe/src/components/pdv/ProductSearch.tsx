import { useState } from 'react'
import type { Product } from '../../types/sale'
import { formatCurrency } from '../../utils/currency'
import { fetchProducts } from '../../api/products'
import { useApi } from '../../hooks/useApi'

interface ProductSearchProps {
  onSelect: (product: Product) => void
}

function ProductSearch({ onSelect }: ProductSearchProps) {
  const [term, setTerm] = useState('')
  const { data, loading, error } = useApi(() => fetchProducts({ active: true }), [])

  const catalog: (Product & { stock: number })[] = (data ?? []).flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      code: product.sku,
      name: `${product.name} (${variant.color})`,
      size: variant.size,
      price: Number(product.price),
      stock: variant.stockQuantity,
    })),
  )

  const trimmedTerm = term.trim().toLowerCase()
  const results = trimmedTerm
    ? catalog.filter(
        (product) =>
          product.name.toLowerCase().includes(trimmedTerm) || product.code.toLowerCase().includes(trimmedTerm),
      )
    : catalog

  const handleSelect = (product: Product) => {
    onSelect(product)
  }

  return (
    <div className="border-b border-outline-variant bg-surface-container flex-shrink-0">
      <div className="p-md pb-sm">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full h-12 bg-background border border-outline-variant rounded-lg pl-xl pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant"
            placeholder={loading ? 'Carregando catálogo...' : 'Buscar produto por código ou nome'}
            type="text"
            value={term}
            disabled={loading}
            onChange={(event) => setTerm(event.target.value)}
          />
        </div>

        {error && <p className="text-label-md font-label-md text-error mt-xs">Não foi possível carregar o catálogo.</p>}
      </div>

      <div className="px-md pb-md">
        {loading ? (
          <p className="text-label-md font-label-md text-on-surface-variant py-sm">Carregando catálogo...</p>
        ) : results.length === 0 ? (
          <p className="text-label-md font-label-md text-on-surface-variant py-sm">
            {trimmedTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-sm max-h-72 overflow-y-auto pr-1">
            {results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelect(product)}
                disabled={product.stock === 0}
                className="flex items-center gap-sm p-sm rounded-xl border border-outline-variant bg-surface-container-high hover:border-primary-container hover:bg-surface-bright transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-14 h-14 rounded-lg bg-surface-container-highest border border-outline-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[24px]">apparel</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-lg font-body-lg font-medium text-on-surface truncate">{product.name}</p>
                  <p className="text-label-md font-label-md text-on-surface-variant">
                    Tam. {product.size} · {product.stock === 0 ? 'Sem estoque' : `${product.stock} un.`}
                  </p>
                  <p className="text-body-md font-body-md font-semibold text-on-surface mt-0.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSearch
