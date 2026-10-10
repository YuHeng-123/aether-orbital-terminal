import { useState, useRef, useEffect } from 'react'
import {
  Crosshair,
  Radio,
  Eye,
  Flame,
  Scan,
  Maximize2,
  Minimize2,
  Lock,
  Compass,
  Layers,
  Box,
  Image,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  Sliders,
  HelpCircle,
  RotateCw,
  AlertTriangle,
  FastForward,
  Play,
  Pause,
  Sun,
  Map,
} from 'lucide-react'
import {
  playClick,
  playModeChirp,
  playLockOn,
  playThrusterWhoosh,
  playInspectionPing,
  startCabinHum,
  stopCabinHum,
  playKlaxonAlarm,
  playTelemetryChirp,
} from '../utils/audio'
import Orbital3DCanvas from './Orbital3DCanvas'
import Earth3DGlobe from './Earth3DGlobe'
import ModuleInspectionDrawer from './ModuleInspectionDrawer'
import MercatorGroundTrackRadar from './MercatorGroundTrackRadar'
import SolarSystemOrrery from './SolarSystemOrrery'

export default function TacticalViewportCard() {
  const [renderMode, setRenderMode] = useState('webgl') // 'webgl' (Real 3D ISS) | 'earth' | 'cinematic'
  const [mode, setMode] = useState('optical') // 'optical' | 'infrared' | 'sar'
  const [locked, setLocked] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [smoothPos, setSmoothPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [thrusterActive, setThrusterActive] = useState(false)
  const [activeModule, setActiveModule] = useState(null)
  const [cabinHumOn, setCabinHumOn] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ADVANCED TACTICAL CONTROLS (Option A)
  const [redAlert, setRedAlert] = useState(false)
  const [timeWarp, setTimeWarp] = useState(1) // 1, 10, 50, 0 (pause)
  const [solarBetaAngle, setSolarBetaAngle] = useState(0) // -30, 0, 30
  const [showRadar, setShowRadar] = useState(false) // Toggle 2D Mercator Radar deck

  const [telemetry, setTelemetry] = useState({
    azimuth: 284.4,
    range: 412.8,
    lat: 34.0522,
    lon: -118.2437,
    signal: 99.8,
    radiation: 14.2, // micro-Sv/h
  })

  const cardRef = useRef(null)

  // Periodic automatic RCS micro-thruster burst
  useEffect(() => {
    const timer = setInterval(() => {
      setThrusterActive(true)
      setTimeout(() => setThrusterActive(false), 900)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Mouse move tracking with percentage coordinates
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  // Smooth lerp for magnetic reticle and 3D camera parallax
  useEffect(() => {
    let animId
    const updateSmooth = () => {
      setSmoothPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1,
      }))
      animId = requestAnimationFrame(updateSmooth)
    }
    animId = requestAnimationFrame(updateSmooth)
    return () => cancelAnimationFrame(animId)
  }, [mousePos])

  // Realtime sensor telemetry simulation (spikes during red alert)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        azimuth: +(prev.azimuth + (Math.random() - 0.5) * 0.2).toFixed(1),
        range: +(prev.range + (Math.random() - 0.5) * 0.05).toFixed(1),
        lat: +(prev.lat + (Math.random() - 0.5) * 0.0002).toFixed(4),
        lon: +(prev.lon + (Math.random() - 0.5) * 0.0002).toFixed(4),
        signal: +(redAlert ? 78.4 + Math.random() * 8 : 99.6 + Math.random() * 0.3).toFixed(1),
        radiation: +(redAlert ? 1420 + Math.random() * 80 : 14.2 + Math.random() * 0.4).toFixed(1),
      }))
    }, 800)
    return () => clearInterval(interval)
  }, [redAlert])

  const handleModeChange = (newMode) => {
    if (newMode === mode) return
    setMode(newMode)
    playModeChirp(newMode === 'sar' ? 880 : newMode === 'infrared' ? 440 : 660)
  }

  const toggleRedAlert = () => {
    const next = !redAlert
    setRedAlert(next)
    if (next) {
      playKlaxonAlarm()
    } else {
      playClick()
    }
  }

  const fireThruster = (e) => {
    if (e) e.stopPropagation()
    setThrusterActive(true)
    playThrusterWhoosh()
    setTimeout(() => setThrusterActive(false), 1200)
  }

  const toggleLock = (e) => {
    if (e) e.stopPropagation()
    const newLock = !locked
    setLocked(newLock)
    fireThruster()
    if (newLock) {
      playLockOn()
    } else {
      playClick()
    }
  }

  const toggleCabinHum = () => {
    const nextState = !cabinHumOn
    setCabinHumOn(nextState)
    if (nextState) {
      startCabinHum()
    } else {
      stopCabinHum()
    }
  }

  const handleSelectModule = (modId, e) => {
    if (e) e.stopPropagation()
    setActiveModule(modId)
    playInspectionPing()
  }

  return (
    <div className="space-y-4">
      {/* Primary Hero Tactical 3D Viewport Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setMousePos({ x: 50, y: 50 })
        }}
        className={`group relative w-full rounded-3xl bg-[#080B10] overflow-hidden border select-none transition-all duration-500 ${
          redAlert
            ? 'border-red-500 red-alert-card'
            : 'border-white/15 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.6)]'
        } ${
          isFullscreen
            ? 'fixed inset-4 z-50 rounded-2xl h-[calc(100vh-32px)]'
            : 'aspect-[16/10] min-h-[540px] lg:min-h-[640px]'
        }`}
      >
        {/* RED ALERT HAZARD STRIPING ACCENT */}
        {redAlert && (
          <div className="absolute top-0 left-0 right-0 h-1.5 hazard-stripes z-30 pointer-events-none" />
        )}

        {/* 1. Primary Visual Layer */}

        {/* MODE 1: REAL 3D SPACE STATION WITH PBR + SHADERS + 3D PINS + AURORAS */}
        {renderMode === 'webgl' && (
          <div className="absolute inset-0 w-full h-full">
            <Orbital3DCanvas
              mode={mode}
              mouseNorm={smoothPos}
              onSelectModule={handleSelectModule}
              redAlert={redAlert}
              timeWarp={timeWarp}
              solarBetaAngle={solarBetaAngle}
            />
          </div>
        )}

        {/* MODE 2: 3D PHOTOREALISTIC EARTH GLOBE */}
        {renderMode === 'earth' && (
          <div className="absolute inset-0 w-full h-full">
            <Earth3DGlobe mode={mode} mouseNorm={smoothPos} />
          </div>
        )}

        {/* MODE 3: 3D SOLAR SYSTEM & SUN-EARTH-MOON ORRERY */}
        {renderMode === 'orrery' && (
          <div className="absolute inset-0 w-full h-full">
            <SolarSystemOrrery
              mouseNorm={smoothPos}
              redAlert={redAlert}
            />
          </div>
        )}

        {/* Cinematic Vignette & Deep Space Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />

        {/* Mode-specific Overlay Effects */}
        {mode === 'sar' && (
          <>
            <div className="absolute inset-0 scanline pointer-events-none opacity-40" />
            <div className="scanner-bar pointer-events-none" />
            <div className="absolute inset-0 bg-emerald-950/20 mix-blend-color pointer-events-none" />
          </>
        )}

        {mode === 'infrared' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-red-500/10 to-transparent mix-blend-screen pointer-events-none" />
        )}

        {/* Ambient HUD grid pattern */}
        <div className="absolute inset-0 hud-grid opacity-25 pointer-events-none" />

        {/* 2. HUD Tactical Vector Overlays */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between pointer-events-none z-10">
          
          {/* TOP HUD ROW 1: System Switcher, Mode Toggles, and Audio */}
          <div className="space-y-2 pointer-events-auto">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Left: Engine Multi-Selector */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/90">
                  <span className={`w-2 h-2 rounded-full ${redAlert ? 'bg-red-500 animate-ping' : 'bg-red-500 animate-pulse'}`} />
                  {redAlert ? 'ALERT // LEVEL-1' : 'LIVE // 4K 60FPS'}
                </span>

                <div className="flex items-center bg-black/75 p-0.5 rounded-lg border border-white/20 backdrop-blur-md">
                  <button
                    onClick={() => {
                      setRenderMode('webgl')
                      playClick()
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono transition-all ${
                      renderMode === 'webgl'
                        ? 'bg-sky-500 text-white font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Box size={11} />
                    <span>3D 真实空间站 (360°可拖拽)</span>
                  </button>

                  <button
                    onClick={() => {
                      setRenderMode('earth')
                      playClick()
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono transition-all ${
                      renderMode === 'earth'
                        ? 'bg-emerald-500 text-white font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Globe size={11} className="animate-spin-slow" />
                    <span>3D 地球自转 (夜景/云层)</span>
                  </button>

                  <button
                    onClick={() => {
                      setRenderMode('orrery')
                      playClick()
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono transition-all ${
                      renderMode === 'orrery'
                        ? 'bg-amber-400 text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sun size={11} className={renderMode === 'orrery' ? 'animate-spin-slow' : ''} />
                    <span>3D 太阳系与地月运转</span>
                  </button>
                </div>
              </div>

              {/* Right: Sound & Mode Controls & Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCabinHum}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono border backdrop-blur-md transition-all ${
                    cabinHumOn
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                      : 'bg-black/50 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle Sub-bass Cabin Air Circulation Hum"
                >
                  {cabinHumOn ? <Volume2 size={11} /> : <VolumeX size={11} />}
                  <span className="hidden sm:inline">CABIN HUM</span>
                </button>

                {/* Multispectral Sensor Toggles */}
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/15 backdrop-blur-md">
                  <button
                    onClick={() => handleModeChange('optical')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono transition-all ${
                      mode === 'optical'
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Eye size={10} />
                    <span>OPTICAL</span>
                  </button>

                  <button
                    onClick={() => handleModeChange('infrared')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono transition-all ${
                      mode === 'infrared'
                        ? 'bg-amber-400 text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Flame size={10} />
                    <span>INFRARED</span>
                  </button>

                  <button
                    onClick={() => handleModeChange('sar')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono transition-all ${
                      mode === 'sar'
                        ? 'bg-emerald-400 text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Scan size={10} />
                    <span>SAR</span>
                  </button>
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => {
                    playClick()
                    setIsFullscreen(!isFullscreen)
                  }}
                  className="p-1.5 rounded-xl bg-black/60 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Toggle Immersive Fullscreen"
                >
                  {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
            </div>

            {/* TOP HUD ROW 2: TACTICAL OPERATIONS DOCK (Red Alert, Time Warp, Solar Gimbal, 2D Radar) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[9px] font-mono">
              {/* Left: RED ALERT & SOLAR DEFENSE */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRedAlert}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border backdrop-blur-md transition-all ${
                    redAlert
                      ? 'bg-red-600/40 text-red-200 border-red-500 font-bold shadow-lg shadow-red-500/40 animate-pulse'
                      : 'bg-black/60 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                  }`}
                >
                  <AlertTriangle size={12} className={redAlert ? 'animate-bounce text-red-300' : 'text-amber-400'} />
                  <span>{redAlert ? '⚠️ DEFENSE OVERRIDE [ACTIVE]' : 'SOLAR STORM DEFENSE PROTOCOL'}</span>
                </button>

                {/* Solar Array Gimbal Angle */}
                <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-white/15 text-zinc-300 backdrop-blur-md">
                  <Sun size={11} className="text-amber-400" />
                  <span className="text-white/40">GIMBAL:</span>
                  {[-30, 0, 30].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => {
                        setSolarBetaAngle(deg)
                        playClick()
                      }}
                      className={`px-1.5 py-0.5 rounded ${
                        solarBetaAngle === deg
                          ? 'bg-amber-400/30 text-amber-300 font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {deg > 0 ? `+${deg}°` : `${deg}°`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Time Warp & 2D Mercator Radar Toggle */}
              <div className="flex items-center gap-2">
                {/* Time Warp Speed Multiplier */}
                <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/15 backdrop-blur-md">
                  <span className="px-1.5 text-white/40 flex items-center gap-1">
                    <FastForward size={10} />
                    WARP:
                  </span>
                  {[
                    { val: 1, label: '1X' },
                    { val: 10, label: '10X' },
                    { val: 50, label: '50X' },
                    { val: 0, label: '⏸️' },
                  ].map((tw) => (
                    <button
                      key={tw.val}
                      onClick={() => {
                        setTimeWarp(tw.val)
                        playClick()
                      }}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        timeWarp === tw.val
                          ? 'bg-sky-500 text-white font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tw.label}
                    </button>
                  ))}
                </div>

                {/* 2D Radar Toggle Button */}
                <button
                  onClick={() => {
                    setShowRadar(!showRadar)
                    playClick()
                    playTelemetryChirp()
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border backdrop-blur-md transition-all ${
                    showRadar
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 font-bold'
                      : 'bg-black/60 text-zinc-400 border-white/15 hover:text-white'
                  }`}
                >
                  <Map size={11} />
                  <span>2D 地面雷达</span>
                </button>
              </div>
            </div>
          </div>

          {/* CENTER VIEWPORT: Four Corner Brackets [ ] */}
          <div className="absolute inset-8 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40" />
            <div className="absolute top-2 left-2 text-[8px] font-mono text-white/40">+ TL // 001</div>

            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40" />
            <div className="absolute top-2 right-2 text-[8px] font-mono text-white/40">TR // 002 +</div>

            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40" />
            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/40">+ BL // 003</div>

            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40" />
            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/40">BR // 004 +</div>
          </div>

          {/* DYNAMIC MAGNETIC RETICLE (Active in cinematic/hover mode) */}
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: `${smoothPos.x}%`,
              top: `${smoothPos.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: isHovered && renderMode === 'cinematic' ? 1 : 0.2,
            }}
          >
            <div className={`
              w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-dashed relative flex items-center justify-center transition-all duration-300
              ${locked ? 'border-red-400 rotate-45 scale-90' : 'border-white/30 rotate-0'}
            `}>
              <div className={`w-1.5 h-1.5 rounded-full ${locked ? 'bg-red-400' : 'bg-white/80'}`} />
              <div className="absolute top-0 bottom-0 w-[1px] bg-white/20" />
              <div className="absolute left-0 right-0 h-[1px] bg-white/20" />

              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white/90">
                {locked ? 'TARGET LOCKED [REC]' : '+ TRACKING VECTOR'}
              </div>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono tracking-wider text-white/60">
                AZ: {telemetry.azimuth}° // RNG: {telemetry.range}KM
              </div>
            </div>
          </div>

          {/* BOTTOM EDITORIAL TYPOGRAPHY & TELEMETRY STREAM */}
          <div className="relative z-20 space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span
                className={`flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase ${
                  redAlert ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'
                }`}
              >
                <Radio size={12} className="animate-pulse" />
                {redAlert
                  ? '⚠️ PROTOCOL CHARLIE // GEOMAGNETIC STORM ACTIVE // DEFLECTORS ENGAGED'
                  : '+ SPACE TELEMETRY LINK NOMINAL // 3D MODEL ACTIVE'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={fireThruster}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all"
                >
                  <Zap size={11} className={thrusterActive ? 'animate-bounce' : ''} />
                  <span>FIRE RCS THRUSTERS</span>
                </button>

                <button
                  onClick={toggleLock}
                  className={`
                    flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all
                    ${locked
                      ? 'bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/20'
                    }
                  `}
                >
                  <Lock size={11} />
                  <span>{locked ? 'UNLOCK TARGET' : 'LOCK TARGET'}</span>
                </button>
              </div>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-white uppercase leading-[0.95] drop-shadow-md">
              Orbital Intelligence
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1 border-t border-white/10">
              <p className="text-[10px] sm:text-xs font-mono text-zinc-300 tracking-wider max-w-xl uppercase leading-relaxed">
                Autonomous planetary mapping array. Synchronizing synthetic aperture telemetry across 24 localized orbital nodes with phased microwave radar.
              </p>

              <div className="flex items-center gap-4 text-[9px] font-mono text-white/50 shrink-0">
                <div>
                  <span className="text-white/30 block">RADIATION</span>
                  <span className={redAlert ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                    {telemetry.radiation} μSV/H
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-white/30 block">ORBIT VELOCITY</span>
                  <span className="text-white/80">7.66 KM/S</span>
                </div>
                <div>
                  <span className="text-white/30 block">CABIN ACOUSTICS</span>
                  <span className={cabinHumOn ? 'text-sky-300' : 'text-zinc-500'}>
                    {cabinHumOn ? '48Hz ACTIVE' : 'MUTED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Sliding Module Inspection Telemetry Drawer */}
        <ModuleInspectionDrawer
          activeModule={activeModule}
          onClose={() => setActiveModule(null)}
        />
      </div>

      {/* 4. EXPANDABLE 2D MERCATOR GROUND TRACK RADAR DECK */}
      {showRadar && (
        <div className="transition-all duration-300 animate-fadeIn">
          <MercatorGroundTrackRadar
            timeWarp={timeWarp}
            redAlert={redAlert}
          />
        </div>
      )}
    </div>
  )
}
