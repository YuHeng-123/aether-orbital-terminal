import { GitCommit, Clock, User, ArrowUpRight } from 'lucide-react'

const activities = [
  {
    user: 'Zhang Wei',
    action: '部署了',
    target: 'api-gateway v2.4.1',
    time: '3 分钟前',
    avatar: 'Z',
    color: 'from-violet-500 to-indigo-600',
  },
  {
    user: 'Li Mei',
    action: '合并了分支',
    target: 'feat/auth-refactor',
    time: '18 分钟前',
    avatar: 'L',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    user: 'System',
    action: '自动扩容',
    target: 'worker-pool → 8 实例',
    time: '42 分钟前',
    avatar: '⚡',
    color: 'from-amber-500 to-orange-600',
  },
  {
    user: 'Wang Jun',
    action: '更新了',
    target: 'pricing-engine 配置',
    time: '1 小时前',
    avatar: 'W',
    color: 'from-pink-500 to-rose-600',
  },
]

export default function ActivityFeed() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-card-title">最近活动</h2>
        <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
          查看全部
          <ArrowUpRight size={12} />
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors group"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 mt-0.5`}>
              {item.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-300 truncate">
                <span className="font-medium text-zinc-200">{item.user}</span>
                {' '}{item.action}{' '}
                <span className="text-zinc-400">{item.target}</span>
              </p>
              <p className="text-[11px] text-zinc-600 mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
