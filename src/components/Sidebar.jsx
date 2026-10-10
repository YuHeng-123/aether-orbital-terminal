import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Shield,
  Layers,
  Zap,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Boxes,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: '概览', active: true },
  { icon: BarChart3, label: '数据分析' },
  { icon: Layers, label: '项目' },
  { icon: Boxes, label: '部署' },
  { icon: Users, label: '团队' },
  { icon: Zap, label: '自动化' },
  { icon: Shield, label: '安全' },
  { icon: Bell, label: '通知' },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`
        flex flex-col h-full border-r border-white/[0.08] bg-canvas
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-[60px]' : 'w-[220px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-white/[0.08]">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="ml-3 text-sm font-semibold tracking-tight text-zinc-100 truncate">
            Aurora
          </span>
        )}
      </div>

      {/* Search (only when expanded) */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-500 text-xs">
            <Search size={13} />
            <span>搜索…</span>
            <kbd className="ml-auto text-[10px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-600">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`
              w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm
              transition-all duration-150 group
              ${active
                ? 'bg-white/[0.06] text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? label : undefined}
          >
            <Icon
              size={16}
              className={`flex-shrink-0 ${active ? 'text-accent' : 'text-zinc-500 group-hover:text-zinc-400'}`}
            />
            {!collapsed && <span className="truncate">{label}</span>}
            {active && !collapsed && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </nav>

      {/* Settings + Collapse */}
      <div className="px-2 py-3 border-t border-white/[0.08] space-y-1">
        <button
          className={`
            w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm
            text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]
            transition-all duration-150
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && <span>设置</span>}
        </button>
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm
            text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]
            transition-all duration-150
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {collapsed
            ? <ChevronsRight size={16} className="flex-shrink-0" />
            : <ChevronsLeft size={16} className="flex-shrink-0" />
          }
          {!collapsed && <span>收起侧栏</span>}
        </button>
      </div>
    </aside>
  )
}
