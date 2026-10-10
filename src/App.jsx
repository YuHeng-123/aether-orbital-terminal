import EditorialHeader from './components/EditorialHeader'
import TacticalViewportCard from './components/TacticalViewportCard'
import CompanionReconModule from './components/CompanionReconModule'
import TelemetryDeck from './components/TelemetryDeck'

export default function App() {
  return (
    <div className="min-h-screen bg-[#E5E5E7] text-[#111113] relative overflow-x-hidden selection:bg-black selection:text-white">
      {/* Background Editorial Grid Lines & Tick Marks */}
      <div className="fixed inset-0 hud-grid-light pointer-events-none opacity-40" />

      {/* Decorative Outer Frame Corner Marks */}
      <div className="fixed top-3 left-3 text-[10px] font-mono text-zinc-400 pointer-events-none select-none">
        + 00° 00' 00" N
      </div>
      <div className="fixed top-3 right-3 text-[10px] font-mono text-zinc-400 pointer-events-none select-none">
        00° 00' 00" E +
      </div>
      <div className="fixed bottom-3 left-3 text-[10px] font-mono text-zinc-400 pointer-events-none select-none">
        + AETHER-SYS // VER 4.2
      </div>
      <div className="fixed bottom-3 right-3 text-[10px] font-mono text-zinc-400 pointer-events-none select-none">
        SEC.INDEX: 88-A +
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* 1. Swiss Editorial Header */}
        <EditorialHeader />

        {/* 2. Main Hero Tactical Viewport Card */}
        <section aria-label="Orbital Viewport">
          <TacticalViewportCard />
        </section>

        {/* 3. Secondary Bento Grid: SAR Topography + Avionics Radar */}
        <section aria-label="Secondary Telemetry" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <CompanionReconModule />
          <TelemetryDeck />
        </section>

        {/* 4. Swiss Editorial Footer */}
        <footer className="pt-8 border-t border-black/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-mono tracking-widest text-zinc-500 uppercase select-none">
          <div className="space-y-1">
            <p className="font-semibold text-zinc-800">
              AETHER-9 SYNTHETIC APERTURE RADAR (SAR) TELEMETRY TERMINAL
            </p>
            <p className="text-zinc-500">
              AEROSPACE ARCHIVE // DEEP SPACE RECONNAISSANCE DIVISION • NODE CLUSTER 04-G
            </p>
          </div>

          <div className="flex items-center gap-6 sm:text-right">
            <div>
              <span className="text-zinc-400 block">DATA COMPRESSION</span>
              <span className="text-zinc-700 font-semibold">LOSSLESS // 12-BIT</span>
            </div>
            <div>
              <span className="text-zinc-400 block">ENCRYPTION</span>
              <span className="text-emerald-600 font-semibold">QUANTUM-RESISTANT</span>
            </div>
            <div className="hidden md:block">
              <span className="text-zinc-400 block">STATION ID</span>
              <span className="text-zinc-700 font-semibold">AURORA-ORBITAL</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
