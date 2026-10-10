import { Bell, ChevronDown, Plus } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.08] bg-canvas flex-shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">控制台</span>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-100 font-medium">概览</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* New Project Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-all duration-150 active:scale-[0.97]">
          <Plus size={14} />
          <span>新项目</span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-150">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-white/[0.04] transition-all duration-150">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-semibold text-white">
            A
          </div>
          <span className="text-sm text-zinc-300 hidden sm:inline">Admin</span>
          <ChevronDown size={12} className="text-zinc-600" />
        </button>
      </div>
    </header>
  )
}
