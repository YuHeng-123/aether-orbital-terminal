import { useState, useEffect } from 'react'
import {
  DollarSign,
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

const iconMap = {
  'dollar-sign': DollarSign,
  'users': Users,
  'activity': Activity,
  'shield-check': ShieldCheck,
}

export default function MetricCard({ title, value, change, period, icon, status, className = '' }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200 + Math.random() * 800)
    return () => clearTimeout(timer)
  }, [])

  const Icon = iconMap[icon] || Activity
  const isPositive = change >= 0

  if (loading) {
    return (
      <div className={`glass-card p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton w-20 h-3" />
          <div className="skeleton w-8 h-8 rounded-lg" />
        </div>
        <div className="skeleton w-28 h-7 mb-3" />
        <div className="skeleton w-16 h-3" />
      </div>
    )
  }

  return (
    <div className={`glass-card p-5 group ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-micro">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
          <Icon size={16} className="text-zinc-500" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-metric text-2xl tracking-tight">{value}</span>
        {status && (
          <span className={`status-dot ${
            status === 'online' ? 'status-dot-online' :
            status === 'warning' ? 'status-dot-warning' :
            'status-dot-danger'
          }`} />
        )}
      </div>

      {/* Change */}
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-0.5 text-xs font-medium ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-zinc-600">{period}</span>
      </div>
    </div>
  )
}
