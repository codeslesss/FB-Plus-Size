interface ProductsToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onNewProduct: () => void
}

function ProductsToolbar({ searchTerm, onSearchChange, onNewProduct }: ProductsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-md mb-md bg-surface-container-low p-sm rounded-xl border border-outline-variant shadow-sm">
      <div className="relative flex-1 max-w-[28rem]">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full h-12 bg-surface-container text-on-surface border border-outline-variant rounded-lg pl-12 pr-4 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-body-md text-body-md transition-all placeholder:text-on-surface-variant"
          placeholder="Buscar por código ou descrição..."
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="flex items-center gap-sm">
        <button
          type="button"
          onClick={onNewProduct}
          className="flex items-center gap-2 px-6 h-touch-target rounded-lg bg-primary-container text-white font-label-lg text-label-lg font-bold hover:brightness-110 transition-all active:scale-95 shadow-md shadow-primary-container/20"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Produto
        </button>
      </div>
    </div>
  )
}

export default ProductsToolbar
