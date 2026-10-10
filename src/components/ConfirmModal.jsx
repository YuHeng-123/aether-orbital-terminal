import { useState, useRef, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ action, onConfirm, onCancel }) {
  const [holding, setHolding] = useState(false)
  const [completed, setCompleted] = useState(false)
  const timerRef = useRef(null)

  const handlePointerDown = useCallback(() => {
    setHolding(true)
    timerRef.current = setTimeout(() => {
      setCompleted(true)
      setTimeout(onConfirm, 300)
    }, 2000)
  }, [onConfirm])

  const handlePointerUp = useCallback(() => {
    if (!completed) {
      setHolding(false)
      clearTimeout(timerRef.current)
    }
  }, [completed])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative glass-card p-6 w-full max-w-sm mx-4 animate-scale-in border-red-500/20">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Warning Icon */}
        <div className="w-10 h-10 rounded-xl bg-red-500/[0.1] flex items-center justify-center mb-4">
          <AlertTriangle size={18} className="text-red-400" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold tracking-tight text-zinc-100 mb-1.5">
          确认{action?.type === 'rollback' ? '回滚' : '删除'}操作
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          您即将对 <span className="text-zinc-200 font-medium">{action?.name}</span> 执行
          {action?.type === 'rollback' ? '回滚' : '删除'}操作。此操作不可逆，请长按下方按钮 2 秒确认。
        </p>

        {/* Press-and-hold button */}
        <div className="space-y-3">
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`
              press-hold-btn w-full py-2.5 px-4 rounded-lg
              bg-red-500/[0.1] border border-red-500/20
              text-red-400 text-sm font-medium
              hover:bg-red-500/[0.15] hover:border-red-500/30
              transition-colors select-none relative overflow-hidden
              ${holding ? 'holding' : ''}
              ${completed ? 'bg-red-500/[0.25]' : ''}
            `}
          >
            <span className="fill-bar" />
            <span className="relative z-10">
              {completed ? '✓ 已确认' : holding ? '请继续按住…' : '长按 2 秒确认'}
            </span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 px-4 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
