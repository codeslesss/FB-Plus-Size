import type { CatalogProduct } from '../../types/product'
import { formatCurrency } from '../../utils/currency'

const LOW_STOCK_THRESHOLD = 5

interface ProductsTableProps {
  products: CatalogProduct[]
}

function ProductsTable({ products }: ProductsTableProps) {
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden flex-1 flex flex-col shadow-sm">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container border-b border-outline-variant">
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Código
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Descrição
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Categoria
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Preço
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Estoque Total
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-body-md font-body-md text-on-surface-variant">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const lowStock = product.stock <= LOW_STOCK_THRESHOLD
                return (
                  <tr
                    key={product.code}
                    className={`hover:bg-surface-container transition-colors group ${lowStock ? 'bg-error-container/5' : ''}`}
                  >
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface font-mono">{product.code}</td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface font-semibold">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-label-md font-label-md">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md text-primary">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-body-md font-body-md">
                      {lowStock ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-container text-on-error-container">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <span className="font-bold">{product.stock} un.</span>
                        </div>
                      ) : (
                        <span className="text-on-surface">{product.stock} un.</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Editar Produto"
                          aria-label={`Editar ${product.name}`}
                          className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          type="button"
                          title="Ajustar Estoque"
                          aria-label={`Ajustar estoque de ${product.name}`}
                          className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-outline-variant bg-surface-container flex items-center justify-between flex-shrink-0">
        <span className="text-label-md font-label-md text-on-surface-variant">
          Mostrando {products.length} de {products.length} produtos
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            aria-label="Página anterior"
            className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            disabled
            aria-label="Próxima página"
            className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductsTable
