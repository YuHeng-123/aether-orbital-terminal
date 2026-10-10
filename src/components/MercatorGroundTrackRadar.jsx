import { useState, useEffect, useRef } from 'react'
import {
  Globe,
  Radio,
  Satellite,
  Compass,
  MapPin,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
} from 'lucide-react'
import { playClick, playTelemetryChirp } from '../utils/audio'

// Global Deep-Space Tracking Ground Stations
const GROUND_STATIONS = [
  { id: 'houston', name: 'HOUSTON WSC', lat: 29.5, lon: -95.1, country: 'USA' },
  { id: 'baikonur', name: 'BAIKONUR TT&C', lat: 45.9, lon: 63.3, country: 'KAZ' },
  { id: 'kourou', name: 'KOUROU ESTRACK', lat: 5.2, lon: -52.8, country: 'GUF' },
  { id: 'beijing', name: 'BEIJING BACC', lat: 39.9, lon: 116.4, country: 'CHN' },
  { id: 'tsukuba', name: 'TSUKUBA JAXA', lat: 36.0, lon: 140.1, country: 'JPN' },
  { id: 'svalbard', name: 'SVALBARD POLAR', lat: 78.2, lon: 15.4, country: 'NOR' },
]

export default function MercatorGroundTrackRadar({
  timeWarp = 1,
  redAlert = false,
  onStationClick,
}) {
  const canvasRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeStation, setActiveStation] = useState('beijing')
  const [orbitData, setOrbitData] = useState({
    lat: 34.05,
    lon: -118.24,
    velocity: 7.66,
    alt: 416.2,
    aosStation: 'BEIJING BACC',
    aosCountdown: 258, // seconds
    sunLit: true,
  })

  const propsRef = useRef({ timeWarp, redAlert })
  useEffect(() => {
    propsRef.current.timeWarp = timeWarp
    propsRef.current.redAlert = redAlert
  }, [timeWarp, redAlert])

  // Orbital Mechanics Simulation for ISS Ground Track
  useEffect(() => {
    let animId
    let simTime = Date.now() / 1000
    let lastStateUpdate = 0

    const updateOrbit = () => {
      const currentWarp = propsRef.current.timeWarp
      simTime += 0.05 * (currentWarp === 0 ? 0 : currentWarp)
      // Period is approx 92.68 minutes = 5560 seconds
      const orbitProgress = (simTime % 5560) / 5560
      const theta = orbitProgress * Math.PI * 2

      // ISS orbital inclination is 51.64 degrees
      const lat = 51.64 * Math.sin(theta)
      // Longitude drifts eastwards with orbital speed minus Earth rotation
      const lon = (((orbitProgress * 360 * 15.5 - (simTime / 86400) * 360) % 360) + 540) % 360 - 180

      // Day / night calculation
      const sunLon = -((simTime % 86400) / 86400) * 360 + 180
      const lonDiff = Math.abs(lon - sunLon)
      const sunLit = lonDiff < 90 || lonDiff > 270

      // Throttle React state re-renders to twice a second instead of 60fps!
      const now = performance.now()
      if (now - lastStateUpdate > 800) {
        lastStateUpdate = now
        setOrbitData((prev) => ({
          lat: +lat.toFixed(2),
          lon: +lon.toFixed(2),
          velocity: +(7.66 + Math.sin(theta * 2) * 0.02).toFixed(2),
          alt: +(416.2 + Math.cos(theta) * 2.1).toFixed(1),
          aosStation: prev.aosStation,
          aosCountdown: Math.max(0, Math.floor(258 - (simTime % 258))),
          sunLit,
        }))
      }

      drawRadar(lat, lon, simTime)
      animId = requestAnimationFrame(updateOrbit)
    }

    const drawRadar = (currentLat, currentLon, t) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const w = canvas.width
      const h = canvas.height
      const redAlert = propsRef.current.redAlert

      // Clear Canvas
      ctx.fillStyle = redAlert ? '#0f0506' : '#04070d'
      ctx.fillRect(0, 0, w, h)

      // 1. Draw Tactical Coordinates Grid Lines (Mercator)
      ctx.strokeStyle = redAlert ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.08)'
      ctx.lineWidth = 1

      // Longitude Meridians every 30 degrees
      for (let x = 0; x <= w; x += w / 12) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      // Latitude Parallels every 30 degrees
      for (let y = 0; y <= h; y += h / 6) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Equator
      ctx.strokeStyle = redAlert ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.25)'
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()

      // Convert Lat/Lon to Canvas Pixel Coordinates
      const toXY = (latitude, longitude) => {
        const px = ((longitude + 180) / 360) * w
        const py = ((90 - latitude) / 180) * h
        return { x: px, y: py }
      }

      // 2. Draw Simplified Stylized Continents (Tactical Polygons)
      ctx.fillStyle = redAlert ? 'rgba(220, 38, 38, 0.08)' : 'rgba(14, 165, 233, 0.06)'
      ctx.strokeStyle = redAlert ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)'
      ctx.lineWidth = 1

      // Stylized Continental Outlines
      const continents = [
        // North America
        [[-165, 65], [-130, 55], [-120, 35], [-105, 20], [-80, 25], [-75, 45], [-60, 50], [-90, 70], [-135, 72]],
        // South America
        [[-80, 10], [-50, -5], [-35, -10], [-55, -45], [-70, -55], [-75, -20], [-80, 10]],
        // Eurasia
        [[-10, 40], [30, 42], [70, 55], [120, 60], [170, 65], [140, 35], [105, 15], [80, 15], [50, 25], [35, 35], [0, 50]],
        // Africa
        [[-15, 30], [35, 30], [50, 10], [40, -15], [20, -35], [10, -10], [-15, 10]],
        // Australia
        [[115, -20], [150, -20], [150, -38], [115, -35]],
      ]

      continents.forEach((poly) => {
        ctx.beginPath()
        poly.forEach((pt, idx) => {
          const { x, y } = toXY(pt[1], pt[0])
          if (idx === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      })

      // 3. Draw Day / Night Solar Terminator Shadow
      const sunLon = -((t % 86400) / 86400) * 360 + 180
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      for (let x = 0; x <= w; x += 10) {
        const curLon = (x / w) * 360 - 180
        const dLon = ((curLon - sunLon + 540) % 360) - 180
        const termLat = Math.sin((dLon * Math.PI) / 180) * 66
        const { y } = toXY(termLat, curLon)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fill()

      // 4. Draw ISS Ground Track Sine Wave Curve (Current pass + Next pass)
      const passes = [
        { offset: 0, alpha: 0.9, dash: [] },
        { offset: -23.5, alpha: 0.35, dash: [4, 4] },
      ]

      passes.forEach(({ offset, alpha, dash }) => {
        ctx.strokeStyle = redAlert
          ? `rgba(239, 68, 68, ${alpha})`
          : `rgba(56, 189, 248, ${alpha})`
        ctx.lineWidth = 1.8
        ctx.setLineDash(dash)
        ctx.beginPath()

        let first = true
        for (let lonStep = -180; lonStep <= 180; lonStep += 2) {
          // Sine curve for 51.64 inclination with orbital longitude offset
          const phase = ((lonStep - offset) * Math.PI) / 95
          const trackLat = 51.64 * Math.sin(phase)
          const pt = toXY(trackLat, lonStep)

          if (first) {
            ctx.moveTo(pt.x, pt.y)
            first = false
          } else {
            ctx.lineTo(pt.x, pt.y)
          }
        }
        ctx.stroke()
        ctx.setLineDash([])
      })

      // 5. Draw Ground Tracking Stations
      GROUND_STATIONS.forEach((gs) => {
        const { x, y } = toXY(gs.lat, gs.lon)
        const isCurrent = gs.id === activeStation

        ctx.fillStyle = isCurrent
          ? redAlert
            ? '#ef4444'
            : '#38bdf8'
          : 'rgba(255, 255, 255, 0.4)'
        ctx.beginPath()
        ctx.arc(x, y, isCurrent ? 3.5 : 2, 0, Math.PI * 2)
        ctx.fill()

        // Station Radar Ping Rings
        if (isCurrent) {
          const pingR = (t * 20) % 24
          ctx.strokeStyle = redAlert
            ? `rgba(239, 68, 68, ${1 - pingR / 24})`
            : `rgba(56, 189, 248, ${1 - pingR / 24})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(x, y, pingR, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Station Name Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
        ctx.font = '8px monospace'
        ctx.fillText(gs.name, x + 6, y + 3)
      })

      // 6. Draw Realtime ISS Position Marker & Radio Footprint Horizon Circle
      const curPos = toXY(currentLat, currentLon)

      // Communication Horizon Footprint Ellipse (~2,200 km radius projected)
      ctx.strokeStyle = redAlert ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.35)'
      ctx.fillStyle = redAlert ? 'rgba(239, 68, 68, 0.08)' : 'rgba(56, 189, 248, 0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(curPos.x, curPos.y, w * 0.08, h * 0.12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // ISS Marker Dot & Crosshairs
      ctx.fillStyle = redAlert ? '#ef4444' : '#38bdf8'
      ctx.beginPath()
      ctx.arc(curPos.x, curPos.y, 4, 0, Math.PI * 2)
      ctx.fill()

      // Pulse Ring
      const issPing = (t * 30) % 20
      ctx.strokeStyle = redAlert ? '#ef4444' : '#38bdf8'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(curPos.x, curPos.y, 4 + issPing, 0, Math.PI * 2)
      ctx.stroke()

      // Flight Vector Leader Line
      ctx.strokeStyle = redAlert ? '#ef4444' : '#38bdf8'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(curPos.x, curPos.y)
      ctx.lineTo(curPos.x + 18, curPos.y - 12)
      ctx.lineTo(curPos.x + 60, curPos.y - 12)
      ctx.stroke()

      // Tactical Label
      ctx.fillStyle = redAlert ? '#fca5a5' : '#bae6fd'
      ctx.font = 'bold 9px monospace'
      ctx.fillText('ISS (ZARYA)', curPos.x + 22, curPos.y - 16)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '8px monospace'
      ctx.fillText(`${currentLat > 0 ? '+' : ''}${currentLat}° | ${currentLon}°`, curPos.x + 22, curPos.y - 4)
    }

    animId = requestAnimationFrame(updateOrbit)
    return () => cancelAnimationFrame(animId)
  }, [activeStation])

  return (
    <div
      className={`relative w-full rounded-2xl bg-black/80 border transition-all duration-300 overflow-hidden backdrop-blur-xl ${
        redAlert ? 'border-red-500/40 shadow-red-950/40' : 'border-sky-500/30 shadow-sky-950/30'
      } shadow-xl`}
    >
      {/* Header Deck */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Satellite
            size={13}
            className={redAlert ? 'text-red-400 animate-pulse' : 'text-sky-400 animate-pulse'}
          />
          <span className="text-[10px] font-mono tracking-wider font-bold text-white uppercase">
            MERCATOR GROUND TRACK // 2D ORBITAL RADAR
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/15 text-white/70">
            INCLINATION: 51.64° // APOGEE: 422KM
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Sunlit / Eclipse Status */}
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono border ${
              orbitData.sunLit
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                orbitData.sunLit ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'
              }`}
            />
            {orbitData.sunLit ? 'DAYLIGHT PASS' : 'ORBITAL ECLIPSE'}
          </span>

          {/* Toggle Expand / Collapse */}
          <button
            onClick={() => {
              playClick()
              setIsExpanded(!isExpanded)
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            {isExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            <span>{isExpanded ? 'COMPACT' : 'EXPAND'}</span>
          </button>
        </div>
      </div>

      {/* 2D Canvas Viewport */}
      <div
        className={`relative w-full transition-all duration-300 ${
          isExpanded ? 'h-[320px] sm:h-[400px]' : 'h-[160px] sm:h-[200px]'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={isExpanded ? 400 : 200}
          className="w-full h-full block"
        />

        {/* Bottom Telemetry HUD Ribbon */}
        <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-lg border border-white/15 text-[9px] font-mono text-white/90 backdrop-blur-md">
            <span>LAT: <b className="text-sky-300">{orbitData.lat}°</b></span>
            <span className="text-white/30">|</span>
            <span>LON: <b className="text-sky-300">{orbitData.lon}°</b></span>
            <span className="text-white/30">|</span>
            <span>VELOCITY: <b className="text-emerald-400">{orbitData.velocity} KM/S</b></span>
            <span className="text-white/30">|</span>
            <span>ALT: <b className="text-emerald-400">{orbitData.alt} KM</b></span>
          </div>

          <div className="flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-lg border border-white/15 text-[9px] font-mono text-white/90 backdrop-blur-md">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            <span>DOWNLINK: <b className="text-emerald-300">{orbitData.aosStation}</b></span>
            <span className="text-white/30">|</span>
            <span className="text-amber-300 font-bold">T-{orbitData.aosCountdown}S</span>
          </div>
        </div>
      </div>
    </div>
  )
}
