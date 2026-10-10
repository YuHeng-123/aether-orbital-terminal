import { useState } from 'react'
import { Mountain, Sliders, Activity, Radar, Compass } from 'lucide-react'
import { playTick, playClick } from '../utils/audio'
import { getAssetUrl } from '../utils/assets'

export default function CompanionReconModule() {
  const [resolution, setResolution] = useState(1.2)
  const [elevationLevel, setElevationLevel] = useState(420)

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value)
    setResolution(val)
    playTick()
  }

  return (
    <div className="group relative rounded-3xl bg-[#101012] overflow-hidden border border-white/10 p-6 flex flex-col justify-between shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] select-none">
      {/* Background Satellite Topo Scan */}
      <img
        src={getAssetUrl('planetary_recon.jpg')}
        alt="Planetary Topography Recon"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60 pointer-events-none" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Radar size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase">
            SAR TOPOGRAPHY // KOROLOV BASIN
          </span>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
          BAND-X // 9.6 GHZ
        </span>
      </div>

      {/* Center Visual HUD: Elevation Contour Diagram */}
      <div className="relative z-10 py-6">
        <div className="bg-black/60 rounded-xl p-4 border border-white/10 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
            <span className="flex items-center gap-1.5">
              <Mountain size={12} className="text-cyan-400" />
              ELEVATION PROFILE
            </span>
            <span className="text-white/40">CRATER DEPTH: -4,280M</span>
          </div>

          {/* SVG Topographical Waveform / Cross-section */}
          <div className="h-20 w-full relative">
            <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="topoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Baseline Grid */}
              <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

              {/* Terrain Curve */}
              <path
                d="M 0 35 Q 30 30 60 48 T 120 65 T 150 72 T 180 62 T 230 25 T 300 38"
                fill="none"
                stroke="#2DD4BF"
                strokeWidth="2"
              />
              <path
                d="M 0 35 Q 30 30 60 48 T 120 65 T 150 72 T 180 62 T 230 25 T 300 38 L 300 80 L 0 80 Z"
                fill="url(#topoGrad)"
              />

              {/* Peak Marker */}
              <circle cx="230" cy="25" r="3" fill="#2DD4BF" />
              <text x="230" y="18" fill="#2DD4BF" fontSize="8" fontFamily="monospace" textAnchor="middle">
                PEAK +1,420M
              </text>

              {/* Basin Marker */}
              <circle cx="150" cy="72" r="3" fill="#F43F5E" />
              <text x="150" y="80" fill="#F43F5E" fontSize="8" fontFamily="monospace" textAnchor="middle">
                FLOOR -4,280M
              </text>
            </svg>
          </div>

          {/* Interactive Resolution Slider */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-white/50">
              <span>SCAN APERTURE RES</span>
              <span className="text-cyan-400 font-semibold">{resolution.toFixed(1)}M / PIXEL</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={resolution}
              onChange={handleSliderChange}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Metrics */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/60">
        <div>
          <span className="text-white/30 block text-[8px]">TARGET QUADRANT</span>
          <span className="text-white/90">SEC-99 / TYCHO</span>
        </div>
        <div>
          <span className="text-white/30 block text-[8px]">REFLECTIVITY</span>
          <span className="text-emerald-400">-14.2 DB</span>
        </div>
        <div>
          <span className="text-white/30 block text-[8px]">SURFACE MATERIAL</span>
          <span className="text-white/90">BASALT / ANORTHOSITE</span>
        </div>
      </div>
    </div>
  )
}
