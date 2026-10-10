import { useState, useEffect } from 'react'
import { Radio, Satellite, Compass, Activity, Wifi, ShieldAlert, Cpu } from 'lucide-react'
import { playClick, playTick } from '../utils/audio'

export default function TelemetryDeck() {
  const [radarAngle, setRadarAngle] = useState(0)
  const [carrierFreq, setCarrierFreq] = useState(1420.405)
  const [uplinkPower, setUplinkPower] = useState(84)

  // Rotating radar sweep
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360)
    }, 30)
    return () => clearInterval(timer)
  }, [])

  const handleFreqChange = (delta) => {
    setCarrierFreq((prev) => +(prev + delta).toFixed(3))
    playTick()
  }

  return (
    <div className="rounded-3xl bg-[#101012] border border-white/10 p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] text-white select-none flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Satellite size={14} className="text-emerald-400" />
          <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase">
            ORBITAL AVIONICS & TELEMETRY
          </span>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          UPLINK ACTIVE
        </span>
      </div>

      {/* Main Grid: Radar Scope + Orbital Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 items-center">
        
        {/* Radar Vector Scope */}
        <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded-2xl border border-white/5 relative">
          <div className="w-36 h-36 rounded-full border border-white/20 relative flex items-center justify-center">
            {/* Concentric distance rings */}
            <div className="w-24 h-24 rounded-full border border-dashed border-white/15" />
            <div className="w-12 h-12 rounded-full border border-white/10" />

            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-white/10" />
              <div className="h-full w-[1px] bg-white/10 absolute" />
            </div>

            {/* Rotating Radar Sweep Arm */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ transform: `rotate(${radarAngle}deg)` }}
            >
              <div className="w-1/2 h-[1.5px] bg-gradient-to-r from-emerald-400/80 to-transparent absolute top-1/2 left-1/2 origin-left" />
            </div>

            {/* Radar Target Echo Blips */}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-8 right-10 animate-ping" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-8 right-10" />
            
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute bottom-10 left-8" />

            {/* Center Satellite Node */}
            <div className="w-2 h-2 rounded-full bg-white relative z-10 shadow-glow" />
          </div>

          <div className="flex items-center justify-between w-full mt-3 text-[9px] font-mono text-white/50">
            <span>RANGE: 800KM</span>
            <span className="text-emerald-400">TARGETS: 02 DETECTED</span>
          </div>
        </div>

        {/* Orbital Mechanics Readout */}
        <div className="space-y-3 font-mono">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[8px] text-white/40 block">APOGEE // PERIGEE</span>
            <div className="flex justify-between text-xs text-white/90">
              <span>APO: 418.2 KM</span>
              <span className="text-white/40">|</span>
              <span>PER: 406.8 KM</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[8px] text-white/40 block">ORBITAL INCLINATION & PERIOD</span>
            <div className="flex justify-between text-xs text-white/90">
              <span>INC: 51.64°</span>
              <span className="text-white/40">|</span>
              <span>PERIOD: 92.6 MIN</span>
            </div>
          </div>

          {/* Carrier Frequency Tuner */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex justify-between text-[8px] text-white/40">
              <span>CARRIER FREQUENCY</span>
              <span className="text-emerald-400 font-semibold">{carrierFreq} MHZ</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleFreqChange(-0.025)}
                className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 text-[9px] transition-colors"
              >
                - 25 KHZ
              </button>
              <button
                onClick={() => handleFreqChange(+0.025)}
                className="flex-1 py-1 rounded bg-white/10 hover:bg-white/20 text-[9px] transition-colors"
              >
                + 25 KHZ
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Subsystem Status */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/60">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>PHASED ARRAY: NORMAL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>STAR TRACKER: LOCKED</span>
        </div>
        <div className="text-white/40">
          BUS VOLTAGE: 28.4V
        </div>
      </div>
    </div>
  )
}
