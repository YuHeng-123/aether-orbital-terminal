import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Radio, Compass, Orbit } from 'lucide-react'
import { toggleAudio, isAudioEnabled, playClick } from '../utils/audio'

export default function EditorialHeader() {
  const [audioActive, setAudioActive] = useState(isAudioEnabled())
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = String(now.getUTCHours()).padStart(2, '0')
      const minutes = String(now.getUTCMinutes()).padStart(2, '0')
      const seconds = String(now.getUTCSeconds()).padStart(2, '0')
      const ms = String(Math.floor(now.getUTCMilliseconds() / 10)).padStart(2, '0')
      setTime(`T+${hours}:${minutes}:${seconds}.${ms} UTC`)
    }
    const timer = setInterval(updateClock, 30)
    return () => clearInterval(timer)
  }, [])

  const handleAudioToggle = () => {
    const newState = toggleAudio()
    setAudioActive(newState)
  }

  return (
    <header className="w-full border-b border-black/[0.08] pb-6 mb-8 select-none">
      {/* Top Meta Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-block px-1.5 py-0.5 rounded bg-black/5 text-black font-semibold">
            ISSUE NO. 88-A
          </span>
          <span className="hidden sm:inline">AEROSPACE TACTICAL SPECIFICATION</span>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-700 font-semibold">CLASSIFIED: LEVEL 4</span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-1.5 text-zinc-700">
            <Radio size={12} className="text-emerald-600 animate-pulse" />
            <span className="font-mono tabular-nums">{time || 'T+00:00:00.00 UTC'}</span>
          </div>

          <button
            onClick={handleAudioToggle}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-mono transition-colors
              ${audioActive
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-zinc-600 border-zinc-300 hover:border-zinc-500'
              }
            `}
            title="Toggle tactical audio sound effects"
          >
            {audioActive ? <Volume2 size={11} /> : <VolumeX size={11} />}
            <span>AUDIO FX: {audioActive ? 'ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Banner & Swiss Editorial Structure */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Orbit size={18} className="text-black" />
            <span className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase">
              PROJECT AETHER-9 // AEROSPACE TELEMETRY
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-[#111113] uppercase leading-[0.95]">
            Orbital Observation
          </h1>
        </div>

        {/* Editorial Index Description */}
        <div className="max-w-md lg:text-right">
          <p className="text-xs text-zinc-600 font-mono leading-relaxed uppercase">
            Synthetic aperture radar & orbital reconnaissance array.
            Real-time multispectral sensor telemetry synchronized across 24 localized deep-space satellite nodes.
          </p>
          <div className="flex items-center lg:justify-end gap-3 mt-2 text-[10px] font-mono text-zinc-400">
            <span>AZ: 148.2°</span>
            <span>•</span>
            <span>ELEV: 62.4°</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">+ LINK SYNCHRONIZED</span>
          </div>
        </div>
      </div>
    </header>
  )
}
