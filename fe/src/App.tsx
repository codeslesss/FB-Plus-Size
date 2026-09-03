import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import PDV from './pages/PDV'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Exchanges from './pages/Exchanges'
import SalesHistory from './pages/SalesHistory'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pdv" element={<PDV />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/exchanges" element={<Exchanges />} />
        <Route path="/sales-history" element={<SalesHistory />} />
      </Route>
    </Routes>
  )
}

export default App
