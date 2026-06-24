import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { 
  Camera, 
  Sparkles, 
  Heart, 
  Star, 
  Download, 
  RefreshCw, 
  Upload, 
  Info, 
  Smile,
  Instagram,
  Music,
  RotateCcw
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

type FrameType = 'pink' | 'starry' | 'hearts' | 'retro'

function Home() {
  const [frame, setFrame] = useState<FrameType>('pink')
  const [photo, setPhoto] = useState<string | null>(null)
  
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
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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
      osc.frequency.setValueAtTime(880, ctx.currentTime)
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

  // Effect to manage camera stream when in live capture mode vs preview mode
  useEffect(() => {
    if (!photo) {
      startCamera()
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [photo])

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const startCapture = () => {
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown > 0) {
      playBeep()
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setIsFlash(true)
      playShutter()
      setTimeout(() => setIsFlash(false), 400)
      
      capturePhoto()
      setCountdown(-1)
    }
  }, [countdown])

  const capturePhoto = () => {
    let capturedUrl = ''

    if (stream && videoRef.current && !streamError) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = 640
      tempCanvas.height = 480
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.translate(640, 0)
        tempCtx.scale(-1, 1)
        tempCtx.drawImage(videoRef.current, 0, 0, 640, 480)
        capturedUrl = tempCanvas.toDataURL('image/jpeg', 0.9)
      }
    } else {
      capturedUrl = generateDemoImage()
      triggerToast('Kamera demo aktif, gambar digenerasi otomatis! ✨')
    }

    if (capturedUrl) {
      setPhoto(capturedUrl)
    }
  }

  const generateDemoImage = () => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 640
    tempCanvas.height = 480
    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return ''

    const grad = ctx.createLinearGradient(0, 0, 640, 480)
    grad.addColorStop(0, '#ff9a9e')
    grad.addColorStop(1, '#fecfef')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 640, 480)

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

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    for (let i = 0; i < 6; i++) {
      const cx = 50 + Math.random() * 540
      const cy = 50 + Math.random() * 380
      const r = 10 + Math.random() * 20
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.save()
    ctx.shadowColor = 'rgba(255, 105, 180, 0.3)'
    ctx.shadowBlur = 8
    drawHeartShape(ctx, 320, 210, 80, 80, 'rgba(255, 255, 255, 0.95)')
    ctx.restore()

    ctx.fillStyle = '#ff6b8b'
    ctx.font = 'bold 36px "Fredoka", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Selfie Kita ✨', 320, 215)

    ctx.fillStyle = '#ff8fa3'
    ctx.font = 'italic 20px "Outfit", sans-serif'
    ctx.fillText(`Momen Terindah • Kece Maksimal`, 320, 250)

    return tempCanvas.toDataURL('image/jpeg')
  }

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
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight)
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + height, x, y + height)
    ctx.bezierCurveTo(x, y + height, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight)
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string)
        triggerToast('Foto berhasil diunggah!')
      }
    }
    reader.readAsDataURL(file)
  }

  const resetPhoto = () => {
    setPhoto(null)
    triggerToast('Kembali ke mode kamera live')
  }

  const handleDownload = () => {
    if (!photo) return

    triggerToast('Menyiapkan foto cantikmu... 💖')

    const w = 460
    const h = 560

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawFrameBackground(ctx, w, h)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const imgW = w - 60
      const imgH = 340
      const x = 30
      const y = 30

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x - 6, y - 6, imgW + 12, imgH + 12)

      drawCroppedImage(ctx, img, x, y, imgW, imgH)
      drawFooterCaption(ctx, w, h - 110, caption, subCaption)

      const link = document.createElement('a')
      link.download = `fotokita-frame-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      triggerToast('Foto cantikmu berhasil diunduh! 💖')
    }
    img.onerror = () => {
      triggerToast('Gagal memproses gambar.')
    }
    img.src = photo
  }

  const drawFrameBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (frame === 'pink') {
      ctx.fillStyle = '#ffd1dc'
      ctx.fillRect(0, 0, w, h)
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      for (let x = 20; x < w; x += 25) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
    } else if (frame === 'starry') {
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#ffd1dc')
      grad.addColorStop(0.5, '#ffe4e1')
      grad.addColorStop(1, '#ffccd5')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

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

      ctx.strokeStyle = 'rgba(255, 182, 193, 0.2)'
      ctx.lineWidth = 12
      for (let i = -h; i < w + h; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + h, h)
        ctx.stroke()
      }

      ctx.save()
      for (let i = 0; i < 12; i++) {
        const hx = Math.random() * w
        const hy = Math.random() * h
        const hSize = 12 + Math.random() * 10
        drawHeartShape(ctx, hx, hy, hSize, hSize, '#ffb6c1')
      }
      ctx.restore()
    } else if (frame === 'retro') {
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#ff007f')
      grad.addColorStop(0.5, '#e0115f')
      grad.addColorStop(1, '#7b1fa2')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * w, Math.random() * h, 20 + Math.random() * 40, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

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
      sw = img.height * destRatio
      sx = (img.width - sw) / 2
    } else {
      sh = img.width / destRatio
      sy = (img.height - sh) / 2
    }

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  }

  const drawFooterCaption = (
    ctx: CanvasRenderingContext2D,
    w: number,
    baseY: number,
    titleText: string,
    subText: string
  ) => {
    ctx.textAlign = 'center'
    ctx.fillStyle = frame === 'retro' ? '#ffffff' : '#ff4d6d'
    ctx.font = 'bold 26px "Fredoka", Arial, sans-serif'
    ctx.fillText(titleText, w / 2, baseY)

    ctx.fillStyle = frame === 'retro' ? 'rgba(255, 255, 255, 0.8)' : '#ff758f'
    ctx.font = 'italic 16px "Outfit", Arial, sans-serif'
    ctx.fillText(subText, w / 2, baseY + 28)

    ctx.fillStyle = frame === 'retro' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 77, 109, 0.4)'
    ctx.font = 'bold 12px "Fredoka", Arial, sans-serif'
    ctx.fillText('⚡ FOTO KITA ⚡', w / 2, baseY + 60)
  }

  return (
    <div className="min-h-screen bg-pastel-grid py-8 px-4 relative flex flex-col items-center justify-center">
      <div className="absolute top-12 left-10 text-rose-300 animate-float-heart-1 text-3xl pointer-events-none">💖</div>
      <div className="absolute top-28 right-12 text-rose-300 animate-float-heart-2 text-2xl pointer-events-none">🌸</div>
      <div className="absolute bottom-24 left-8 text-rose-300 animate-float-heart-3 text-3xl pointer-events-none">🧸</div>
      <div className="absolute top-1/2 left-4 text-yellow-300 animate-twinkle-1 text-3xl pointer-events-none">⭐</div>
      <div className="absolute bottom-40 right-10 text-yellow-300 animate-twinkle-2 text-2xl pointer-events-none">✨</div>
      <div className="absolute top-16 right-1/4 text-yellow-300 animate-twinkle-3 text-xl pointer-events-none">✨</div>

      <div className="w-full max-w-sm glass-panel rounded-2xl p-4 flex items-center justify-between shadow-sm mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-rose-400 p-2 rounded-xl text-white shadow-sm shadow-rose-200 animate-bounce">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-500 tracking-wide flex items-center gap-1">
              FotoKita <span className="text-yellow-400">✨</span>
            </h1>
            <p className="text-xs text-rose-400 font-medium">foto kita blur</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
          >
            <Music className={`w-4 h-4 ${soundEnabled ? 'opacity-100' : 'opacity-40'}`} />
          </button>
          <button 
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10">
        <div className="relative group w-full">
          <div 
            id="photo-strip-render"
            className={`transition-all duration-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center relative w-full p-6 pt-6 pb-9 border border-rose-100/20 ${
              frame === 'pink' ? 'bg-[#ffd1dc]' : ''
            } ${
              frame === 'starry' ? 'bg-gradient-to-b from-[#ffd1dc] via-[#ffe4e1] to-[#ffccd5]' : ''
            } ${
              frame === 'hearts' ? 'bg-[#fff0f5] border-pink-100' : ''
            } ${
              frame === 'retro' ? 'bg-gradient-to-br from-[#ff007f] via-[#e0115f] to-[#7b1fa2]' : ''
            }`}
          >
            {frame === 'starry' && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[8%] left-[8%] text-xs">⭐</div>
                <div className="absolute top-[20%] right-[10%] text-sm">⭐</div>
                <div className="absolute top-[50%] left-[12%] text-xs">⭐</div>
                <div className="absolute top-[70%] right-[15%] text-xs">⭐</div>
                <div className="absolute bottom-[18%] left-[25%] text-sm">⭐</div>
              </div>
            )}

            {frame === 'hearts' && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-[6%] left-[20%] text-xs">💖</div>
                <div className="absolute top-[30%] right-[12%] text-xs">💖</div>
                <div className="absolute top-[55%] left-[8%] text-xs">💖</div>
                <div className="absolute bottom-[22%] right-[25%] text-xs">💖</div>
              </div>
            )}

            <div className="w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border-4 border-white/95 relative shadow-inner group/camera">
              {countdown > -1 && (
                <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                  <span className="text-6xl font-bold font-mono animate-scale-up text-pink-300">
                    {countdown === 0 ? 'CHEESE! 📸' : countdown}
                  </span>
                  <p className="mt-2 text-xs font-semibold tracking-widest text-pink-200 uppercase">SIAP-SIAP POSE YA!</p>
                </div>
              )}

              {isFlash && <div className="absolute inset-0 bg-white z-40 camera-flash" />}

              {!photo ? (
                streamError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
                    <div className="p-3 rounded-full bg-slate-900 text-pink-400 mb-2 animate-pulse">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-white">Kamera Demo Aktif</span>
                    <span className="text-[10px] mt-1 text-slate-500 max-w-[200px]">Webcam tidak terdeteksi. Kamu tetap bisa capture atau unggah foto!</span>
                  </div>
                ) : (
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )
              ) : (
                <img 
                  src={photo} 
                  alt="Foto Kita"
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}

              {!photo && (
                <div className="absolute top-3 left-3 text-[9px] bg-black/45 text-rose-300 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>REC LIVE</span>
                </div>
              )}
            </div>

            <div className="w-full text-center mt-5 flex flex-col items-center">
              <span className={`font-bold text-lg tracking-wide ${frame === 'retro' ? 'text-white' : 'text-rose-500'}`}>
                {caption || 'Foto Kita ✨'}
              </span>
              <span className={`text-xs italic font-semibold ${frame === 'retro' ? 'text-white/80' : 'text-rose-400'} mt-0.5`}>
                {subCaption || 'foto kita blur'}
              </span>
              <span className={`text-[9px] font-black ${frame === 'retro' ? 'text-white/40' : 'text-rose-300'} tracking-wider mt-3 uppercase`}>
                ⚡ FOTO KITA ⚡
              </span>
            </div>
          </div>

          <div className="absolute -top-3 -left-3 bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-lg text-[9px] font-bold shadow-md rotate-[-12deg] border border-yellow-200 pointer-events-none select-none">
            Gen-Z Vibes! ⭐
          </div>
          <div className="absolute bottom-20 -right-3 bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-lg text-[9px] font-bold shadow-md rotate-[15deg] border border-pink-200 pointer-events-none select-none">
            CUTE VIBES 💖
          </div>
        </div>

        <div className="w-full glass-panel rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <div className="flex gap-2">
            {!photo ? (
              <>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-3 rounded-xl border-2 border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold text-xs transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
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
                  disabled={countdown > -1}
                  className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm hover:from-rose-500 hover:to-pink-600 transition-all shadow-md shadow-pink-100 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Pose! 📸</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={resetPhoto}
                  className="flex-1 py-3 px-3 rounded-xl border-2 border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold text-xs transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Foto Ulang 🔄</span>
                </button>

                <button 
                  onClick={handleDownload}
                  className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-sm hover:from-emerald-500 hover:to-teal-600 transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>UNDUH FRAME (PNG)</span>
                </button>
              </>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-rose-500 tracking-wide block mb-2">Pilih Frame Pastel 🎀</span>
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
                  <div className={`w-full h-6 rounded-lg ${item.color} mb-1 border border-black/10`} />
                  <span className="text-[9px] font-semibold text-slate-700">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-rose-500 tracking-wide block mb-1.5">Tulisan Frame ✍️</span>
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

      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl relative border-2 border-rose-100 animate-scale-up">
            <h3 className="text-lg font-bold text-rose-500 flex items-center gap-1.5 mb-2.5">
              Cara Main FotoKita 📸
            </h3>
            <ul className="text-[11px] text-slate-600 space-y-2 font-medium mb-4 list-disc pl-4">
              <li>Pilih style Frame pastel pink (Sweet Pink, Starry, Hearts, Retro).</li>
              <li>Atur tulisan nama / tanggal di bagian bawah frame.</li>
              <li>Tekan <span className="font-bold text-rose-500">"Ambil Pose!"</span> untuk mulai hitung mundur 3 detik.</li>
              <li>Jika webcam tidak tersedia, aplikasi akan menghasilkan foto demo secara otomatis. Kamu juga bisa menekan <span className="font-bold text-rose-500">"Unggah Foto"</span> untuk memakai fotomu sendiri!</li>
              <li>Setelah foto terambil, klik <span className="font-bold text-emerald-600">"UNDUH FRAME"</span> untuk menyimpan foto berbingkaimu!</li>
              <li>Tekan <span className="font-bold text-rose-500">"Foto Ulang"</span> jika ingin mengambil pose baru.</li>
            </ul>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2 bg-rose-400 text-white rounded-xl font-bold text-xs hover:bg-rose-500 active:scale-95 transition-all cursor-pointer"
            >
              Mengerti & Mulai! 💖
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white py-1.5 px-3 rounded-full text-[10px] font-semibold shadow-lg shadow-rose-200 border border-rose-400 flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>{toast}</span>
        </div>
      )}
      
      <footer className="mt-8 text-center text-[9px] text-rose-400/70 font-semibold tracking-wider relative z-10">
        <div className="flex justify-center items-center gap-1.5 mb-1">
          <Instagram className="w-2.5 h-2.5" />
          <span>@foto.kita.aesthetic</span>
        </div>
        <span>© 2026 FOTOKITA BY ANTIGRAVITY. CRAFTED WITH 💖</span>
      </footer>
    </div>
  )
}
