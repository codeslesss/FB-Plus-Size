import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import PDV from './pages/PDV'
import Products from './pages/Products'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pdv" element={<PDV />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Placeholder title="Estoque" />} />
        <Route path="/exchanges" element={<Placeholder title="Trocas/Devoluções" />} />
        <Route path="/sales-history" element={<Placeholder title="Histórico de Vendas" />} />
        <Route path="/fiscal-reports" element={<Placeholder title="Relatórios Fiscais" />} />
        <Route path="/settings" element={<Placeholder title="Configurações" />} />
      </Route>
    </Routes>
  )
}

export default App
