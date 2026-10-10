import { Rocket, GitBranch, RefreshCcw, Download } from 'lucide-react'

const actions = [
  { icon: Rocket, label: '部署', desc: '部署至生产环境', accent: true },
  { icon: GitBranch, label: '分支', desc: '创建新分支' },
  { icon: RefreshCcw, label: '回滚', desc: '回滚至上一版本' },
  { icon: Download, label: '导出', desc: '导出数据报告' },
]

export default function QuickActions() {
  return (
    <div className="glass-card p-5">
      <h2 className="text-card-title mb-3">快捷操作</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ icon: Icon, label, desc, accent }) => (
          <button
            key={label}
            className={`
              flex flex-col items-start gap-1.5 p-3 rounded-lg border
              transition-all duration-150 group text-left
              active:scale-[0.97]
              ${accent
                ? 'bg-accent/[0.08] border-accent/20 hover:bg-accent/[0.14] hover:border-accent/30'
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
              }
            `}
          >
            <Icon
              size={16}
              className={accent ? 'text-accent' : 'text-zinc-500 group-hover:text-zinc-400'}
            />
            <div>
              <p className={`text-xs font-medium ${accent ? 'text-accent' : 'text-zinc-300'}`}>{label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
