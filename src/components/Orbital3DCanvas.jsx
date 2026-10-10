import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  Box,
  Globe,
  Eye,
  RotateCcw,
  Compass,
} from 'lucide-react'
import {
  playClick,
  playDollyZoom,
  playInspectionPing,
} from '../utils/audio'

// Camera Perspective Presets with distinct focal points & zoom envelopes
const CAMERA_PRESETS = {
  station: {
    id: 'station',
    label: '空间站特写',
    sublabel: 'LEO 412KM · 舱段与太阳翼',
    icon: Box,
    lookAt: new THREE.Vector3(0, 0.6, 4.65),
    zoom: 3.6,
    minZoom: 1.6,
    maxZoom: 9.0,
    rotX: 0.18,
    rotY: 0.45,
    tag: 'ISS FOCUS',
  },
  earth: {
    id: 'earth',
    label: '地球全貌轨道',
    sublabel: '360° 行星全景 · 晨昏线与云层',
    icon: Globe,
    lookAt: new THREE.Vector3(0, 0, 0),
    zoom: 10.5,
    minZoom: 4.8,
    maxZoom: 26.0,
    rotX: 0.22,
    rotY: -0.85,
    tag: 'EARTH ORBIT',
  },
  nadir: {
    id: 'nadir',
    label: '对地俯视观测',
    sublabel: '穹顶对地视线 · 俯瞰大陆板块',
    icon: Eye,
    lookAt: new THREE.Vector3(0, 0.1, 1.8),
    zoom: 5.2,
    minZoom: 2.2,
    maxZoom: 12.0,
    rotX: 0.88,
    rotY: 0.05,
    tag: 'NADIR CUPOLA',
  },
  deep: {
    id: 'deep',
    label: '宏观深空全景',
    sublabel: '深空广角 · 空间站与蔚蓝母星',
    icon: Compass,
    lookAt: new THREE.Vector3(0, 0.25, 2.2),
    zoom: 17.5,
    minZoom: 8.0,
    maxZoom: 32.0,
    rotX: 0.35,
    rotY: 0.75,
    tag: 'DEEP SPACE',
  },
}

// 3D Anchors on the Space Station Model for Realtime Screen-Projected Holographic Hotspots
const MODULE_ANCHORS = [
  {
    id: 'cupola',
    name: '01. CUPOLA NADIR',
    sub: 'EARTH OBS BAY // 7-WINDOW',
    tag: 'OPTICAL OBS',
    localPos: new THREE.Vector3(0, -0.32, 0.72),
    color: '#38bdf8',
  },
  {
    id: 'docking',
    name: '02. PROGRESS DOCK',
    sub: 'SOYUZ / CARGO PORT // NADIR',
    tag: 'PRESSURE SEAL',
    localPos: new THREE.Vector3(0, 0.22, -1.25),
    color: '#f59e0b',
  },
  {
    id: 'solar',
    name: '03. SOLAR WING 2B',
    sub: 'ALPHA GIMBAL // 124 KW PHOTOVOLTAIC',
    tag: 'POWER GEN',
    localPos: new THREE.Vector3(-1.75, 0.08, 0.0),
    color: '#10b981',
  },
  {
    id: 'propulsion',
    name: '04. HALL THRUSTER',
    sub: 'ORBITAL REBOOST // ION ENGINE',
    tag: 'PROPULSION',
    localPos: new THREE.Vector3(0, 0.42, -1.45),
    color: '#a855f7',
  },
  {
    id: 'destiny',
    name: '05. DESTINY LAB',
    sub: 'MICROGRAVITY EXPERIMENT DECK',
    tag: 'LABORATORY',
    localPos: new THREE.Vector3(0, 0.05, 0.22),
    color: '#ec4899',
  },
]

