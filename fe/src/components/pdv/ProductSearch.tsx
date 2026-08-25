import { useState } from 'react'
import type { Product } from '../../types/sale'
import { formatCurrency } from '../../utils/currency'

interface ProductSearchProps {
  onSelect: (product: Product) => void
}

const catalog: Product[] = [
  {
    id: '9821',
    code: '9821',
    name: 'Blusa Crepe Manga Longa',
    size: '2XL',
    price: 149.9,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCjoorQQqzYqsLcAPeTj97xM9NbUP4fuvhmSRNesg9e8RmVSdsslydpfOCGwsT-Zc08QHtHlYGm7tVzPUA7PKn_E_2_sRuO29ZOttjXr1aLH35Z7Rhx1W1KBQ9I3w4YZzlIhTUx5EDGYiPoQpy9eFf8WRan_t-6lJJvN34INnSq6jiaqC-zs8K9oNDLp4q6b3Mgl8UeNEc9rS-gAcNFzC9zZkTv5B5_OCuAprEmT5818x6nuopHHM',
  },
  {
    id: '4432',
    code: '4432',
    name: 'Jaqueta Jeans Classic',
    size: 'XL',
    price: 299.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIwt7sitn6pR6Bde3CkUUp_G6fzLpaEC2RoIpBYnwAdJu3bvoGNDKMuED5DudhaKr6BAInjuba8OcxJL79zMS9UCAjv7pkh2WIbexmc66EXC87HFCijJckPzv7s8npx9T_mQSxYk5IBQ5PEvJ3sPrnXZ3yZS6-9a6CbXxIubL6LuQId7oshBcmi3Tw1LtF4gaZKpH64I6HEjwckIKuCn5abandEey10j3N66bbHpEhKPFAJADen9g',
  },
  { id: '5510', code: '5510', name: 'Vestido Longo Manga Curta', size: 'M', price: 189.9 },
  { id: '3305', code: '3305', name: 'Calça Legging Plus Size', size: 'G', price: 99.9 },
  { id: '7788', code: '7788', name: 'Saia Midi Evasê', size: 'GG', price: 129.9 },
]

function ProductSearch({ onSelect }: ProductSearchProps) {
  const [term, setTerm] = useState('')

  const trimmedTerm = term.trim().toLowerCase()
  const results = trimmedTerm
    ? catalog.filter(
        (product) =>
          product.name.toLowerCase().includes(trimmedTerm) || product.code.includes(trimmedTerm),
      )
    : []

  const handleSelect = (product: Product) => {
    onSelect(product)
    setTerm('')
  }

  return (
    <div className="p-md border-b border-outline-variant bg-surface-container relative z-10">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full h-12 bg-background border border-outline-variant rounded-lg pl-xl pr-sm text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant"
          placeholder="Buscar produto por código ou nome"
          type="text"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="absolute left-md right-md mt-1 bg-surface-container-high border border-outline-variant rounded-lg shadow-lg overflow-y-auto max-h-72 z-20">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-sm px-sm py-sm hover:bg-surface-bright transition-colors text-left"
            >
              <div className="w-10 h-10 rounded bg-surface-container-highest border border-outline-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
                {product.image ? (
                  <img className="w-full h-full object-cover" src={product.image} alt={product.name} />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">apparel</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-md font-body-md text-on-surface truncate">{product.name}</p>
                <p className="text-label-md font-label-md text-on-surface-variant">
                  {product.size} · Cód: {product.code}
                </p>
              </div>
              <span className="text-body-md font-body-md font-semibold text-on-surface">
                {formatCurrency(product.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductSearch
