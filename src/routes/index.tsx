import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { 
  Camera, 
  Sparkles, 
  Heart, 
  Star, 
  Download, 
  RefreshCw, 
  Trash2, 
  Upload, 
  Info, 
  LayoutGrid, 
  Image as ImageIcon, 
  Check, 
  Smile,
  Instagram,
  Music,
  ArrowRight
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

type LayoutType = 'strip' | 'grid' | 'single'
type FrameType = 'pink' | 'starry' | 'hearts' | 'retro'
type FilterType = 'normal' | 'dreamy' | 'sunset' | 'vintage' | 'noir'

function Home() {
  const [layout, setLayout] = useState<LayoutType>('strip')
  const [frame, setFrame] = useState<FrameType>('pink')
  const [filter, setFilter] = useState<FilterType>('normal')
  const [photos, setPhotos] = useState<string[]>([])
  
  // Custom texts
  const [caption, setCaption] = useState('Foto Kita ✨')
  const [subCaption, setSubCaption] = useState('foto kita blur')
  
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [streamError, setStreamError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Interaction states
  const [countdown, setCountdown] = useState<number>(-1)
  const [isFlash, setIsFlash] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const maxPhotos = layout === 'single' ? 1 : 4

  // Audio helper using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime) // High note
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch (e) {
      console.log('Audio error:', e)
    }
  }

  const playShutter = () => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      
      // White noise buffer
      const bufferSize = ctx.sampleRate * 0.15
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      
      const biquadFilter = ctx.createBiquadFilter()
      biquadFilter.type = 'bandpass'
      biquadFilter.frequency.value = 1000
      
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      
      noise.connect(biquadFilter)
      biquadFilter.connect(gain)
      gain.connect(ctx.destination)
      
      noise.start()
    } catch (e) {
      console.log('Audio error:', e)
    }
  }

  // Camera start / stop logic
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          aspectRatio: 4/3
        },
        audio: false
      })
      
      setStream(mediaStream)
      setStreamError(false)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err)
      setStreamError(true)
    }
  }

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Show brief message
  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Trigger the photo countdown
  const startCapture = () => {
    if (photos.length >= maxPhotos && selectedSlot === null) {
      triggerToast('Penuh! Hapus atau pilih foto untuk diganti.')
      return
    }
    
    setCountdown(3)
  }

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      playBeep()
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      // Execute camera flash & shutter
      setIsFlash(true)
      playShutter()
      setTimeout(() => setIsFlash(false), 400)
      
      capturePhoto()
      setCountdown(-1)
    }
  }, [countdown])

  // Capture the photo from stream or fallback
  const capturePhoto = () => {
    let capturedUrl = ''

    if (stream && videoRef.current && !streamError) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = 640
      tempCanvas.height = 480
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        // Mirror the webcam image
        tempCtx.translate(640, 0)
        tempCtx.scale(-1, 1)
        tempCtx.drawImage(videoRef.current, 0, 0, 640, 480)
        capturedUrl = tempCanvas.toDataURL('image/jpeg', 0.9)
      }
    } else {
      // Demo fallback photo generator
      capturedUrl = generateDemoImage()
      triggerToast('Kamera demo aktif, gambar digenerasi otomatis! ✨')
    }

    if (capturedUrl) {
      if (selectedSlot !== null) {
        // Replace selected photo
        const updated = [...photos]
        updated[selectedSlot] = capturedUrl
        setPhotos(updated)
        setSelectedSlot(null)
        triggerToast('Foto berhasil diganti!')
      } else {
        // Add new photo
        setPhotos(prev => [...prev, capturedUrl])
      }
    }
  }

  // Generate cute demo placeholder
  const generateDemoImage = () => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 640
    tempCanvas.height = 480
    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return ''

    // Pastel gradient background
    const grad = ctx.createLinearGradient(0, 0, 640, 480)
    const gradients = [
      ['#ff9a9e', '#fecfef'],
      ['#fbc2eb', '#a6c1ee'],
      ['#fad0c4', '#ffd1dc'],
      ['#a1c4fd', '#c2e9fb']
    ]
    const selectedGrad = gradients[photos.length % gradients.length]
    grad.addColorStop(0, selectedGrad[0])
    grad.addColorStop(1, selectedGrad[1])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 640, 480)

    // Draw grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 1
    for (let x = 30; x < 640; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 480)
      ctx.stroke()
    }
    for (let y = 30; y < 480; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(640, y)
      ctx.stroke()
    }

    // Draw some cute circles & hearts
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    for (let i = 0; i < 6; i++) {
      const cx = 50 + Math.random() * 540
      const cy = 50 + Math.random() * 380
      const r = 10 + Math.random() * 20
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw a big heart in center
    ctx.save()
    ctx.shadowColor = 'rgba(255, 105, 180, 0.3)'
    ctx.shadowBlur = 8
    drawHeartShape(ctx, 320, 210, 80, 80, 'rgba(255, 255, 255, 0.95)')
    ctx.restore()

    // Add caption
    ctx.fillStyle = '#ff6b8b'
    ctx.font = 'bold 36px "Fredoka", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Selfie Gen-Z ✨', 320, 215)

    ctx.fillStyle = '#ff8fa3'
    ctx.font = 'italic 20px "Outfit", sans-serif'
    ctx.fillText(`Foto #${photos.length + 1} • Kece Maksimal`, 320, 250)

    return tempCanvas.toDataURL('image/jpeg')
  }

  // Draw heart shape utility
  const drawHeartShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) => {
    ctx.beginPath()
    const topCurveHeight = height * 0.3
    ctx.moveTo(x, y + topCurveHeight)
    // top-left curve
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight)
    // bottom-left curve
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + height, x, y + height)
    // bottom-right curve
    ctx.bezierCurveTo(x, y + height, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight)
    // top-right curve
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  const drawStarShape = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ) => {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }
    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  // File Upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string
        if (selectedSlot !== null) {
          const updated = [...photos]
          updated[selectedSlot] = url
          setPhotos(updated)
          setSelectedSlot(null)
          triggerToast('Foto diganti dengan file unggahan!')
        } else if (photos.length < maxPhotos) {
          setPhotos(prev => [...prev, url])
          triggerToast('Foto berhasil diunggah!')
        } else {
          triggerToast('Slot penuh! Ganti foto dengan memilih salah satu.')
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Remove photo helper
  const deleteLastPhoto = () => {
    if (photos.length === 0) return
    setPhotos(prev => prev.slice(0, -1))
    triggerToast('Foto terakhir dihapus')
  }

  const resetAllPhotos = () => {
    setPhotos([])
    setSelectedSlot(null)
    triggerToast('Semua foto dibersihkan!')
  }

  // Get filter CSS string
  const getFilterStyle = (f: FilterType) => {
    switch (f) {
      case 'dreamy':
        return 'brightness-105 contrast-95 saturate-110 blur-[0.5px]'
      case 'sunset':
        return 'sepia saturate-130 contrast-105 hue-rotate-[-10deg]'
      case 'vintage':
        return 'sepia-[0.4] contrast-85 brightness-105 saturate-90'
      case 'noir':
        return 'grayscale contrast-120 brightness-95'
      default:
        return ''
    }
  }

  // Exporter Canvas Stitch logic
  const handleDownload = () => {
    if (photos.length < maxPhotos) {
      triggerToast(`Ambil ${maxPhotos - photos.length} foto lagi sebelum mengunduh!`)
      return
    }

    triggerToast('Menyiapkan foto cantikmu... 💖')

    // Parameters based on layout
    let w = 400
    let h = 1200
    
    if (layout === 'grid') {
      w = 600
      h = 750
    } else if (layout === 'single') {
      w = 460
      h = 550
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw background based on frame style
    drawFrameBackground(ctx, w, h)

    // Load and draw all images
    const loadImages = photos.map(src => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
        img.src = src
      })
    })

    Promise.all(loadImages).then(loadedImgs => {
      // Filter setup mapping
      const applyFilter = (filterType: FilterType) => {
        switch (filterType) {
          case 'dreamy':
            ctx.filter = 'brightness(1.05) contrast(0.95) saturate(1.1) blur(0.5px)'
            break
          case 'sunset':
            ctx.filter = 'sepia(0.3) saturate(1.3) contrast(1.05) hue-rotate(-10deg)'
            break
          case 'vintage':
            ctx.filter = 'sepia(0.4) contrast(0.85) brightness(1.05) saturate(0.9)'
            break
          case 'noir':
            ctx.filter = 'grayscale(100%) contrast(120%) brightness(95%)'
            break
          default:
            ctx.filter = 'none'
        }
      }

      if (layout === 'strip') {
        const imgW = w - 40 // 360
        const imgH = 220
        const startX = 20
        const startY = 25
        const gap = 15

        loadedImgs.forEach((img, idx) => {
          const y = startY + idx * (imgH + gap)
          
          // White picture backing (border card)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(startX - 4, y - 4, imgW + 8, imgH + 8)

          ctx.save()
          applyFilter(filter)
          // Crop and center image inside 360x220 container
          drawCroppedImage(ctx, img, startX, y, imgW, imgH)
          ctx.restore()
        })

        // Draw custom caption text
        drawFooterCaption(ctx, w, h - 90, caption, subCaption)

      } else if (layout === 'grid') {
        const imgW = 250
        const imgH = 190
        const startX = 35
        const startY = 35
        const gapX = 30
        const gapY = 25

        loadedImgs.forEach((img, idx) => {
          const col = idx % 2
          const row = Math.floor(idx / 2)
          const x = startX + col * (imgW + gapX)
          const y = startY + row * (imgH + gapY)

          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x - 4, y - 4, imgW + 8, imgH + 8)

          ctx.save()
          applyFilter(filter)
          drawCroppedImage(ctx, img, x, y, imgW, imgH)
          ctx.restore()
        })

        drawFooterCaption(ctx, w, h - 110, caption, subCaption)

      } else if (layout === 'single') {
        const imgW = w - 60 // 400
        const imgH = 340
        const x = 30
        const y = 30

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x - 6, y - 6, imgW + 12, imgH + 12)

        ctx.save()
        applyFilter(filter)
        drawCroppedImage(ctx, loadedImgs[0], x, y, imgW, imgH)
        ctx.restore()

        drawFooterCaption(ctx, w, h - 110, caption, subCaption)
      }

      // Convert to file download
      const link = document.createElement('a')
      link.download = `fotokita-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      triggerToast('Foto cantikmu berhasil diunduh! 💖')
    }).catch(err => {
      console.error(err)
      triggerToast('Gagal memproses gambar. Coba lagi.')
    })
  }

  // Draw background frame styled canvas
  const drawFrameBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (frame === 'pink') {
      ctx.fillStyle = '#ffd1dc'
      ctx.fillRect(0, 0, w, h)
      
      // Subtle overlay grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      for (let x = 20; x < w; x += 25) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
    } else if (frame === 'starry') {
      // Pink gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#ffd1dc')
      grad.addColorStop(0.5, '#ffe4e1')
      grad.addColorStop(1, '#ffccd5')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Draw cute yellow stars
      ctx.save()
      for (let i = 0; i < 15; i++) {
        const sx = Math.random() * w
        const sy = Math.random() * h
        const size = 6 + Math.random() * 8
        drawStarShape(ctx, sx, sy, 5, size, size / 2.2, '#fff6a3')
      }
      ctx.restore()
    } else if (frame === 'hearts') {
      ctx.fillStyle = '#fff0f5'
      ctx.fillRect(0, 0, w, h)

      // Pink stripes background
      ctx.strokeStyle = 'rgba(255, 182, 193, 0.2)'
      ctx.lineWidth = 12
      for (let i = -h; i < w + h; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + h, h)
        ctx.stroke()
      }

      // Scatter cute hearts
      ctx.save()
      for (let i = 0; i < 12; i++) {
        const hx = Math.random() * w
        const hy = Math.random() * h
        const hSize = 12 + Math.random() * 10
        drawHeartShape(ctx, hx, hy, hSize, hSize, '#ffb6c1')
      }
      ctx.restore()
    } else if (frame === 'retro') {
      // Neon/y2k gradient
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#ff007f')
      grad.addColorStop(0.5, '#e0115f')
      grad.addColorStop(1, '#7b1fa2')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Draw starry circles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * w, Math.random() * h, 20 + Math.random() * 40, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  // Draw cropped center of photo on canvas
  const drawCroppedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const imgRatio = img.width / img.height
    const destRatio = dw / dh

    let sx = 0
    let sy = 0
    let sw = img.width
    let sh = img.height

    if (imgRatio > destRatio) {
      // Width is too wide, crop horizontally
      sw = img.height * destRatio
      sx = (img.width - sw) / 2
    } else {
      // Height is too tall, crop vertically
      sh = img.width / destRatio
      sy = (img.height - sh) / 2
    }

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  }

  // Draw captions in custom fonts
  const drawFooterCaption = (
    ctx: CanvasRenderingContext2D,
    w: number,
    baseY: number,
    titleText: string,
    subText: string
  ) => {
    ctx.textAlign = 'center'
    
    // Draw Title
    ctx.fillStyle = frame === 'retro' ? '#ffffff' : '#ff4d6d'
    ctx.font = 'bold 26px "Fredoka", Arial, sans-serif'
    ctx.fillText(titleText, w / 2, baseY)

    // Draw Subtitle / Date
    ctx.fillStyle = frame === 'retro' ? 'rgba(255, 255, 255, 0.8)' : '#ff758f'
    ctx.font = 'italic 16px "Outfit", Arial, sans-serif'
    ctx.fillText(subText, w / 2, baseY + 28)

    // Stamp brand watermarks
    ctx.fillStyle = frame === 'retro' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 77, 109, 0.4)'
    ctx.font = 'bold 12px "Fredoka", Arial, sans-serif'
    ctx.fillText('⚡ FOTO KITA ⚡', w / 2, baseY + 60)
  }

  return (
    <div className="min-h-screen bg-pastel-grid py-6 px-4 relative flex flex-col items-center">
      {/* Decorative Floating Elements */}
      <div className="absolute top-12 left-10 text-rose-300 animate-float-heart-1 text-3xl pointer-events-none">💖</div>
      <div className="absolute top-28 right-12 text-rose-300 animate-float-heart-2 text-2xl pointer-events-none">🌸</div>
      <div className="absolute bottom-24 left-8 text-rose-300 animate-float-heart-3 text-3xl pointer-events-none">🧸</div>
      <div className="absolute top-1/2 left-4 text-yellow-300 animate-twinkle-1 text-3xl pointer-events-none">⭐</div>
      <div className="absolute bottom-40 right-10 text-yellow-300 animate-twinkle-2 text-2xl pointer-events-none">✨</div>
      <div className="absolute top-16 right-1/4 text-yellow-300 animate-twinkle-3 text-xl pointer-events-none">✨</div>

      {/* Main Container */}
      <div className="w-full max-w-md md:max-w-4xl flex flex-col md:flex-row gap-6 items-start justify-center relative z-10">
        
        {/* LEFT COLUMN: Camera & Control panel */}
        <div className="w-full md:w-7/12 flex flex-col gap-5">
          {/* Header Card */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-rose-400 p-2 rounded-xl text-white shadow-sm shadow-rose-200 animate-bounce">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-rose-500 tracking-wide flex items-center gap-1">
                  FotoKita <span className="text-yellow-400">✨</span>
                </h1>
                <p className="text-xs text-rose-400 font-medium">foto kita blur</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
              >
                <Music className={`w-5 h-5 ${soundEnabled ? 'opacity-100' : 'opacity-40'}`} />
              </button>
              <button 
                onClick={() => setShowInfoModal(true)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Camera Feed / Frame Box */}
          <div className="glass-panel rounded-2xl p-4 shadow-md flex flex-col items-center relative overflow-hidden">
            
            {/* Countdown overlay */}
            {countdown > -1 && (
              <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                <span className="text-7xl font-bold font-mono animate-scale-up text-pink-300">
                  {countdown === 0 ? 'CHEESE! 📸' : countdown}
                </span>
                <p className="mt-4 text-sm font-medium tracking-widest text-pink-200">SIAP-SIAP POSE YA!</p>
              </div>
            )}

            {/* Flash Overlay Effect */}
            {isFlash && <div className="absolute inset-0 bg-white z-40 camera-flash" />}

            {/* Frame border preview wrapper (mirrors the final aesthetic) */}
            <div className={`w-full aspect-[4/3] rounded-xl border-4 border-white shadow-inner bg-slate-900 relative overflow-hidden group`}>
              {streamError ? (
                // Fallback stream message
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
                  <div className="p-4 rounded-full bg-slate-900 text-pink-400 mb-2 animate-pulse">
                    <Camera className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-white">Kamera Demo Aktif</span>
                  <span className="text-xs mt-1 text-slate-500 max-w-xs">Webcam diblokir atau tidak terdeteksi. Kamu tetap bisa capture (gambar demo) atau unggah foto sendiri!</span>
                </div>
              ) : (
                // Live Webcam stream
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${getFilterStyle(filter)}`}
                />
              )}

              {/* Overlay graphics */}
              <div className="absolute top-3 left-3 text-[10px] bg-black/40 text-rose-300 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>REC LIVE</span>
              </div>

              {/* Guide Overlay Grid Lines (Toggleable or subtle representation) */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none">
                <div className="absolute inset-x-0 top-1/3 border-b border-white/10" />
                <div className="absolute inset-x-0 top-2/3 border-b border-white/10" />
                <div className="absolute inset-y-0 left-1/3 border-r border-white/10" />
                <div className="absolute inset-y-0 left-2/3 border-r border-white/10" />
              </div>
            </div>

            {/* Capture controls */}
            <div className="w-full flex items-center justify-between gap-3 mt-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-rose-300 text-rose-500 hover:bg-rose-50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Unggah Foto</span>
              </button>
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button 
                onClick={startCapture}
                className="flex-[2] py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-base hover:from-rose-500 hover:to-pink-600 transition-all duration-300 shadow-md shadow-pink-200 hover:shadow-lg hover:shadow-pink-300 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{selectedSlot !== null ? `Ganti Foto #${selectedSlot + 1} 📸` : 'Ambil Pose! 📸'}</span>
              </button>
            </div>

            {selectedSlot !== null && (
              <div className="mt-3 text-xs text-rose-500 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                <span>Mengganti Foto Slot #{selectedSlot + 1}. Tekan "Ambil Pose!" atau "Unggah Foto".</span>
                <button onClick={() => setSelectedSlot(null)} className="underline hover:text-rose-700 ml-1">Batal</button>
              </div>
            )}
          </div>

          {/* Style Controls Card */}
          <div className="glass-panel rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            {/* Filter Selector */}
            <div>
              <span className="text-sm font-bold text-rose-500 tracking-wide block mb-2">1. Pilih Filter Aesthetic 🎨</span>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'normal', name: 'Original', desc: 'No Filter' },
                  { id: 'dreamy', name: 'Dreamy', desc: 'Blur Glow' },
                  { id: 'sunset', name: 'Sunset', desc: 'Gold Hue' },
                  { id: 'vintage', name: 'Vintage', desc: 'Warm Retro' },
                  { id: 'noir', name: 'Noir', desc: 'B&W Vintage' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id as FilterType)}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                      filter === item.id 
                        ? 'bg-rose-400 text-white font-bold shadow-md shadow-rose-100 scale-105' 
                        : 'bg-white hover:bg-rose-50 text-slate-600 border border-rose-100'
                    }`}
                  >
                    <span className="text-xs truncate max-w-full">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Style Selector */}
            <div>
              <span className="text-sm font-bold text-rose-500 tracking-wide block mb-2">2. Pilih Frame Pastel 🎀</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'pink', name: 'Sweet Pink', color: 'bg-[#ffd1dc]' },
                  { id: 'starry', name: 'Starry Sky', color: 'bg-gradient-to-b from-[#ffd1dc] to-[#ffe4e1]' },
                  { id: 'hearts', name: 'Hearts Grid', color: 'bg-[#fff0f5]' },
                  { id: 'retro', name: 'Y2K Glow', color: 'bg-gradient-to-r from-[#ff007f] to-[#7b1fa2]' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFrame(item.id as FrameType)}
                    className={`p-1.5 rounded-xl border-2 transition-all flex flex-col items-center ${
                      frame === item.id 
                        ? 'border-rose-400 scale-105 shadow-md' 
                        : 'border-transparent bg-white hover:bg-rose-50'
                    }`}
                  >
                    <div className={`w-full h-8 rounded-lg ${item.color} mb-1 border border-black/10`} />
                    <span className="text-[10px] font-semibold text-slate-700">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout selector */}
            <div>
              <span className="text-sm font-bold text-rose-500 tracking-wide block mb-2">3. Layout Format 📐</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'strip', name: '4-Cuts Strip', desc: 'Classic Vertical' },
                  { id: 'grid', name: '2x2 Collage', desc: 'Grid View' },
                  { id: 'single', name: 'Polaroid Single', desc: 'Square Frame' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setLayout(item.id as LayoutType)
                      setPhotos([]) // Clear to fit new counts
                      setSelectedSlot(null)
                    }}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                      layout === item.id 
                        ? 'bg-rose-400 text-white font-bold shadow-md shadow-rose-100 scale-105' 
                        : 'bg-white hover:bg-rose-50 text-slate-600 border border-rose-100'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.name}</span>
                    <span className="text-[9px] opacity-70 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Caption Input */}
            <div>
              <span className="text-sm font-bold text-rose-500 tracking-wide block mb-1">4. Tulisan Frame ✍️</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulisan Utama"
                  maxLength={18}
                  className="flex-1 px-3 py-2 text-xs border border-rose-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-700"
                />
                <input 
                  type="text" 
                  value={subCaption}
                  onChange={(e) => setSubCaption(e.target.value)}
                  placeholder="Tulisan Sub / Tanggal"
                  maxLength={24}
                  className="flex-1 px-3 py-2 text-xs border border-rose-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Photo Strip Preview */}
        <div className="w-full md:w-5/12 flex flex-col items-center gap-4">
          <div className="text-center md:text-left w-full">
            <span className="text-sm font-bold text-rose-500 uppercase tracking-wider block mb-1">Preview Foto Strip</span>
            <p className="text-xs text-rose-400">Klik slot foto di bawah untuk mengganti pose tertentu.</p>
          </div>

          {/* Photo strip component with selected frame style */}
          <div className="relative group">
            {/* The actual styled photobox container */}
            <div 
              id="photo-strip-render"
              className={`transition-all duration-300 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center relative ${
                frame === 'pink' ? 'bg-[#ffd1dc]' : ''
              } ${
                frame === 'starry' ? 'bg-gradient-to-b from-[#ffd1dc] via-[#ffe4e1] to-[#ffccd5]' : ''
              } ${
                frame === 'hearts' ? 'bg-[#fff0f5] border-pink-100' : ''
              } ${
                frame === 'retro' ? 'bg-gradient-to-br from-[#ff007f] via-[#e0115f] to-[#7b1fa2]' : ''
              } ${
                layout === 'strip' ? 'w-[280px] p-4 pt-5 pb-8' : ''
              } ${
                layout === 'grid' ? 'w-[320px] p-5 pt-6 pb-9' : ''
              } ${
                layout === 'single' ? 'w-[300px] p-5 pt-5 pb-9' : ''
              }`}
            >
              {/* Optional stars/hearts drawn with CSS for starry/heart backgrounds */}
              {frame === 'starry' && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute top-[10%] left-[8%] text-xs">⭐</div>
                  <div className="absolute top-[25%] right-[10%] text-sm">⭐</div>
                  <div className="absolute top-[50%] left-[12%] text-xs">⭐</div>
                  <div className="absolute top-[70%] right-[15%] text-xs">⭐</div>
                  <div className="absolute bottom-[15%] left-[25%] text-sm">⭐</div>
                </div>
              )}

              {frame === 'hearts' && (
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <div className="absolute top-[8%] left-[20%] text-xs">💖</div>
                  <div className="absolute top-[35%] right-[12%] text-xs">💖</div>
                  <div className="absolute top-[55%] left-[8%] text-xs">💖</div>
                  <div className="absolute bottom-[20%] right-[25%] text-xs">💖</div>
                </div>
              )}

              {/* Layout: STRIP (4-cuts stacked) */}
              {layout === 'strip' && (
                <div className="flex flex-col gap-3 w-full">
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const hasPhoto = photos[idx]
                    const isSelected = selectedSlot === idx
                    return (
                      <div 
                        key={idx}
                        onClick={() => hasPhoto && setSelectedSlot(idx)}
                        className={`w-full aspect-[3/2] bg-[#e2e8f0]/40 rounded-lg overflow-hidden border-2 border-white/90 relative cursor-pointer group shadow-sm transition-all duration-200 hover:scale-[1.02] ${
                          isSelected ? 'ring-4 ring-rose-400 ring-offset-2' : ''
                        }`}
                      >
                        {hasPhoto ? (
                          <img 
                            src={photos[idx]} 
                            alt={`Pose ${idx + 1}`}
                            className={`w-full h-full object-cover scale-x-[-1] ${getFilterStyle(filter)}`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300 hover:text-rose-400 transition-colors">
                            <span className="text-xl font-bold font-mono text-white/90 bg-rose-300/60 rounded-full w-8 h-8 flex items-center justify-center shadow-inner">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold mt-1 tracking-wider text-pink-500 bg-white/40 px-2 py-0.5 rounded-full">EMPTY SLOT</span>
                          </div>
                        )}
                        {hasPhoto && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity rounded-lg">
                            Ganti Pose #{idx + 1} 📸
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Layout: GRID (2x2 grid) */}
              {layout === 'grid' && (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const hasPhoto = photos[idx]
                    const isSelected = selectedSlot === idx
                    return (
                      <div 
                        key={idx}
                        onClick={() => hasPhoto && setSelectedSlot(idx)}
                        className={`w-full aspect-[4/3] bg-[#e2e8f0]/40 rounded-lg overflow-hidden border-2 border-white/90 relative cursor-pointer group shadow-sm transition-all duration-200 hover:scale-[1.02] ${
                          isSelected ? 'ring-4 ring-rose-400 ring-offset-2' : ''
                        }`}
                      >
                        {hasPhoto ? (
                          <img 
                            src={photos[idx]} 
                            alt={`Pose ${idx + 1}`}
                            className={`w-full h-full object-cover scale-x-[-1] ${getFilterStyle(filter)}`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300">
                            <span className="text-lg font-bold font-mono text-white/90 bg-rose-300/60 rounded-full w-7 h-7 flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-[9px] font-bold mt-1 tracking-wider text-pink-500 bg-white/40 px-1.5 py-0.5 rounded-full">EMPTY</span>
                          </div>
                        )}
                        {hasPhoto && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity rounded-lg">
                            Ganti #{idx + 1} 📸
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Layout: SINGLE (Polaroid layout) */}
              {layout === 'single' && (
                <div className="w-full">
                  {(() => {
                    const hasPhoto = photos[0]
                    const isSelected = selectedSlot === 0
                    return (
                      <div 
                        onClick={() => hasPhoto && setSelectedSlot(0)}
                        className={`w-full aspect-[4/3] bg-[#e2e8f0]/40 rounded-lg overflow-hidden border-2 border-white/90 relative cursor-pointer group shadow-sm transition-all duration-200 hover:scale-[1.01] ${
                          isSelected ? 'ring-4 ring-rose-400 ring-offset-2' : ''
                        }`}
                      >
                        {hasPhoto ? (
                          <img 
                            src={photos[0]} 
                            alt="Pose Polaroid"
                            className={`w-full h-full object-cover scale-x-[-1] ${getFilterStyle(filter)}`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300">
                            <Camera className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-[10px] font-bold tracking-wider text-pink-500 bg-white/40 px-2 py-0.5 rounded-full">POSE KOSONG</span>
                          </div>
                        )}
                        {hasPhoto && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity rounded-lg">
                            Ganti Pose 📸
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Strip Footer / Branding (dynamic custom labels) */}
              <div className="w-full text-center mt-5 flex flex-col items-center">
                <span className={`font-bold text-base tracking-wide ${frame === 'retro' ? 'text-white' : 'text-rose-500'}`}>
                  {caption || 'Foto Kita ✨'}
                </span>
                <span className={`text-[10px] italic font-semibold ${frame === 'retro' ? 'text-white/80' : 'text-rose-400'} mt-0.5`}>
                  {subCaption || 'Momen Gemes 💖'}
                </span>
                <span className={`text-[9px] font-black ${frame === 'retro' ? 'text-white/40' : 'text-rose-300'} tracking-wider mt-3 uppercase`}>
                  ⚡ FOTO KITA ⚡
                </span>
              </div>
            </div>

            {/* Overlap stickers to represent Gen-Z decor style */}
            <div className="absolute top-2 -left-3 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-md rotate-[-12deg] border border-yellow-200 pointer-events-none select-none">
              Gen-Z Vibes! ⭐
            </div>
            <div className="absolute bottom-16 -right-4 bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-md text-[9px] font-bold shadow-md rotate-[15deg] border border-pink-200 pointer-events-none select-none">
              CUTE VIBES 💖
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-[280px] md:w-full max-w-[320px] flex flex-col gap-2.5 mt-2">
            <button
              onClick={handleDownload}
              disabled={photos.length < maxPhotos}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                photos.length === maxPhotos
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 active:scale-95 shadow-emerald-100 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>UNDUH FOTO STRIP (PNG)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={deleteLastPhoto}
                disabled={photos.length === 0}
                className={`py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  photos.length > 0
                    ? 'border-rose-200 text-rose-500 hover:bg-rose-50 active:scale-95'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terakhir</span>
              </button>

              <button
                onClick={resetAllPhotos}
                disabled={photos.length === 0}
                className={`py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  photos.length > 0
                    ? 'border-rose-200 text-rose-500 hover:bg-rose-50 active:scale-95'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Semua</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border-2 border-rose-100 animate-scale-up">
            <h3 className="text-xl font-bold text-rose-500 flex items-center gap-2 mb-3">
              Cara Main FotoKita 📸
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5 font-medium mb-5 list-disc pl-4">
              <li>Pilih layout format di strip controls (Strip 4-cuts, Collage 2x2, Polaroid).</li>
              <li>Pilih Filter aesthetic & Frame pastel pink/pastel gradients.</li>
              <li>Atur tulisan nama/tanggal di bagian footer frame.</li>
              <li>Tekan <span className="font-bold text-rose-500">"Ambil Pose!"</span> untuk mulai hitung mundur 3 detik. Pose di depan kamera!</li>
              <li>Jika webcam tidak tersedia, aplikasi akan menghasilkan foto demo secara otomatis. Kamu juga bisa menekan <span className="font-bold text-rose-500">"Unggah Foto"</span> untuk memakai fotomu sendiri!</li>
              <li>Klik foto di strip untuk menggantinya jika ada pose yang kurang sreg.</li>
              <li>Setelah semua slot terisi, tekan <span className="font-bold text-emerald-600">"UNDUH FOTO STRIP"</span> untuk menyimpannya sebagai PNG berkualitas tinggi!</li>
            </ul>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-rose-400 text-white rounded-xl font-bold text-sm hover:bg-rose-500 active:scale-95 transition-all cursor-pointer"
            >
              Mengerti & Mulai! 💖
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white py-2 px-4 rounded-full text-xs font-semibold shadow-lg shadow-rose-200 border border-rose-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{toast}</span>
        </div>
      )}
      
      {/* Footer copyright */}
      <footer className="mt-12 text-center text-[10px] text-rose-400/70 font-semibold tracking-wider relative z-10">
        <div className="flex justify-center items-center gap-2 mb-1">
          <Instagram className="w-3 h-3" />
          <span>@foto.kita.aesthetic</span>
        </div>
        <span>© 2026 FOTOKITA BY ANTIGRAVITY. CRAFTED WITH 💖</span>
      </footer>
    </div>
  )
}

