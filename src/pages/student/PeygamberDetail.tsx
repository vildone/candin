import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Minus, Plus, MoveHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProgress } from "@/hooks/useProgress"
import { pdfjs, Document, Page } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

const peygamberData = {
  "hz-muhammed": {
    id: "hz-muhammed",
    title: "Hz. Muhammed (s.a.v.)",
    subtitle: "Son Peygamber",
    emoji: "🌹",
    pdf: "/siyer.pdf",
    sayfa: 438,
    aciklama: "Peygamber Efendimizin doğumundan vefatına kadar hayatı.",
    bolumler: [
      { sayfa: 1, baslik: "Doğumu ve Çocukluğu" },
      { sayfa: 91, baslik: "Gençliği ve Ticaret Hayatı" },
      { sayfa: 131, baslik: "Vahiy Meleği ile Tanışması" },
      { sayfa: 277, baslik: "Medine'ye Hicret" },
      { sayfa: 329, baslik: "Medine Hayatı" },
      { sayfa: 363, baslik: "Mekke'nin Fethi" },
      { sayfa: 415, baslik: "Vefatı" },
    ],
  },
}

// Sayfa çevirme yönüne göre animasyon
function pageTurnVariants(direction: number) {
  return {
    enter: {
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      rotateY: direction > 0 ? 30 : -30,
      scale: 0.92,
    },
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: {
      x: direction > 0 ? -200 : 200,
      opacity: 0,
      rotateY: direction > 0 ? -30 : 30,
      scale: 0.92,
    },
  }
}

export function PeygamberDetailScreen() {
  const { peygamberId } = useParams<{ peygamberId: string }>()
  const p = peygamberData[peygamberId as keyof typeof peygamberData]
  const { isLearned, markLearned, unmarkLearned } = useProgress()
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState(1.15)
  const [direction, setDirection] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ekran genişliğine göre başlangıç ölçeğini ayarla
  useEffect(() => {
    const w = window.innerWidth
    setScale(w < 480 ? 0.7 : w < 768 ? 0.85 : w < 1024 ? 1.0 : 1.15)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    setShowHint(true)
    // 5 saniye sonra ipucunu gizle
    const t = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(t)
  }, [peygamberId])

  if (!p) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-sm text-muted-foreground">Peygamber bulunamadı.</p>
        <Link to="/peygamberler" className="mt-4 inline-block text-sm font-medium text-primary">Geri Dön</Link>
      </div>
    )
  }

  const learned = isLearned("hikaye", p.id)

  const goToPage = useCallback((page: number, dir: number) => {
    if (page >= 1 && page <= numPages) {
      setDirection(dir)
      setCurrentPage(page)
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      setShowHint(false)
    }
  }, [numPages])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Yatay kaydırma dikeyden fazlaysa sayfa çevir
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goToPage(currentPage - 1, -1)  // sağa → önceki
      else goToPage(currentPage + 1, 1)             // sola → sonraki
    }
  }

  const handlePrev = () => goToPage(currentPage - 1, -1)
  const handleNext = () => goToPage(currentPage + 1, 1)

  return (
    <div
      className="relative min-h-svh bg-background flex flex-col select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2.5">
          <Link to="/peygamberler" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-3.5" /> Peygamberler
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">{p.emoji}</span>
            <p className="text-sm font-bold text-foreground">{p.title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => learned ? unmarkLearned("hikaye", p.id) : markLearned("hikaye", p.id)} className="text-xs h-9 px-3 font-semibold">
            {learned ? "✓ Okundu" : "Okundu"}
          </Button>
        </div>

        {/* Bölüm sekmeleri */}
        <div className="mx-auto max-w-4xl overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 px-3">
            {p.bolumler.map((bolum, i) => {
              const isActive = currentPage >= bolum.sayfa && (i === p.bolumler.length - 1 || currentPage < p.bolumler[i + 1].sayfa)
              return (
                <button
                  key={i}
                  onClick={() => goToPage(bolum.sayfa, currentPage < bolum.sayfa ? 1 : -1)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive ? "bg-primary text-primary-foreground"
                      : currentPage >= bolum.sayfa ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {bolum.baslik}
                </button>
              )
            })}
            <div className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {currentPage}/{numPages || p.sayfa}
            </span>
          </div>
        </div>
      </div>

      {/* PDF Okuyucu Alanı */}
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-muted/20 relative">
        <div className="mx-auto flex max-w-3xl justify-center py-4 px-2 min-h-[60vh]">
          <Document
            file={p.pdf}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground">Yükleniyor...</p>
                </div>
              </div>
            }
            className="flex flex-col items-center justify-center gap-3"
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageTurnVariants(direction)}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 260, damping: 28, mass: 1.2 }}
                className="rounded-lg shadow-xl overflow-hidden bg-white origin-center"
                style={{ perspective: 1200, minHeight: 400 }}
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="[&_canvas]:!max-w-full [&_canvas]:!h-auto"
                />
              </motion.div>
            </AnimatePresence>
          </Document>
        </div>

        {/* Swipe ipucu */}
        <AnimatePresence>
          {showHint && numPages > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
            >
              <div className="flex items-center gap-6 text-muted-foreground/60">
                <motion.span
                  animate={{ x: [-8, 0, -8] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <MoveHorizontal className="size-8" />
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground/60 font-medium">
                Kaydırarak sayfayı çevir
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alt kontrol barı */}
      <div
        className="sticky bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2.5 flex-wrap sm:flex-nowrap">
          {/* Zoom */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(s - 0.15, 0.6))} disabled={scale <= 0.6} className="h-10 w-10 p-0">
              <Minus className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center font-medium">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(s + 0.15, 2.5))} disabled={scale >= 2.5} className="h-10 w-10 p-0">
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Sayfa navigasyonu */}
          <div className="flex items-center gap-2 order-3 sm:order-none w-full sm:w-auto justify-center sm:justify-start mt-1.5 sm:mt-0">
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage <= 1} className="h-10 rounded-lg text-xs font-bold gap-1 px-3">
              <ChevronLeft className="size-4" /> Önceki
            </Button>
            <input
              type="number" min={1} max={numPages || p.sayfa}
              value={currentPage}
              onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1 && v <= (numPages || p.sayfa)) goToPage(v, v > currentPage ? 1 : -1) }}
              className="h-10 w-16 rounded-lg border-2 border-border bg-card text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
            />
            <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage >= (numPages || p.sayfa)} className="h-10 rounded-lg text-xs font-bold gap-1 px-3">
              Sonraki <ChevronRight className="size-4" />
            </Button>
          </div>

          <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">{p.subtitle}</span>
        </div>
      </div>
    </div>
  )
}
