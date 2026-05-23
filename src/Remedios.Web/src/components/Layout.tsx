import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Pill, FileText } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/remedios', label: 'Remédios', icon: Pill, end: false },
  { to: '/receitas', label: 'Receitas', icon: FileText, end: false },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-blue-600">💊 Remédios</h1>
          <p className="text-xs text-gray-400 mt-0.5">Controle de medicamentos</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', {
                  'bg-blue-50 text-blue-700': isActive,
                  'text-gray-600 hover:bg-gray-100': !isActive,
                })
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
