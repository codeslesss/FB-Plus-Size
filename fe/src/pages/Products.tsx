import { useState } from 'react'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsTable from '../components/products/ProductsTable'
import type { CatalogProduct } from '../types/product'

const catalog: CatalogProduct[] = [
  { code: '9821', name: 'Vestido Longo Manga Curta', category: 'Vestidos', price: 189.9, stock: 15 },
  { code: '4432', name: 'Blusa Tricot Gola V', category: 'Blusas', price: 89.9, stock: 8 },
  { code: '1256', name: 'Calça Jeans Flare', category: 'Calças', price: 210.0, stock: 22 },
  { code: '7789', name: 'Saia Midi Estampada', category: 'Saias', price: 145.0, stock: 3 },
]

function Products() {
  const [searchTerm, setSearchTerm] = useState('')

  const trimmedTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = trimmedTerm
    ? catalog.filter(
        (product) =>
          product.name.toLowerCase().includes(trimmedTerm) || product.code.includes(trimmedTerm),
      )
    : catalog

  return (
    <div className="flex flex-col h-full">
      <header className="mb-lg">
        <h1 className="text-headline-lg font-headline-lg text-on-surface hidden md:block">Produtos</h1>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface md:hidden">Produtos</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-xs">
          Gerencie seu catálogo e estoque centralizado.
        </p>
      </header>

      <ProductsToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <ProductsTable products={filteredProducts} />
    </div>
  )
}

export default Products
