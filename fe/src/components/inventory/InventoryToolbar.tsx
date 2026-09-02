interface InventoryToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  lowStockOnly: boolean
  onToggleLowStockOnly: () => void
}

function InventoryToolbar({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  lowStockOnly,
  onToggleLowStockOnly,
}: InventoryToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-md mb-md bg-surface-container-low p-sm rounded-xl border border-outline-variant shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm flex-1">
        <div className="relative flex-1 max-w-[28rem]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full h-12 bg-surface-container text-on-surface border border-outline-variant rounded-lg pl-12 pr-4 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-body-md text-body-md transition-all placeholder:text-on-surface-variant"
            placeholder="Buscar por código ou produto..."
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-48">
          <select
            className="w-full h-12 bg-surface-container text-on-surface border border-outline-variant rounded-lg pl-4 pr-10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-body-md text-body-md appearance-none"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleLowStockOnly}
        aria-pressed={lowStockOnly}
        className={`flex items-center justify-center gap-2 px-4 h-12 rounded-lg border text-label-lg font-label-lg font-bold transition-colors active:scale-95 ${
          lowStockOnly
            ? 'border-error text-error bg-error-container/10'
            : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary-container'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">warning</span>
        Somente estoque baixo
      </button>
    </div>
  )
}

export default InventoryToolbar
