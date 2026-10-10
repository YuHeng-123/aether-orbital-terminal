import { useState, useEffect } from 'react'
import {
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  ArrowUpRight,
} from 'lucide-react'

const services = [
  { name: 'API Gateway', icon: Globe, status: 'online', latency: '12ms', uptime: '99.99%' },
  { name: 'PostgreSQL', icon: Database, status: 'online', latency: '4ms', uptime: '99.98%' },
  { name: 'Redis Cache', icon: Server, status: 'online', latency: '1ms', uptime: '100%' },
  { name: 'Worker Queue', icon: Cpu, status: 'warning', latency: '89ms', uptime: '99.82%' },
  { name: 'CDN Edge', icon: Wifi, status: 'online', latency: '8ms', uptime: '99.99%' },
  { name: 'Object Storage', icon: HardDrive, status: 'online', latency: '22ms', uptime: '99.97%' },
]

export default function SystemStatus() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton w-20 h-4" />
          <div className="skeleton w-12 h-3" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-5 h-5 rounded" />
              <div className="skeleton flex-1 h-3" />
              <div className="skeleton w-10 h-3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-card-title">系统状态</h2>
        <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
          详情
          <ArrowUpRight size={12} />
        </button>
      </div>

      <div className="space-y-1">
        {services.map(({ name, icon: Icon, status, latency, uptime }) => (
          <div
            key={name}
            className="flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors group"
          >
            <Icon size={15} className="text-zinc-600 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
            <span className="text-sm text-zinc-300 flex-1 truncate">{name}</span>
            <span className="text-metric text-xs text-zinc-500">{latency}</span>
            <span className={`status-dot ${
              status === 'online' ? 'status-dot-online' :
              status === 'warning' ? 'status-dot-warning' :
              'status-dot-danger'
            }`} />
          </div>
        ))}
      </div>

      {/* Overall status bar */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-micro">全局可用性</span>
          <span className="text-metric text-sm text-emerald-400">99.96%</span>
        </div>
        <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: '99.96%' }}
          />
        </div>
      </div>
    </div>
  )
}
