import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  GitBranch,
} from 'lucide-react'

const deployments = [
  {
    id: 'dep-001',
    name: 'api-gateway',
    branch: 'main',
    commit: 'a3f9c2d',
    environment: '生产',
    status: 'success',
    time: '2 分钟前',
    duration: '1m 34s',
    user: 'Zhang Wei',
  },
  {
    id: 'dep-002',
    name: 'web-frontend',
    branch: 'feat/redesign',
    commit: 'b7e1f4a',
    environment: '预发布',
    status: 'building',
    time: '5 分钟前',
    duration: '—',
    user: 'Li Mei',
  },
  {
    id: 'dep-003',
    name: 'auth-service',
    branch: 'hotfix/token',
    commit: 'c8d2e5b',
    environment: '生产',
    status: 'success',
    time: '23 分钟前',
    duration: '0m 52s',
    user: 'Wang Jun',
  },
  {
    id: 'dep-004',
    name: 'billing-engine',
    branch: 'main',
    commit: 'e4f6a8c',
    environment: '生产',
    status: 'failed',
    time: '1 小时前',
    duration: '2m 11s',
    user: 'System',
  },
  {
    id: 'dep-005',
    name: 'notification-svc',
    branch: 'develop',
    commit: 'f1a2b3c',
    environment: '开发',
    status: 'queued',
    time: '1 小时前',
    duration: '—',
    user: 'Chen Yu',
  },
]

const statusConfig = {
  success: {
    icon: CheckCircle2,
    label: '成功',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/[0.08]',
  },
  building: {
    icon: Loader2,
    label: '构建中',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500/[0.08]',
    animate: true,
  },
  failed: {
    icon: XCircle,
    label: '失败',
    dotClass: 'bg-red-500',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/[0.08]',
  },
  queued: {
    icon: Clock,
    label: '排队中',
    dotClass: 'bg-zinc-500',
    textClass: 'text-zinc-400',
    bgClass: 'bg-zinc-500/[0.08]',
  },
}

export default function DeploymentTable({ onDelete }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton w-24 h-4" />
          <div className="skeleton w-16 h-6 rounded-md" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="skeleton w-28 h-3" />
              <div className="skeleton w-16 h-3" />
              <div className="skeleton w-12 h-3" />
              <div className="skeleton flex-1 h-3" />
              <div className="skeleton w-14 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-card-title">部署记录</h2>
        <span className="text-micro">{deployments.length} 条记录</span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_80px_80px_80px_40px] gap-3 px-2 pb-2 border-b border-white/[0.06] text-micro">
        <span>服务</span>
        <span>环境</span>
        <span>状态</span>
        <span>用时</span>
        <span>时间</span>
        <span />
      </div>

      {/* Table body */}
      <div className="divide-y divide-white/[0.04]">
        {deployments.map((dep) => {
          const config = statusConfig[dep.status]
          const StatusIcon = config.icon
          return (
            <div
              key={dep.id}
              className="grid grid-cols-[1fr_100px_80px_80px_80px_40px] gap-3 px-2 py-3 items-center hover:bg-white/[0.02] transition-colors group"
            >
              {/* Service */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-200 font-medium truncate">{dep.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <GitBranch size={10} className="text-zinc-600 flex-shrink-0" />
                  <span className="text-[11px] text-zinc-600 font-mono truncate">{dep.branch}</span>
                  <span className="text-[11px] text-zinc-700 font-mono">{dep.commit}</span>
                </div>
              </div>

              {/* Environment */}
              <span className={`text-xs px-2 py-0.5 rounded-md w-fit ${
                dep.environment === '生产'
                  ? 'bg-accent/[0.08] text-accent'
                  : dep.environment === '预发布'
                  ? 'bg-amber-500/[0.08] text-amber-400'
                  : 'bg-white/[0.04] text-zinc-500'
              }`}>
                {dep.environment}
              </span>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <StatusIcon
                  size={13}
                  className={`${config.textClass} ${config.animate ? 'animate-spin' : ''}`}
                />
                <span className={`text-xs ${config.textClass}`}>{config.label}</span>
              </div>

              {/* Duration */}
              <span className="text-metric text-xs text-zinc-500">{dep.duration}</span>

              {/* Time */}
              <span className="text-xs text-zinc-600 truncate">{dep.time}</span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {dep.status === 'success' && (
                  <button
                    onClick={() => onDelete?.({ type: 'rollback', name: dep.name, id: dep.id })}
                    className="p-1 rounded hover:bg-white/[0.06] text-zinc-600 hover:text-zinc-400 transition-colors"
                    title="回滚"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
