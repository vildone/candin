import { useEffect, useState, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Minus, Plus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProgress } from "@/hooks/useProgress"
import { pdfjs, Document, Page } from "react-pdf"

// PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

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

export function PeygamberDetailScreen() {
  const { peygamberId } = useParams<{ peygamberId: string }>()
  const p = peygamberData[peygamberId as keyof typeof peygamberData]
  const { isLearned, markLearned, unmarkLearned } = useProgress()
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
    setLoading(true)
  }, [peygamberId])

  if (!p) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <p className="text-sm text-muted-foreground">Peygamber bulunamadı.</p>
        <Link to="/peygamberler" className="mt-4 inline-block text-sm font-medium text-primary">
          Geri Dön
        </Link>
      </div>
    )
  }

  const learned = isLearned("hikaye", p.id)

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }
  const handleNext = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1)
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 2.5))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6))

  return (
    <div className="relative min-h-svh bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2.5">
          <Link
            to="/peygamberler"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            Peygamberler
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xl">{p.emoji}</span>
            <p className="text-sm font-bold text-foreground">{p.title}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (learned) unmarkLearned("hikaye", p.id)
              else markLearned("hikaye", p.id)
            }}
            className="text-[10px] h-7 px-2"
          >
            {learned ? "✓ Okundu" : "Okundu"}
          </Button>
        </div>

        {/* Bölüm sekmeleri + kontroller */}
        <div className="mx-auto max-w-4xl overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 px-3">
            {/* Bölümler */}
            {p.bolumler.map((bolum, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(bolum.sayfa)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                  currentPage >= bolum.sayfa &&
                  (i === p.bolumler.length - 1 || currentPage < p.bolumler[i + 1].sayfa)
                    ? "bg-primary text-primary-foreground"
                    : currentPage >= bolum.sayfa
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {bolum.baslik}
              </button>
            ))}
            <div className="flex-1" />
            {/* Sayfa bilgisi */}
            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
              {currentPage}/{numPages || p.sayfa}
            </span>
          </div>
        </div>
      </div>

      {/* PDF Alanı */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-muted/20"
      >
        <div className="mx-auto flex max-w-3xl justify-center py-4 px-2">
          <Document
            file={p.pdf}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages)
              setLoading(false)
            }}
            onLoadError={() => setLoading(false)}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground">Yükleniyor...</p>
                </div>
              </div>
            }
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              key={currentPage}
              initial={{ opacity: 0.6, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg shadow-lg overflow-hidden bg-white"
              style={{ minHeight: 400 }}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="[&_canvas]:!max-w-full [&_canvas]:!h-auto"
              />
            </motion.div>
          </Document>
        </div>
      </div>

      {/* Alt kontrol barı */}
      <div className="sticky bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.6}
              className="h-8 w-8 p-0"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 2.5}
              className="h-8 w-8 p-0"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="h-8 rounded-lg text-xs font-bold gap-1"
            >
              <ChevronLeft className="size-3.5" />
              Önceki
            </Button>

            <input
              type="number"
              min={1}
              max={numPages || p.sayfa}
              value={currentPage}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (v >= 1 && v <= (numPages || p.sayfa)) setCurrentPage(v)
              }}
              className="h-8 w-14 rounded-lg border-2 border-border bg-card text-center text-xs font-bold text-foreground focus:border-primary focus:outline-none"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage >= (numPages || p.sayfa)}
              className="h-8 rounded-lg text-xs font-bold gap-1"
            >
              Sonraki
              <ChevronRight className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <BookOpen className="size-3" />
            {p.subtitle}
          </div>
        </div>
      </div>
    </div>
  )
}
