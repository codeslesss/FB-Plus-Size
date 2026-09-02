import { useState } from 'react'
import { LOW_STOCK_THRESHOLD, type StockVariant } from '../../types/inventory'

interface InventoryTableProps {
  variants: StockVariant[]
  onAdjustStock: (id: string, newStock: number) => void
  onEdit: (variant: StockVariant) => void
  onDelete: (variant: StockVariant) => void
}

function InventoryTable({ variants, onAdjustStock, onEdit, onDelete }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftStock, setDraftStock] = useState(0)

  const startEditing = (variant: StockVariant) => {
    setEditingId(variant.id)
    setDraftStock(variant.stock)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const confirmEditing = (id: string) => {
    onAdjustStock(id, Math.max(draftStock, 0))
    setEditingId(null)
  }

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
                Produto
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Tamanho
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Categoria
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Estoque
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider">
                Status
              </th>
              <th className="font-label-md text-label-md text-on-surface-variant uppercase px-6 py-4 font-bold tracking-wider text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {variants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-body-md font-body-md text-on-surface-variant">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              variants.map((variant) => {
                const isOut = variant.stock === 0
                const isLow = variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD
                const isEditing = editingId === variant.id

                return (
                  <tr
                    key={variant.id}
                    className={`hover:bg-surface-container transition-colors group ${
                      isOut ? 'bg-error-container/10' : isLow ? 'bg-error-container/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface font-mono">{variant.code}</td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface font-semibold">{variant.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-md bg-surface-container-highest text-on-surface text-label-md font-label-md font-bold">
                        {variant.size}
                      </span>
                      {variant.color && (
                        <span className="ml-2 text-label-md font-label-md text-on-surface-variant">{variant.color}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-label-md font-label-md">
                        {variant.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDraftStock((current) => Math.max(current - 1, 0))}
                            aria-label="Diminuir estoque"
                            className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={draftStock}
                            onChange={(event) => {
                              const parsed = Number(event.target.value.replace(/\D/g, ''))
                              setDraftStock(Number.isNaN(parsed) ? 0 : parsed)
                            }}
                            className="w-14 h-8 text-center bg-background border border-outline-variant rounded font-bold text-on-surface focus:outline-none focus:border-primary-container"
                          />
                          <button
                            type="button"
                            onClick={() => setDraftStock((current) => current + 1)}
                            aria-label="Aumentar estoque"
                            className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-on-surface">{variant.stock} un.</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isOut ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-container text-on-error-container">
                          <span className="material-symbols-outlined text-[16px]">error</span>
                          <span className="font-bold text-label-md font-label-md">Esgotado</span>
                        </div>
                      ) : isLow ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-container text-on-error-container">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          <span className="font-bold text-label-md font-label-md">Baixo</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-md bg-surface-container-highest text-on-surface-variant text-label-md font-label-md">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => confirmEditing(variant.id)}
                            aria-label={`Salvar estoque de ${variant.name} ${variant.size}`}
                            className="p-2 rounded-lg hover:bg-surface-container-highest text-primary-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">check</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            aria-label="Cancelar ajuste"
                            className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => startEditing(variant)}
                            title="Ajustar Estoque"
                            aria-label={`Ajustar estoque de ${variant.name} ${variant.size}`}
                            className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(variant)}
                            title="Editar Produto"
                            aria-label={`Editar ${variant.name}`}
                            className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(variant)}
                            title="Excluir Produto"
                            aria-label={`Excluir ${variant.name}`}
                            className="p-2 rounded-lg hover:bg-error-container/10 text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryTable
