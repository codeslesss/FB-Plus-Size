import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import RequireAuth from './components/auth/RequireAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PDV from './pages/PDV'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Exchanges from './pages/Exchanges'
import SalesHistory from './pages/SalesHistory'

import Purchases from './pages/Purchases'
import FiscalDocuments from './pages/FiscalDocuments'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pdv" element={<PDV />} />
          <Route path="/products" element={<Products />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/fiscal" element={<FiscalDocuments />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/exchanges" element={<Exchanges />} />
          <Route path="/sales-history" element={<SalesHistory />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
