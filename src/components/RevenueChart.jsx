import { useState, useEffect, useRef } from 'react'

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const revenueData = [18200, 22400, 19800, 25600, 28100, 24300, 31200, 29800, 33400, 35100, 31800, 38500]
const expenseData = [12100, 14300, 13200, 16800, 18200, 15600, 19400, 18100, 20200, 21800, 19500, 22100]

export default function RevenueChart() {
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      // Animate the chart in
      let start = null
      const animate = (ts) => {
        if (!start) start = ts
        const progress = Math.min((ts - start) / 800, 1)
        setAnimationProgress(easeOutCubic(progress))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)

  const maxVal = Math.max(...revenueData) * 1.15
  const chartWidth = 100
  const chartHeight = 100

  const toPath = (data, progress) => {
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = chartHeight - (val / maxVal) * chartHeight * progress
      return { x, y }
    })

    // Smooth curve
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3
      const cp1y = points[i].y
      const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) / 3
      const cp2y = points[i + 1].y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`
    }
    return d
  }

  const toAreaPath = (data, progress) => {
    const linePath = toPath(data, progress)
    return `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
  }

  if (loading) {
    return (
      <div className="glass-card p-5 h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="skeleton w-24 h-4 mb-2" />
            <div className="skeleton w-16 h-3" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton w-16 h-6 rounded-md" />
            <div className="skeleton w-16 h-6 rounded-md" />
          </div>
        </div>
        <div className="skeleton w-full h-[200px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="glass-card p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-card-title">营收趋势</h2>
          <p className="text-xs text-zinc-500 mt-1">年度数据概览</p>
        </div>
        <div className="flex gap-1.5 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04]">
            <span className="w-2 h-0.5 rounded-full bg-accent" />
            <span className="text-zinc-400">收入</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04]">
            <span className="w-2 h-0.5 rounded-full bg-zinc-600" />
            <span className="text-zinc-400">支出</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[200px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#71717A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#71717A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="2 2"
            />
          ))}

          {/* Expense area */}
          <path
            d={toAreaPath(expenseData, animationProgress)}
            fill="url(#expenseGrad)"
          />
          <path
            d={toPath(expenseData, animationProgress)}
            fill="none"
            stroke="#52525B"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Revenue area */}
          <path
            d={toAreaPath(revenueData, animationProgress)}
            fill="url(#revenueGrad)"
          />
          <path
            d={toPath(revenueData, animationProgress)}
            fill="none"
            stroke="#6366F1"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          {/* Hover column zones */}
          {months.map((_, i) => {
            const x = (i / (months.length - 1)) * chartWidth
            const colWidth = chartWidth / months.length
            return (
              <rect
                key={i}
                x={x - colWidth / 2}
                y="0"
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-crosshair"
              />
            )
          })}

          {/* Hover line */}
          {hoveredIndex !== null && (
            <line
              x1={(hoveredIndex / (months.length - 1)) * chartWidth}
              y1="0"
              x2={(hoveredIndex / (months.length - 1)) * chartWidth}
              y2={chartHeight}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="3 3"
            />
          )}

          {/* Hover dots */}
          {hoveredIndex !== null && (
            <>
              <circle
                cx={(hoveredIndex / (months.length - 1)) * chartWidth}
                cy={chartHeight - (revenueData[hoveredIndex] / maxVal) * chartHeight * animationProgress}
                r="2"
                fill="#6366F1"
                stroke="#09090B"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={(hoveredIndex / (months.length - 1)) * chartWidth}
                cy={chartHeight - (expenseData[hoveredIndex] / maxVal) * chartHeight * animationProgress}
                r="1.5"
                fill="#71717A"
                stroke="#09090B"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-0 pointer-events-none z-10"
            style={{
              left: `${(hoveredIndex / (months.length - 1)) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="glass-card px-3 py-2 text-xs space-y-1 whitespace-nowrap">
              <p className="text-zinc-400 font-medium">{months[hoveredIndex]}</p>
              <p className="text-zinc-100">
                <span className="inline-block w-2 h-0.5 rounded-full bg-accent mr-1.5 align-middle" />
                <span className="text-metric">${(revenueData[hoveredIndex]).toLocaleString()}</span>
              </p>
              <p className="text-zinc-400">
                <span className="inline-block w-2 h-0.5 rounded-full bg-zinc-600 mr-1.5 align-middle" />
                <span className="text-metric text-zinc-400">${(expenseData[hoveredIndex]).toLocaleString()}</span>
              </p>
            </div>
          </div>
        )}

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-0">
          {months.map((m, i) => (
            <span
              key={m}
              className={`text-[10px] font-mono ${
                hoveredIndex === i ? 'text-zinc-300' : 'text-zinc-600'
              } transition-colors`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