export default function Orbital3DCanvas({
  mode = 'optical',
  mouseNorm = { x: 50, y: 50 },
  onSelectModule,
  redAlert = false,
  timeWarp = 1,
  solarBetaAngle = 0,
}) {
  const containerRef = useRef(null)
  const animFrameRef = useRef(null)
  const objectsRef = useRef({})
  const hotspotDomRefs = useRef({})
  const [activePreset, setActivePreset] = useState('station')
  const [modelLoading, setModelLoading] = useState(true)
  const [currentAltitude, setCurrentAltitude] = useState('412.8 KM')
  const [hotspotsVisible, setHotspotsVisible] = useState(true)

  // Dynamic parameters ref so the main Three.js scene NEVER re-initializes on state change
  const dynamicParamsRef = useRef({
    redAlert,
    timeWarp,
    solarBetaAngle,
    activePreset: 'station',
    hotspotsVisible: true,
    mouseNorm,
  })

  // Synchronize ref on prop changes
  useEffect(() => {
    dynamicParamsRef.current.redAlert = redAlert
    dynamicParamsRef.current.timeWarp = timeWarp
    dynamicParamsRef.current.solarBetaAngle = solarBetaAngle
    dynamicParamsRef.current.activePreset = activePreset
    dynamicParamsRef.current.hotspotsVisible = hotspotsVisible
    dynamicParamsRef.current.mouseNorm = mouseNorm
  }, [redAlert, timeWarp, solarBetaAngle, activePreset, hotspotsVisible, mouseNorm])

  // Camera & dynamic target state
  const orbitStateRef = useRef({
    isDragging: false,
    dragButton: 0,
    prevX: 0,
    prevY: 0,
    rotX: CAMERA_PRESETS.station.rotX,
    rotY: CAMERA_PRESETS.station.rotY,
    targetRotX: CAMERA_PRESETS.station.rotX,
    targetRotY: CAMERA_PRESETS.station.rotY,
    zoom: CAMERA_PRESETS.station.zoom,
    targetZoom: CAMERA_PRESETS.station.zoom,
    minZoom: CAMERA_PRESETS.station.minZoom,
    maxZoom: CAMERA_PRESETS.station.maxZoom,
    lookAt: CAMERA_PRESETS.station.lookAt.clone(),
    targetLookAt: CAMERA_PRESETS.station.lookAt.clone(),
  })

  // Switch camera view preset
  const switchPreset = useCallback((presetKey) => {
    const preset = CAMERA_PRESETS[presetKey]
    if (!preset) return
    setActivePreset(presetKey)
    playClick()
    playDollyZoom()

    const st = orbitStateRef.current
    st.targetLookAt.copy(preset.lookAt)
    st.targetZoom = preset.zoom
    st.minZoom = preset.minZoom
    st.maxZoom = preset.maxZoom
    st.targetRotX = preset.rotX
    st.targetRotY = preset.rotY

    if (presetKey === 'station' || presetKey === 'nadir') {
      setCurrentAltitude('412.8 KM')
      setHotspotsVisible(true)
    } else if (presetKey === 'earth') {
      setCurrentAltitude('12,742 KM (GLOBAL)')
      setHotspotsVisible(false)
    } else {
      setCurrentAltitude('35,786 KM (GEO VISTA)')
      setHotspotsVisible(false)
    }
  }, [])

  // Fly camera to a specific module when clicking its 3D hotspot
  const flyToModule = (mod) => {
    playInspectionPing()
    playDollyZoom()
    const { stationGroup } = objectsRef.current
    if (stationGroup) {
      const worldPos = mod.localPos.clone().applyMatrix4(stationGroup.matrixWorld)
      const st = orbitStateRef.current
      st.targetLookAt.copy(worldPos)
      st.targetZoom = 2.4
    }
    if (onSelectModule) {
      onSelectModule(mod.id)
    }
  }

  // MAIN THREE.JS INITIALIZATION (RUNS STRICTLY ONCE ON MOUNT)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 9.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 2. Cosmic Space Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.85)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.8)
    sunLight.position.set(20, 14, 16)
    scene.add(sunLight)

    const earthAlbedo = new THREE.DirectionalLight(0x38bdf8, 2.2)
    earthAlbedo.position.set(-10, -8, -6)
    scene.add(earthAlbedo)

    // 3. Deep Space Starfield Sphere
    const starCount = 2000
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    const starCols = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 160
      starPos[i + 1] = (Math.random() - 0.5) * 120
      starPos[i + 2] = (Math.random() - 0.5) * 140

      const c = 0.65 + Math.random() * 0.35
      starCols[i] = c
      starCols[i + 1] = c * 0.95
      starCols[i + 2] = c * 1.15
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3))

    const starMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // 4. Photorealistic NASA 3D Earth System
    const textureLoader = new THREE.TextureLoader()
    const dayTexture = textureLoader.load('/earth_day.jpg')
    const nightTexture = textureLoader.load('/earth_night.jpg')
    const cloudsTexture = textureLoader.load('/earth_clouds.jpg')

    dayTexture.colorSpace = THREE.SRGBColorSpace
    nightTexture.colorSpace = THREE.SRGBColorSpace

    const earthRadius = 3.2
    const earthGeo = new THREE.SphereGeometry(earthRadius, 48, 48)
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.52,
      metalness: 0.1,
      emissiveMap: nightTexture,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.75,
    })
    const earthMesh = new THREE.Mesh(earthGeo, earthMat)
    earthMesh.position.set(0, 0, 0)
    earthMesh.rotation.x = 0.38
    scene.add(earthMesh)

    // Swirling Clouds Layer
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.012, 48, 48)
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      roughness: 1.0,
    })
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
    cloudMesh.position.set(0, 0, 0)
    scene.add(cloudMesh)

    // Atmospheric Rayleigh Scattering Outer Shell
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.055, 48, 48)
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat)
    atmosMesh.position.set(0, 0, 0)
    scene.add(atmosMesh)

    // 5. Geomagnetic Polar Aurora Rings (North & South Poles)
    const createAuroraRing = (yOffset, colorHex) => {
      const ringGeo = new THREE.RingGeometry(0.7, 1.45, 48)
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.position.set(0, yOffset, 0)
      ringMesh.rotation.x = Math.PI / 2
      return ringMesh
    }

    const auroraNorth = createAuroraRing(3.22, 0x10b981)
    const auroraSouth = createAuroraRing(-3.22, 0x10b981)
    earthMesh.add(auroraNorth)
    earthMesh.add(auroraSouth)

    // 6. ISS Glowing Orbital Track Path
    const orbitRadius = 4.69
    const orbitCurvePoints = []
    const orbitSegments = 96
    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2
      const ox = Math.cos(theta) * orbitRadius
      const oy = Math.sin(theta) * 0.7
      const oz = Math.sin(theta) * orbitRadius
      orbitCurvePoints.push(new THREE.Vector3(ox, oy, oz))
    }
    const orbitTrackGeo = new THREE.BufferGeometry().setFromPoints(orbitCurvePoints)
    const orbitTrackMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    })
    const orbitTrackLine = new THREE.Line(orbitTrackGeo, orbitTrackMat)
    scene.add(orbitTrackLine)

    // 7. Real-World NASA ISS 3D Model
    const stationGroup = new THREE.Group()
    stationGroup.position.set(0, 0.6, 4.65)
    scene.add(stationGroup)

    let loadedModel = null
    const originalMaterials = new Map()

    const gltfLoader = new GLTFLoader()
    gltfLoader.load(
      '/iss.glb',
      (gltf) => {
        loadedModel = gltf.scene

        const bbox = new THREE.Box3().setFromObject(loadedModel)
        const size = bbox.getSize(new THREE.Vector3())
        const center = bbox.getCenter(new THREE.Vector3())

        loadedModel.position.sub(center)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scaleFactor = 2.4 / maxDim
        loadedModel.scale.setScalar(scaleFactor)

        loadedModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            if (child.material) {
              originalMaterials.set(child, child.material.clone())
              child.material.roughness = Math.min(child.material.roughness || 0.45, 0.5)
              child.material.metalness = Math.max(child.material.metalness || 0.6, 0.55)
            }
          }
        })

        stationGroup.add(loadedModel)
        setModelLoading(false)

        // Realtime Blinking Navigation Strobe Beacons
        const beaconGeo = new THREE.SphereGeometry(0.04, 8, 8)
        const redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xff2222 })
        const redBeacon = new THREE.Mesh(beaconGeo, redBeaconMat)
        redBeacon.position.set(-1.6, 0, 0)
        stationGroup.add(redBeacon)

        const greenBeaconMat = new THREE.MeshBasicMaterial({ color: 0x22c55e })
        const greenBeacon = new THREE.Mesh(beaconGeo, greenBeaconMat)
        greenBeacon.position.set(1.6, 0, 0)
        stationGroup.add(greenBeacon)

        const zenithBeaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const zenithBeacon = new THREE.Mesh(beaconGeo, zenithBeaconMat)
        zenithBeacon.position.set(0, 0.8, 0)
        stationGroup.add(zenithBeacon)

        objectsRef.current.redBeaconMat = redBeaconMat
        objectsRef.current.greenBeaconMat = greenBeaconMat
        objectsRef.current.zenithBeaconMat = zenithBeaconMat
      },
      undefined,
      (err) => {
        console.error('Error loading iss.glb:', err)
        setModelLoading(false)
      }
    )

    objectsRef.current.scene = scene
    objectsRef.current.camera = camera
    objectsRef.current.renderer = renderer
    objectsRef.current.sunLight = sunLight
    objectsRef.current.ambientLight = ambientLight
    objectsRef.current.earthMesh = earthMesh
    objectsRef.current.cloudMesh = cloudMesh
    objectsRef.current.atmosMesh = atmosMesh
    objectsRef.current.auroraNorth = auroraNorth
    objectsRef.current.auroraSouth = auroraSouth
    objectsRef.current.orbitTrackMat = orbitTrackMat
    objectsRef.current.stars = stars
    objectsRef.current.stationGroup = stationGroup
    objectsRef.current.originalMaterials = originalMaterials

    // 8. Event Handlers
    const dom = renderer.domElement

    const onMouseDown = (e) => {
      e.preventDefault()
      orbitStateRef.current.isDragging = true
      orbitStateRef.current.dragButton = e.button
      orbitStateRef.current.prevX = e.clientX
      orbitStateRef.current.prevY = e.clientY
    }

    const onContextMenu = (e) => {
      e.preventDefault()
    }

    const onMouseMove = (e) => {
      const st = orbitStateRef.current
      if (!st.isDragging) return

      const deltaX = e.clientX - st.prevX
      const deltaY = e.clientY - st.prevY
      st.prevX = e.clientX
      st.prevY = e.clientY

      if (st.dragButton === 0 && !e.shiftKey) {
        st.targetRotY += deltaX * 0.007
        st.targetRotX = Math.max(-1.4, Math.min(1.4, st.targetRotX + deltaY * 0.007))
      } else {
        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
        const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
        const panFactor = 0.003 * (st.zoom / 5)
        st.targetLookAt.addScaledVector(camRight, -deltaX * panFactor)
        st.targetLookAt.addScaledVector(camUp, deltaY * panFactor)
      }
    }

    const onMouseUp = () => {
      orbitStateRef.current.isDragging = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      const st = orbitStateRef.current
      st.targetZoom = Math.max(
        st.minZoom,
        Math.min(st.maxZoom, st.targetZoom + e.deltaY * 0.005)
      )
    }

    const onDoubleClick = () => {
      const current = dynamicParamsRef.current.activePreset
      const next = current === 'station' ? 'earth' : 'station'
      switchPreset(next)
    }

    dom.addEventListener('mousedown', onMouseDown)
    dom.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('wheel', onWheel, { passive: false })
    dom.addEventListener('dblclick', onDoubleClick)

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // 9. Ultra-Smooth Animation Loop
    let clock = new THREE.Clock()

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()
      const st = orbitStateRef.current
      const params = dynamicParamsRef.current

      const warp = params.timeWarp === 0 ? 0 : params.timeWarp
      const isRedAlert = params.redAlert

      // Camera Lerp
      st.lookAt.lerp(st.targetLookAt, 0.07)
      st.rotX += (st.targetRotX - st.rotX) * 0.08
      st.rotY += (st.targetRotY - st.rotY) * 0.08
      st.zoom += (st.targetZoom - st.zoom) * 0.08

      // Celestial Rotations
      earthMesh.rotation.y += 0.001 * warp
      cloudMesh.rotation.y += 0.0016 * warp
      stars.rotation.y -= 0.00015 * warp

      // Polar Aurora Wave
      auroraNorth.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1
      auroraSouth.rotation.z = -Math.sin(elapsedTime * 0.5) * 0.1
      auroraNorth.material.opacity = (isRedAlert ? 0.75 : 0.42) + Math.sin(elapsedTime * 3) * 0.15
      auroraSouth.material.opacity = (isRedAlert ? 0.75 : 0.42) + Math.cos(elapsedTime * 3) * 0.15

      // Space Station orbital stabilization
      stationGroup.rotation.y = Math.sin(elapsedTime * 0.12) * 0.06
      stationGroup.position.y = 0.6 + Math.sin(elapsedTime * 0.35) * 0.03
      stationGroup.rotation.z = (params.solarBetaAngle * Math.PI) / 180

      // Blinking Navigation Beacons
      if (objectsRef.current.redBeaconMat) {
        const blink = Math.sin(elapsedTime * 3.8) > 0.35
        objectsRef.current.redBeaconMat.color.setHex(blink ? 0xff2222 : 0x3b0707)
        objectsRef.current.greenBeaconMat.color.setHex(blink ? 0x22c55e : 0x064e3b)
        if (objectsRef.current.zenithBeaconMat) {
          const zenithBlink = Math.sin(elapsedTime * (isRedAlert ? 8.0 : 5.0)) > 0.5
          objectsRef.current.zenithBeaconMat.color.setHex(
            zenithBlink ? (isRedAlert ? 0xff2222 : 0xffffff) : 0x334155
          )
        }
      }

      // Parallax
      const mouseParallaxX = (params.mouseNorm.x - 50) * 0.005
      const mouseParallaxY = -(params.mouseNorm.y - 50) * 0.005

      const totalRotY = st.rotY + mouseParallaxX
      const totalRotX = st.rotX + mouseParallaxY

      const r = st.zoom
      camera.position.x = st.lookAt.x + r * Math.sin(totalRotY) * Math.cos(totalRotX)
      camera.position.y = st.lookAt.y + r * Math.sin(totalRotX)
      camera.position.z = st.lookAt.z + r * Math.cos(totalRotY) * Math.cos(totalRotX)
      camera.lookAt(st.lookAt.x, st.lookAt.y, st.lookAt.z)

      // Direct cached DOM node projection (ZERO querySelector, ZERO lag)
      if (params.hotspotsVisible && params.activePreset === 'station') {
        const cw = container.clientWidth
        const ch = container.clientHeight

        MODULE_ANCHORS.forEach((mod) => {
          const pinEl = hotspotDomRefs.current[mod.id]
          if (!pinEl) return

          const worldPos = mod.localPos.clone().applyMatrix4(stationGroup.matrixWorld)
          const projected = worldPos.clone().project(camera)

          const isFront = projected.z < 1.0
          const px = (projected.x * 0.5 + 0.5) * cw
          const py = (-projected.y * 0.5 + 0.5) * ch

          const distToCam = camera.position.distanceTo(worldPos)
          const distToCenter = camera.position.distanceTo(stationGroup.position)
          const isOccluded = distToCam > distToCenter + 1.2

          if (isFront && px >= -60 && px <= cw + 60 && py >= -60 && py <= ch + 60) {
            pinEl.style.display = 'block'
            pinEl.style.transform = `translate3d(${px}px, ${py}px, 0)`
            pinEl.style.opacity = isOccluded ? '0.35' : '1.0'
          } else {
            pinEl.style.display = 'none'
          }
        })
      } else {
        MODULE_ANCHORS.forEach((mod) => {
          const pinEl = hotspotDomRefs.current[mod.id]
          if (pinEl) pinEl.style.display = 'none'
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('contextmenu', onContextMenu)
      dom.removeEventListener('wheel', onWheel)
      dom.removeEventListener('dblclick', onDoubleClick)
      renderer.dispose()
      if (container) container.innerHTML = ''
    }
  }, []) // Empty dependency array: runs ONCE, ZERO re-creation

  // 10. Lightweight state updater for lights & materials (NEVER recreates scene)
  useEffect(() => {
    const {
      stationGroup,
      atmosMesh,
      sunLight,
      ambientLight,
      auroraNorth,
      auroraSouth,
      orbitTrackMat,
      originalMaterials,
    } = objectsRef.current
    if (!stationGroup || !atmosMesh) return

    if (redAlert) {
      if (sunLight) {
        sunLight.color.setHex(0xff7722)
        sunLight.intensity = 5.2
      }
      if (ambientLight) ambientLight.color.setHex(0x551111)
      if (atmosMesh) atmosMesh.material.color.setHex(0xf43f5e)
      if (auroraNorth) auroraNorth.material.color.setHex(0xf43f5e)
      if (auroraSouth) auroraSouth.material.color.setHex(0xf43f5e)
      if (orbitTrackMat) orbitTrackMat.color.setHex(0xef4444)
    } else {
      if (sunLight) {
        sunLight.color.setHex(0xfffaed)
        sunLight.intensity = 3.8
      }
      if (ambientLight) ambientLight.color.setHex(0x1e293b)
      if (auroraNorth) auroraNorth.material.color.setHex(0x10b981)
      if (auroraSouth) auroraSouth.material.color.setHex(0x10b981)
      if (orbitTrackMat) orbitTrackMat.color.setHex(0x38bdf8)
    }

    stationGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        if (mode === 'sar') {
          child.material.wireframe = true
          child.material.color.setHex(0x10b981)
          atmosMesh.material.color.setHex(0x10b981)
        } else if (mode === 'infrared') {
          child.material.wireframe = false
          child.material.color.setHex(0xf97316)
          atmosMesh.material.color.setHex(0xf43f5e)
        } else {
          const orig = originalMaterials.get(child)
          if (orig) {
            child.material = orig.clone()
          } else {
            child.material.wireframe = false
            child.material.color.setHex(0xffffff)
          }
          if (!redAlert) atmosMesh.material.color.setHex(0x38bdf8)
        }
      }
    })
  }, [mode, redAlert])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas Surface */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 3D-TO-2D REALTIME PROJECTED HOLOGRAPHIC HOTSPOTS OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {MODULE_ANCHORS.map((mod) => (
          <div
            key={mod.id}
            ref={(el) => {
              if (el) hotspotDomRefs.current[mod.id] = el
            }}
            style={{ display: 'none', position: 'absolute', left: 0, top: 0 }}
            className="group/pin pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
            onClick={() => flyToModule(mod)}
          >
            {/* Target Reticle Anchor Dot */}
            <div className="relative flex items-center">
              <span
                className="w-3.5 h-3.5 rounded-full absolute -left-1 -top-1 animate-ping opacity-60"
                style={{ backgroundColor: mod.color }}
              />
              <span
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: mod.color }}
              />

              {/* Sci-Fi Angled Leader Line (SVG) */}
              <svg
                width="40"
                height="28"
                className="overflow-visible ml-1 pointer-events-none opacity-80 group-hover/pin:opacity-100 transition-opacity"
              >
                <polyline
                  points="0,14 18,6 38,6"
                  fill="none"
                  stroke={mod.color}
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
              </svg>

              {/* Holographic Telemetry Badge */}
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/85 border text-[8px] font-mono whitespace-nowrap backdrop-blur-md shadow-lg transition-transform group-hover/pin:scale-105"
                style={{ borderColor: `${mod.color}55` }}
              >
                <span className="font-bold text-white">{mod.name}</span>
                <span className="text-white/40">//</span>
                <span style={{ color: mod.color }}>{mod.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Spinner for NASA ISS GLTF model */}
      {modelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-20">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/80 border border-sky-400/40 text-sky-300 font-mono text-xs">
            <span className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>STREAMING NASA ISS HIGH-FIDELITY GEOMETRY (3.56MB)...</span>
          </div>
        </div>
      )}

      {/* FLOATING HUD PERSPECTIVE DOCK */}
      <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-2">
        {/* Quick-Switch Camera View Presets */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/80 border border-white/20 backdrop-blur-xl shadow-2xl shadow-black/80">
          {Object.values(CAMERA_PRESETS).map((p) => {
            const Icon = p.icon
            const isActive = activePreset === p.id
            return (
              <button
                key={p.id}
                onClick={() => switchPreset(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono transition-all duration-200 ${
                  isActive
                    ? redAlert
                      ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/30'
                      : 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title={p.sublabel}
              >
                <Icon size={12} className={isActive ? 'animate-pulse' : ''} />
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{p.tag}</span>
              </button>
            )
          })}

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* Reset Camera Button */}
          <button
            onClick={() => switchPreset('station')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="复位至初始空间站视角"
          >
            <RotateCcw size={11} />
            <span className="hidden md:inline">复位</span>
          </button>
        </div>

        {/* Dynamic Flight Control & Telemetry Hint Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/70 border text-[9px] font-mono backdrop-blur-md shadow-md transition-colors ${
            redAlert
              ? 'border-red-500/40 text-red-200'
              : 'border-sky-400/30 text-sky-200/90'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-ping ${
              redAlert ? 'bg-red-500' : 'bg-sky-400'
            }`}
          />
          <span>
            {activePreset === 'station' && '当前: 空间站特写 · 点击零件光标深度聚焦 · 左键360°旋转'}
            {activePreset === 'earth' && '当前: 地球宏观全景 · 360°观察母星转动 · 右键平移视角 · 滚轮缩放'}
            {activePreset === 'nadir' && '当前: 穹顶对地俯瞰 · 直击地表气象云系与晨昏带'}
            {activePreset === 'deep' && '当前: 深空全景广角 · 空间站与地球共生轨道视角'}
          </span>
          <span className="text-white/30">|</span>
          <span className={redAlert ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {currentAltitude}
          </span>
        </div>
      </div>
    </div>
  )
}
