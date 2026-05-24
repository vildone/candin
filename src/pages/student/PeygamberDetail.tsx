import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronUp, BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProgress } from "@/hooks/useProgress"

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
      { sayfa: 4, baslik: "Doğumu ve Çocukluğu" },
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

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < p.sayfa) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="min-h-svh">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            to="/peygamberler"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Peygamberler
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <p className="text-sm font-bold text-foreground">{p.title}</p>
              <p className="text-[10px] text-muted-foreground">
                Sayfa {currentPage} / {p.sayfa}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (learned) {
                unmarkLearned("hikaye", p.id)
              } else {
                markLearned("hikaye", p.id)
              }
            }}
            className="text-xs"
          >
            {learned ? "✓ Okundu" : "Okundu İşaretle"}
          </Button>
        </div>

        {/* Bölüm sekmeleri */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-0 pb-0 scrollbar-none">
          <div className="flex gap-1 px-4">
            {p.bolumler.map((bolum, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(bolum.sayfa)}
                className={`shrink-0 rounded-t-lg px-3 py-2 text-xs font-medium transition-all ${
                  currentPage >= bolum.sayfa
                    ? "bg-primary/10 text-primary border-t-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {bolum.baslik}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Görüntüleyici */}
      <div className="mx-auto max-w-6xl px-2 py-2 pb-20">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="rounded-lg border border-border bg-background shadow-lg overflow-hidden"
        >
          <iframe
            src={`${p.pdf}#page=${currentPage}&view=FitH`}
            className="w-full border-0"
            style={{ height: "calc(100vh - 160px)", minHeight: "600px" }}
            title={p.title}
          />
        </motion.div>

        {/* Sayfa kontrolleri */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="h-10 rounded-xl text-sm font-bold"
          >
            <ChevronLeft className="size-4 mr-1" />
            Önceki
          </Button>

          <span className="text-xs font-medium text-muted-foreground">
            {currentPage} / {p.sayfa}
          </span>

          <input
            type="number"
            min={1}
            max={p.sayfa}
            value={currentPage}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              if (v >= 1 && v <= p.sayfa) setCurrentPage(v)
            }}
            className="h-10 w-16 rounded-xl border-2 border-border bg-card text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
          />

          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage >= p.sayfa}
            className="h-10 rounded-xl text-sm font-bold"
          >
            Sonraki
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {/* Alt bilgi */}
        <div className="mt-4 mb-6 rounded-xl bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            <BookOpen className="size-3 inline mr-1" />
            {p.aciklama}
          </p>
          <a
            href={p.pdf}
            download
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Download className="size-3" />
            PDF'i İndir
          </a>
        </div>
      </div>
    </div>
  )
}
