import { useMemo, useState } from 'react'
import MetricCard from '../components/dashboard/MetricCard'
import InventoryToolbar from '../components/inventory/InventoryToolbar'
import InventoryTable from '../components/inventory/InventoryTable'
import EditProductModal from '../components/products/EditProductModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import AsyncState from '../components/common/AsyncState'
import { useNotifications } from '../context/NotificationsContext'
import { fetchInventory, adjustStock as adjustStockApi } from '../api/inventory'
import { deleteProduct } from '../api/products'
import { useApi } from '../hooks/useApi'
import { LOW_STOCK_THRESHOLD, type StockVariant } from '../types/inventory'
import { formatCurrency } from '../utils/currency'
import { ApiError } from '../api/client'

function Inventory() {
  const { notify } = useNotifications()
  const { data, loading, error, reload } = useApi(() => fetchInventory(), [])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [editingVariant, setEditingVariant] = useState<StockVariant | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<StockVariant | null>(null)
  const [deleting, setDeleting] = useState(false)

  const variants: StockVariant[] = (data ?? []).map((variant) => ({
    id: variant.id,
    productId: variant.product.id,
    code: variant.product.sku,
    name: variant.product.name,
    category: variant.product.category,
    size: variant.size,
    color: variant.color,
    price: Number(variant.product.price),
    description: variant.product.description,
    stock: variant.stockQuantity,
  }))

  const categories = useMemo(() => Array.from(new Set(variants.map((variant) => variant.category))), [variants])

  const handleAdjustStock = async (id: string, newStock: number) => {
    const current = variants.find((variant) => variant.id === id)
    if (!current) return
    const delta = newStock - current.stock
    if (delta === 0) return

    try {
      await adjustStockApi(id, delta)
      reload()
    } catch (err) {
      notify({
        title: 'Erro ao Ajustar Estoque',
        message: err instanceof ApiError ? err.message : 'Não foi possível salvar o ajuste. Tente novamente.',
        icon: 'error',
        variant: 'error',
      })
    }
  }

  const trimmedTerm = searchTerm.trim().toLowerCase()
  const filteredVariants = variants.filter((variant) => {
    const matchesTerm =
      !trimmedTerm || variant.name.toLowerCase().includes(trimmedTerm) || variant.code.includes(trimmedTerm)
    const matchesCategory = !category || variant.category === category
    const matchesLowStock = !lowStockOnly || variant.stock <= LOW_STOCK_THRESHOLD
    return matchesTerm && matchesCategory && matchesLowStock
  })

  const handleConfirmDelete = async () => {
    if (!deletingVariant) return
    setDeleting(true)
    try {
      await deleteProduct(deletingVariant.productId)
      setDeletingVariant(null)
      reload()
      notify({
        title: 'Produto Excluído',
        message: `${deletingVariant.name} foi removido do catálogo.`,
        icon: 'check_circle',
        variant: 'info',
      })
    } catch (err) {
      notify({
        title: 'Erro ao Excluir Produto',
        message: err instanceof ApiError ? err.message : 'Não foi possível excluir o produto. Tente novamente.',
        icon: 'error',
        variant: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  const outOfStockCount = variants.filter((variant) => variant.stock === 0).length
  const lowStockCount = variants.filter((variant) => variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD).length
  const totalValue = variants.reduce((sum, variant) => sum + variant.price * variant.stock, 0)

  return (
    <div className="flex flex-col h-full">
      <header className="mb-lg">
        <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Estoque</h1>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Estoque</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-xs">
          Controle o estoque por tamanho e ajuste quantidades rapidamente.
        </p>
      </header>

      {error ? (
        <AsyncState error={error} onRetry={reload} />
      ) : loading ? (
        <p className="text-body-md font-body-md text-on-surface-variant">Carregando estoque...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-md">
            <MetricCard label="SKUs Cadastrados" value={String(variants.length)} />
            <MetricCard label="Itens em Falta" value={String(outOfStockCount)} emphasize={outOfStockCount > 0} />
            <MetricCard label="Estoque Baixo" value={String(lowStockCount)} />
            <MetricCard label="Valor em Estoque" value={formatCurrency(totalValue)} />
          </div>

          <InventoryToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            category={category}
            onCategoryChange={setCategory}
            categories={categories}
            lowStockOnly={lowStockOnly}
            onToggleLowStockOnly={() => setLowStockOnly((current) => !current)}
          />

          <InventoryTable
            variants={filteredVariants}
            onAdjustStock={handleAdjustStock}
            onEdit={setEditingVariant}
            onDelete={setDeletingVariant}
          />
        </>
      )}

      {editingVariant && (
        <EditProductModal
          product={{
            id: editingVariant.productId,
            name: editingVariant.name,
            sku: editingVariant.code,
            category: editingVariant.category,
            price: editingVariant.price,
            description: editingVariant.description,
          }}
          existingCategories={categories}
          onClose={() => setEditingVariant(null)}
          onUpdated={reload}
        />
      )}

      {deletingVariant && (
        <ConfirmDialog
          title="Excluir Produto"
          message={`Tem certeza que deseja excluir "${deletingVariant.name}"? Essa ação remove o produto do catálogo e de todas as suas variantes no estoque.`}
          confirmLabel="Excluir"
          destructive
          submitting={deleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingVariant(null)}
        />
      )}
    </div>
  )
}

export default Inventory
