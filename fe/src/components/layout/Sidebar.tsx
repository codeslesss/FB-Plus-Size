import { Link, NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Nova Venda (PDV)', path: '/pdv', icon: 'point_of_sale' },
  { label: 'Produtos', path: '/products', icon: 'apparel' },
  { label: 'Estoque', path: '/inventory', icon: 'inventory_2' },
  { label: 'Trocas/Devoluções', path: '/exchanges', icon: 'rebase_edit' },
  { label: 'Histórico de Vendas', path: '/sales-history', icon: 'history' },
]

function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col h-screen py-md px-sm fixed left-0 top-0 z-40 bg-surface-container-low border-r border-outline-variant w-[280px]">
      <div className="flex items-center gap-sm px-sm mb-lg">
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
          <img
            alt="Logo da FB Plus Size"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAfrwACrQUcnDa1gSH2S-KHAoRLuoT_93qG6gRyF3d60WsWOUKrZPsBD0AY0LaeaihCxayeI9LXO0wX8rcOwZSRlk8wl2vrr6FPsXSRhcEg20IDZvv5cHQLVSSRTaKkQlTj96FukdLMZm5SPV9_BP6JB0OYx6qAG2slETW54Pe2-H6DuxfWghE08zVmP2SZX9NlqohkdGZaSZj3tN56fkAPIi8y2TXWMcdKyei5Gkyqp9vegwgoZ8"
          />
        </div>
        <div>
          <h2 className="text-headline-sm font-headline-sm font-bold text-primary">FB Plus Size</h2>
          <p className="text-label-md font-label-md text-on-surface-variant">PDV Varejo Premium</p>
        </div>
      </div>

      <div className="mb-lg px-sm">
        <Link
          to="/pdv"
          className="w-full bg-primary-container text-white rounded-lg h-touch-target flex items-center justify-center font-label-lg text-label-lg font-bold hover:bg-opacity-90 active:scale-95 transition-all"
        >
          + Nova Venda
        </Link>
      </div>

      <ul className="flex flex-col gap-xs flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-sm px-sm py-sm rounded-lg text-label-lg font-label-lg transition-all',
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar
