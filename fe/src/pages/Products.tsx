import { useMemo, useState } from 'react'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsTable from '../components/products/ProductsTable'
import NewProductModal from '../components/products/NewProductModal'
import EditProductModal from '../components/products/EditProductModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import AsyncState from '../components/common/AsyncState'
import { useNotifications } from '../context/NotificationsContext'
import { fetchProducts, deleteProduct } from '../api/products'
import { useApi } from '../hooks/useApi'
import { ApiError } from '../api/client'
import type { CatalogProduct } from '../types/product'

function Products() {
  const { notify } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<CatalogProduct | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { data, loading, error, reload } = useApi(() => fetchProducts({ active: true }), [])

  const catalog: CatalogProduct[] = (data ?? []).map((product) => ({
    id: product.id,
    code: product.sku,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    description: product.description,
    stock: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
  }))

  const existingCategories = useMemo(() => Array.from(new Set(catalog.map((product) => product.category))), [catalog])

  const trimmedTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = trimmedTerm
    ? catalog.filter(
        (product) =>
          product.name.toLowerCase().includes(trimmedTerm) || product.code.includes(trimmedTerm),
      )
    : catalog

  const handleCreated = () => {
    reload()
    notify({
      title: 'Produto Cadastrado',
      message: 'O novo produto já está disponível no catálogo.',
      icon: 'check_circle',
      variant: 'info',
    })
  }

  const handleUpdated = () => {
    reload()
    notify({
      title: 'Produto Atualizado',
      message: 'As alterações foram salvas com sucesso.',
      icon: 'check_circle',
      variant: 'info',
    })
  }

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return
    setDeleting(true)
    try {
      await deleteProduct(deletingProduct.id)
      setDeletingProduct(null)
      reload()
      notify({
        title: 'Produto Excluído',
        message: `${deletingProduct.name} foi removido do catálogo.`,
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

  return (
    <div className="flex flex-col h-full">
      <header className="mb-lg">
        <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Produtos</h1>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Produtos</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-xs">
          Gerencie seu catálogo e estoque centralizado.
        </p>
      </header>

      <ProductsToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} onNewProduct={() => setShowNewProduct(true)} />

      {error ? (
        <AsyncState error={error} onRetry={reload} />
      ) : loading ? (
        <p className="text-body-md font-body-md text-on-surface-variant">Carregando produtos...</p>
      ) : (
        <ProductsTable
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={setDeletingProduct}
        />
      )}

      {showNewProduct && (
        <NewProductModal
          existingCategories={existingCategories}
          onClose={() => setShowNewProduct(false)}
          onCreated={handleCreated}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={{
            id: editingProduct.id,
            name: editingProduct.name,
            sku: editingProduct.code,
            category: editingProduct.category,
            price: editingProduct.price,
            description: editingProduct.description,
          }}
          existingCategories={existingCategories}
          onClose={() => setEditingProduct(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deletingProduct && (
        <ConfirmDialog
          title="Excluir Produto"
          message={`Tem certeza que deseja excluir "${deletingProduct.name}"? Essa ação remove o produto do catálogo e do estoque.`}
          confirmLabel="Excluir"
          destructive
          submitting={deleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingProduct(null)}
        />
      )}
    </div>
  )
}

export default Products
