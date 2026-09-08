import { useMemo, useState } from 'react'
import type { CartLineInput, CatalogEntry } from '../../types/sale'
import { formatCurrency } from '../../utils/currency'
import { fetchProducts } from '../../api/products'
import { useApi } from '../../hooks/useApi'
import VariantPickerModal from './VariantPickerModal'

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'stock-desc'

const ALL = 'all'

interface ProductSearchProps {
  onSelect: (item: CartLineInput, quantity?: number) => void
  cartQuantities: Record<string, number>
}

function ProductSearch({ onSelect, cartQuantities }: ProductSearchProps) {
  const [term, setTerm] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [category, setCategory] = useState(ALL)
  const [color, setColor] = useState(ALL)
  const [size, setSize] = useState(ALL)
  const [brand, setBrand] = useState(ALL)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [pickerEntry, setPickerEntry] = useState<CatalogEntry | null>(null)

  const { data, loading, error } = useApi(() => fetchProducts({ active: true }), [])

  const catalog: CatalogEntry[] = useMemo(
    () =>
      (data ?? []).map((product) => {
        const variants = product.variants.map((variant) => ({
          variantId: variant.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stockQuantity,
          lowStock: variant.stockQuantity <= variant.lowStockThreshold,
        }))
        return {
          productId: product.id,
          code: product.sku,
          barcode: product.barcode,
          brand: product.brand,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
          lowStock: variants.some((v) => v.lowStock),
          variants,
        }
      }),
    [data],
  )

  const categories = useMemo(() => Array.from(new Set(catalog.map((p) => p.category))).sort(), [catalog])
  const colors = useMemo(
    () => Array.from(new Set(catalog.flatMap((p) => p.variants.map((v) => v.color)))).sort(),
    [catalog],
  )
  const sizes = useMemo(
    () => Array.from(new Set(catalog.flatMap((p) => p.variants.map((v) => v.size)))).sort(),
    [catalog],
  )
  const brands = useMemo(
    () => Array.from(new Set(catalog.map((p) => p.brand).filter((b): b is string => Boolean(b)))).sort(),
    [catalog],
  )

  const trimmedTerm = term.trim().toLowerCase()
  const priceMinNum = priceMin.trim() ? Number(priceMin.replace(',', '.')) : undefined
  const priceMaxNum = priceMax.trim() ? Number(priceMax.replace(',', '.')) : undefined

  const results = useMemo(() => {
    const matchesSearch = (entry: CatalogEntry) => {
      if (!trimmedTerm) return true
      return (
        entry.name.toLowerCase().includes(trimmedTerm) ||
        entry.code.toLowerCase().includes(trimmedTerm) ||
        entry.category.toLowerCase().includes(trimmedTerm) ||
        (entry.brand?.toLowerCase().includes(trimmedTerm) ?? false) ||
        (entry.barcode?.toLowerCase().includes(trimmedTerm) ?? false) ||
        entry.variants.some(
          (v) => v.color.toLowerCase().includes(trimmedTerm) || v.size.toLowerCase().includes(trimmedTerm),
        )
      )
    }

    const filtered = catalog.filter((entry) => {
      if (!matchesSearch(entry)) return false
      if (category !== ALL && entry.category !== category) return false
      if (brand !== ALL && entry.brand !== brand) return false
      if (color !== ALL && !entry.variants.some((v) => v.color === color)) return false
      if (size !== ALL && !entry.variants.some((v) => v.size === size)) return false
      if (priceMinNum !== undefined && !Number.isNaN(priceMinNum) && entry.price < priceMinNum) return false
      if (priceMaxNum !== undefined && !Number.isNaN(priceMaxNum) && entry.price > priceMaxNum) return false
      if (inStockOnly && entry.totalStock <= 0) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stock-desc':
          return b.totalStock - a.totalStock
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [catalog, trimmedTerm, category, brand, color, size, priceMinNum, priceMaxNum, inStockOnly, sortBy])

  const activeFilterCount = [
    category !== ALL,
    color !== ALL,
    size !== ALL,
    brand !== ALL,
    inStockOnly,
    priceMin.trim() !== '',
    priceMax.trim() !== '',
  ].filter(Boolean).length

  const clearFilters = () => {
    setCategory(ALL)
    setColor(ALL)
    setSize(ALL)
    setBrand(ALL)
    setInStockOnly(false)
    setPriceMin('')
    setPriceMax('')
  }

  const clearAll = () => {
    clearFilters()
    setTerm('')
  }

  const handleSelect = (entry: CatalogEntry) => {
    if (entry.totalStock <= 0) return
    if (entry.variants.length === 1) {
      const variant = entry.variants[0]
      onSelect({
        id: variant.variantId,
        productId: entry.productId,
        code: entry.code,
        name: entry.name,
        color: variant.color,
        size: variant.size,
        price: entry.price,
        stock: variant.stock,
      })
      return
    }
    setPickerEntry(entry)
  }

  const selectClass =
    'h-9 bg-background border border-outline-variant rounded-lg pl-2 pr-6 text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none'

  return (
    <div className="border-b border-outline-variant bg-surface-container flex-shrink-0">
      <div className="p-md pb-sm">
        <div className="flex gap-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full h-12 bg-background border border-outline-variant rounded-lg pl-xl pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant"
              placeholder={loading ? 'Carregando catálogo...' : 'Buscar por nome, código, cor, tamanho, marca ou cód. de barras'}
              type="text"
              value={term}
              disabled={loading}
              onChange={(event) => setTerm(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((current) => !current)}
            className={`relative h-12 px-md rounded-lg border flex items-center gap-xs text-label-lg font-label-lg font-bold transition-colors flex-shrink-0 ${
              filtersOpen
                ? 'border-primary-container bg-primary-container/10 text-primary-container'
                : 'border-outline-variant bg-background text-on-surface hover:border-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-surface-container">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {error && <p className="text-label-md font-label-md text-error mt-xs">Não foi possível carregar o catálogo.</p>}

        <div className="flex flex-wrap items-center gap-xs mt-sm">
          <button
            type="button"
            onClick={clearAll}
            className={`h-8 px-3 rounded-full text-label-md font-label-md border transition-colors ${
              activeFilterCount === 0 && !trimmedTerm
                ? 'border-primary-container bg-primary-container/10 text-primary-container font-bold'
                : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary-container'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setInStockOnly((current) => !current)}
            className={`h-8 px-3 rounded-full text-label-md font-label-md border transition-colors ${
              inStockOnly
                ? 'border-primary-container bg-primary-container/10 text-primary-container font-bold'
                : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary-container'
            }`}
          >
            Em estoque
          </button>

          <div className="relative">
            <select className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value={ALL}>Categoria</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select className={selectClass} value={size} onChange={(event) => setSize(event.target.value)}>
              <option value={ALL}>Tamanho</option>
              {sizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select className={selectClass} value={color} onChange={(event) => setColor(event.target.value)}>
              <option value={ALL}>Cor</option>
              {colors.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-sm p-md bg-surface-container-high rounded-xl border border-outline-variant">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">Marca</label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-background border border-outline-variant rounded-lg pl-sm pr-8 text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                  >
                    <option value={ALL}>Todas</option>
                    {brands.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
                  Ordenar por
                </label>
                <div className="relative">
                  <select
                    className="w-full h-10 bg-background border border-outline-variant rounded-lg pl-sm pr-8 text-body-md font-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                  >
                    <option value="name">Nome (A-Z)</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                    <option value="stock-desc">Maior estoque</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant uppercase mb-xs">
                  Faixa de Preço
                </label>
                <div className="flex items-center gap-1">
                  <input
                    className="w-full h-10 bg-background border border-outline-variant rounded-lg px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={priceMin}
                    onChange={(event) => setPriceMin(event.target.value)}
                    placeholder="Mín."
                    inputMode="decimal"
                  />
                  <span className="text-on-surface-variant">–</span>
                  <input
                    className="w-full h-10 bg-background border border-outline-variant rounded-lg px-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={priceMax}
                    onChange={(event) => setPriceMax(event.target.value)}
                    placeholder="Máx."
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-sm pt-sm border-t border-outline-variant">
              <label className="flex items-center gap-xs text-label-lg font-label-lg text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) => setInStockOnly(event.target.checked)}
                  className="w-4 h-4 accent-primary-container"
                />
                Somente disponíveis em estoque
              </label>
              <button
                type="button"
                onClick={clearFilters}
                className="text-label-lg font-label-lg text-primary-container hover:opacity-80 flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-md pb-md">
        {loading ? (
          <p className="text-label-md font-label-md text-on-surface-variant py-sm">Carregando catálogo...</p>
        ) : results.length === 0 ? (
          <p className="text-label-md font-label-md text-on-surface-variant py-sm">
            {trimmedTerm || activeFilterCount > 0 ? 'Nenhum produto encontrado com esses filtros.' : 'Nenhum produto cadastrado.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-sm max-h-[26rem] overflow-y-auto pr-1">
            {results.map((entry) => {
              const outOfStock = entry.totalStock <= 0
              const singleVariant = entry.variants.length === 1
              return (
                <button
                  key={entry.productId}
                  type="button"
                  onClick={() => handleSelect(entry)}
                  disabled={outOfStock}
                  className="flex items-center gap-sm p-sm rounded-xl border border-outline-variant bg-surface-container-high hover:border-primary-container hover:bg-surface-bright transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed relative"
                >
                  {entry.lowStock && !outOfStock && (
                    <span
                      title="Estoque baixo"
                      className="absolute top-1.5 right-1.5 material-symbols-outlined text-tertiary text-[18px]"
                    >
                      warning
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-lg bg-surface-container-highest border border-outline-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">apparel</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-lg font-body-lg font-medium text-on-surface truncate">{entry.name}</p>
                    <p className="text-label-md font-label-md text-on-surface-variant truncate">
                      {entry.brand ? `${entry.brand} · ` : ''}Cód: {entry.code}
                    </p>
                    <p className="text-label-md font-label-md text-on-surface-variant">
                      {outOfStock
                        ? 'Sem estoque'
                        : singleVariant
                          ? `Tam. ${entry.variants[0].size} · ${entry.variants[0].color} · ${entry.totalStock} un.`
                          : `${entry.variants.length} variações · ${entry.totalStock} un.`}
                    </p>
                    <p className="text-body-md font-body-md font-semibold text-on-surface mt-0.5">
                      {formatCurrency(entry.price)}
                    </p>
                  </div>
                  {!singleVariant && !outOfStock && (
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] flex-shrink-0">
                      chevron_right
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {pickerEntry && (
        <VariantPickerModal
          entry={pickerEntry}
          cartQuantities={cartQuantities}
          onClose={() => setPickerEntry(null)}
          onConfirm={(input, quantity) => {
            onSelect(input, quantity)
            setPickerEntry(null)
          }}
        />
      )}
    </div>
  )
}

export default ProductSearch
