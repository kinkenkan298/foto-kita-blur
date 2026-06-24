import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-screen bg-pastel-grid flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Decorative Floating Elements */}
      <div className="absolute top-12 left-10 text-rose-300 animate-float-heart-1 text-3xl pointer-events-none">💖</div>
      <div className="absolute top-28 right-12 text-rose-300 animate-float-heart-2 text-2xl pointer-events-none">🌸</div>
      <div className="absolute bottom-24 left-8 text-rose-300 animate-float-heart-3 text-3xl pointer-events-none">🧸</div>
      <div className="absolute top-1/2 left-4 text-yellow-300 animate-twinkle-1 text-3xl pointer-events-none">⭐</div>
      <div className="absolute bottom-40 right-10 text-yellow-300 animate-twinkle-2 text-2xl pointer-events-none">✨</div>
      <div className="absolute top-16 right-1/4 text-yellow-300 animate-twinkle-3 text-xl pointer-events-none">✨</div>

      {/* Photo Frame */}
      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl z-10">
        {/* Sticker: Top Left */}
        <div className="absolute -top-3 -left-3 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md rotate-[-12deg] border border-yellow-200 pointer-events-none select-none z-20">
          Gen-Z Vibes! ⭐
        </div>
        {/* Sticker: Bottom Right */}
        <div className="absolute bottom-20 -right-3 bg-pink-100 text-pink-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md rotate-[15deg] border border-pink-200 pointer-events-none select-none z-20">
          CUTE VIBES 💖
        </div>

        {/* The Frame Card */}
        <div className="bg-[#ffd1dc] rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 md:p-8 relative">
          {/* Star decorations on frame */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-[6%] left-[6%] text-sm animate-twinkle-1">⭐</div>
            <div className="absolute top-[14%] right-[8%] text-xs animate-twinkle-2">⭐</div>
            <div className="absolute bottom-[30%] left-[5%] text-xs animate-twinkle-3">⭐</div>
            <div className="absolute bottom-[12%] right-[10%] text-sm animate-twinkle-1">⭐</div>
            <div className="absolute top-[45%] left-[3%] text-[10px] animate-twinkle-2">⭐</div>
            <div className="absolute top-[60%] right-[4%] text-[10px] animate-twinkle-3">⭐</div>
          </div>

          {/* Heart decorations on frame */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-[10%] right-[20%] text-xs animate-float-heart-1">💖</div>
            <div className="absolute top-[50%] right-[6%] text-xs animate-float-heart-2">💖</div>
            <div className="absolute bottom-[25%] left-[15%] text-xs animate-float-heart-3">💖</div>
            <div className="absolute top-[35%] left-[7%] text-[10px] animate-float-heart-1">💖</div>
          </div>

          {/* Photo Slot */}
          <div className="w-full aspect-4/3 bg-white/60 rounded-2xl overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
            <div className="text-center p-6">
              <span className="text-5xl sm:text-6xl block mb-3">📸</span>
              <p className="text-rose-400 font-bold text-sm sm:text-base tracking-wide">Your Photo Here</p>
              <p className="text-rose-300 text-xs mt-1 font-medium">foto kita blur</p>
            </div>
          </div>

          {/* Caption Footer */}
          <div className="w-full text-center mt-5 sm:mt-6 flex flex-col items-center gap-0.5">
            <span className="font-bold text-lg sm:text-xl tracking-wide text-rose-500">
              Foto Kita ✨
            </span>
            <span className="text-xs sm:text-sm italic font-semibold text-rose-400">
              foto kita blur
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-rose-300 tracking-wider mt-3 uppercase">
              ⚡ FOTO KITA ⚡
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-[9px] text-rose-400/60 font-semibold tracking-wider relative z-10">
        <span>© 2026 FOTOKITA. CRAFTED WITH 💖</span>
      </footer>
    </div>
  )
}
