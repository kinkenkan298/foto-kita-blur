import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision'

export const Route = createFileRoute('/')({ component: Home })

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

type Point = Pick<NormalizedLandmark, 'y'>

export function isPeaceSign(points: Point[]) {
  if (points.length < 21) return false

  // ponytail: upright-hand heuristic, replace with angle-based classifier if poses get weird.
  const up = (tip: number, pip: number) => points[tip].y < points[pip].y - 0.02
  const down = (tip: number, pip: number) => points[tip].y > points[pip].y + 0.01

  return up(8, 6) && up(12, 10) && down(16, 14) && down(20, 18)
}

function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const frameRef = useRef(0)
  const [isPeace, setIsPeace] = useState(false)
  const [status, setStatus] = useState('Loading hand detector...')

  useEffect(() => {
    let stream: MediaStream | null = null
    let stopped = false

    async function startCamera() {
      try {
        const [{ FilesetResolver, HandLandmarker }, mediaStream] = await Promise.all([
          import('@mediapipe/tasks-vision'),
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }),
        ])

        if (stopped) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        stream = mediaStream
        const video = videoRef.current
        if (!video) return

        video.srcObject = mediaStream
        await video.play()

        const vision = await FilesetResolver.forVisionTasks(WASM_URL)
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL },
          numHands: 1,
          runningMode: 'VIDEO',
        })

        if (stopped) {
          handLandmarker.close()
          return
        }

        handLandmarkerRef.current = handLandmarker
        setStatus('Show ✌️ to blur')

        const detect = () => {
          const landmarker = handLandmarkerRef.current
          const currentVideo = videoRef.current

          if (landmarker && currentVideo?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
            const result = landmarker.detectForVideo(currentVideo, performance.now())
            const peace = result.landmarks.some(isPeaceSign)
            setIsPeace((current) => (current === peace ? current : peace))
          }

          frameRef.current = requestAnimationFrame(detect)
        }

        detect()
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Camera failed')
      }
    }

    startCamera()

    return () => {
      stopped = true
      cancelAnimationFrame(frameRef.current)
      handLandmarkerRef.current?.close()
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <div className="min-h-screen bg-pastel-grid flex flex-col items-center justify-center overflow-hidden px-4 py-8 relative">
      <div className="absolute inset-x-0 top-0 h-72 bg-linear-to-b from-rose-200/60 via-pink-100/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-12 left-10 text-rose-300 animate-float-heart-1 text-3xl pointer-events-none">💖</div>
      <div className="absolute top-28 right-12 text-rose-300 animate-float-heart-2 text-2xl pointer-events-none">🌸</div>
      <div className="absolute bottom-24 left-8 text-rose-300 animate-float-heart-3 text-3xl pointer-events-none">🧸</div>
      <div className="absolute top-1/2 left-4 text-yellow-300 animate-twinkle-1 text-3xl pointer-events-none">⭐</div>
      <div className="absolute bottom-40 right-10 text-yellow-300 animate-twinkle-2 text-2xl pointer-events-none">✨</div>
      <div className="absolute top-16 right-1/4 text-yellow-300 animate-twinkle-3 text-xl pointer-events-none">✨</div>

      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl z-10">
        <div className="absolute -top-3 -left-3 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md -rotate-12 border border-yellow-200 pointer-events-none select-none z-20">
          {isPeace ? 'BLUR MODE! ✌️' : 'NO BLUR ! ⭐'}
        </div>
        <div className="absolute bottom-20 -right-3 bg-pink-100 text-pink-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md rotate-15 border border-pink-200 pointer-events-none select-none z-20">
          CUTE VIBES 💖
        </div>

        <div className="bg-[#ffd1dc]/90 rounded-[2rem] shadow-[0_30px_80px_rgba(244,114,182,0.35)] overflow-hidden p-5 sm:p-6 md:p-8 relative ring-4 ring-white/70 backdrop-blur">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-[6%] left-[6%] text-sm animate-twinkle-1">⭐</div>
            <div className="absolute top-[14%] right-[8%] text-xs animate-twinkle-2">⭐</div>
            <div className="absolute bottom-[30%] left-[5%] text-xs animate-twinkle-3">⭐</div>
            <div className="absolute bottom-[12%] right-[10%] text-sm animate-twinkle-1">⭐</div>
            <div className="absolute top-[45%] left-[3%] text-[10px] animate-twinkle-2">⭐</div>
            <div className="absolute top-[60%] right-[4%] text-[10px] animate-twinkle-3">⭐</div>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-[10%] right-[20%] text-xs animate-float-heart-1">💖</div>
            <div className="absolute top-[50%] right-[6%] text-xs animate-float-heart-2">💖</div>
            <div className="absolute bottom-[25%] left-[15%] text-xs animate-float-heart-3">💖</div>
            <div className="absolute top-[35%] left-[7%] text-[10px] animate-float-heart-1">💖</div>
          </div>

          <div className={`w-full aspect-4/3 bg-white/60 rounded-3xl overflow-hidden border-4 shadow-inner relative transition-all duration-300 ${isPeace ? 'border-rose-300 shadow-rose-300/60' : 'border-white'}`}>
            <video
              ref={videoRef}
              className={`h-full w-full object-cover scale-x-[-1] transition-[filter] duration-300 ${isPeace ? 'blur-sm' : ''}`}
              muted
              playsInline
              autoPlay
            />
            <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow transition-colors ${isPeace ? 'bg-rose-500 text-white' : 'bg-white/80 text-rose-500'}`}>
              {status}
            </div>
          </div>

          <div className="w-full text-center mt-5 sm:mt-6 flex flex-col items-center gap-0.5">
            <span className="font-black text-2xl sm:text-3xl tracking-wide text-rose-500 drop-shadow-sm">
              Foto Kita ✨
            </span>
            <span className="text-xs sm:text-sm italic font-semibold text-rose-400">
              {isPeace ? 'foto kita blur' : 'foto kita normal'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-rose-300 tracking-wider mt-3 uppercase">
              ⚡ FOTO KITA ⚡
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-10 text-center text-[9px] text-rose-400/60 font-semibold tracking-wider relative z-10">
        <span>© 2026 FOTOKITA. CRAFTED WITH 💖</span>
      </footer>
    </div>
  )
}
