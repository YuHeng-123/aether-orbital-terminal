import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getAssetUrl } from '../utils/assets'

export default function Earth3DGlobe({ mode = 'optical', mouseNorm = { x: 50, y: 50 } }) {
  const containerRef = useRef(null)
  const animFrameRef = useRef(null)
  const orbitStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.25,
    rotY: -1.2,
    targetRotX: 0.25,
    targetRotY: -1.2,
    zoom: 6.8,
    targetZoom: 6.8,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0.5, 6.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 2. Space Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.5)
    scene.add(ambientLight)

    // Powerful Sun Light from the upper right
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.6)
    sunLight.position.set(18, 12, 14)
    scene.add(sunLight)

    // Soft Earth Blue Rim Light
    const earthRim = new THREE.DirectionalLight(0x38bdf8, 1.6)
    earthRim.position.set(-14, -8, -6)
    scene.add(earthRim)

    // 3. Deep Space Starfield
    const starCount = 2000
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    const starCols = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 120
      starPos[i + 1] = (Math.random() - 0.5) * 90
      starPos[i + 2] = (Math.random() - 0.5) * 80 - 15

      const c = 0.6 + Math.random() * 0.4
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

    // 4. Photorealistic NASA 3D Earth
    const textureLoader = new THREE.TextureLoader()
    const dayTexture = textureLoader.load(
      getAssetUrl('earth_day.jpg'),
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        earthMat.map = tex
        earthMat.needsUpdate = true
      }
    )
    dayTexture.colorSpace = THREE.SRGBColorSpace

    const nightTexture = textureLoader.load(
      getAssetUrl('earth_night.jpg'),
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        earthMat.emissiveMap = tex
        earthMat.needsUpdate = true
      }
    )
    nightTexture.colorSpace = THREE.SRGBColorSpace

    const cloudsTexture = textureLoader.load(
      getAssetUrl('earth_clouds.jpg'),
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        cloudMat.map = tex
        cloudMat.needsUpdate = true
      }
    )

    // Earth Base Sphere (Continents + Oceans + Night City Lights)
    const earthRadius = 2.4
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64)
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.08,
      emissiveMap: nightTexture,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.85,
    })
    const earthMesh = new THREE.Mesh(earthGeo, earthMat)
    scene.add(earthMesh)

    // Independent Cloud Swirl Layer (Moves faster than Earth surface)
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.008, 64, 64)
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      roughness: 1.0,
    })
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
    scene.add(cloudMesh)

    // Atmospheric Rayleigh Scattering Outer Shell
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.045, 64, 64)
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat)
    scene.add(atmosMesh)

    // 5. Orbital Path Ring of Space Station Aurora-01
    const orbitRingGeo = new THREE.TorusGeometry(earthRadius * 1.35, 0.006, 16, 100)
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    })
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat)
    orbitRing.rotation.x = Math.PI / 2.3
    scene.add(orbitRing)

    // Orbiting Satellite Beacon on the Ring
    const satGeo = new THREE.SphereGeometry(0.045, 12, 12)
    const satMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
    const satMesh = new THREE.Mesh(satGeo, satMat)
    scene.add(satMesh)

    // 6. Interactive 360° Drag & Zoom Handlers
    const dom = renderer.domElement

    const onMouseDown = (e) => {
      orbitStateRef.current.isDragging = true
      orbitStateRef.current.prevX = e.clientX
      orbitStateRef.current.prevY = e.clientY
    }

    const onMouseMove = (e) => {
      if (!orbitStateRef.current.isDragging) return
      const deltaX = e.clientX - orbitStateRef.current.prevX
      const deltaY = e.clientY - orbitStateRef.current.prevY
      orbitStateRef.current.prevX = e.clientX
      orbitStateRef.current.prevY = e.clientY

      orbitStateRef.current.targetRotY += deltaX * 0.007
      orbitStateRef.current.targetRotX = Math.max(-1.4, Math.min(1.4, orbitStateRef.current.targetRotX + deltaY * 0.007))
    }

    const onMouseUp = () => {
      orbitStateRef.current.isDragging = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      orbitStateRef.current.targetZoom = Math.max(3.4, Math.min(10.0, orbitStateRef.current.targetZoom + e.deltaY * 0.004))
    }

    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // 7. Animation Loop with Real Planetary Rotation
    let clock = new THREE.Clock()

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()
      const st = orbitStateRef.current

      // Interpolate drag rotation & zoom
      st.rotX += (st.targetRotX - st.rotX) * 0.1
      st.rotY += (st.targetRotY - st.rotY) * 0.1
      st.zoom += (st.targetZoom - st.zoom) * 0.1

      // Earth Axial Rotation (Continents drift smoothly)
      earthMesh.rotation.y += 0.001
      // Clouds drift at different speed (real weather movement)
      cloudMesh.rotation.y += 0.0016
      stars.rotation.y -= 0.0002

      // Satellite position moving along the orbit ring
      const satAngle = elapsedTime * 0.4
      const orbitR = earthRadius * 1.35
      satMesh.position.x = orbitR * Math.cos(satAngle)
      satMesh.position.z = orbitR * Math.sin(satAngle) * Math.cos(Math.PI / 2.3)
      satMesh.position.y = -orbitR * Math.sin(satAngle) * Math.sin(Math.PI / 2.3)

      // Spherical Camera Positioning
      const mouseParallaxX = (mouseNorm.x - 50) * 0.006
      const mouseParallaxY = -(mouseNorm.y - 50) * 0.006

      const totalRotY = st.rotY + mouseParallaxX
      const totalRotX = st.rotX + mouseParallaxY

      const r = st.zoom
      camera.position.x = r * Math.sin(totalRotY) * Math.cos(totalRotX)
      camera.position.y = 0.5 + r * Math.sin(totalRotX)
      camera.position.z = r * Math.cos(totalRotY) * Math.cos(totalRotX)
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('wheel', onWheel)
      renderer.dispose()
      if (container) container.innerHTML = ''
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  )
}
