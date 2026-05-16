import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchDiniUnits } from "@/lib/pbContent"
import type { DiniUnit } from "@/types"

export function LessonScreen() {
  const { unitId } = useParams<{ unitId: string }>()
  const [unit, setUnit] = useState<DiniUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let alive = true
    fetchDiniUnits()
      .then((units) => {
        if (!alive) return
        const match = units.find((u) => u.id === unitId) ?? units[0] ?? null
        setUnit(match)
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [unitId])

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (!unit || unit.cards.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Ders bulunamadı</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Bu ünite için henüz içerik yok.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="outline" className="rounded-2xl">
            <ArrowLeft data-icon="inline-start" />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    )
  }

  const totalCards = unit.cards.length
  const progress = ((currentIndex + 1) / totalCards) * 100
  const isLast = currentIndex === totalCards - 1

  const handleNext = () => {
    if (currentIndex < totalCards - 1) setCurrentIndex(currentIndex + 1)
  }
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Progress value={progress} className="h-3 rounded-full" />
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            {currentIndex + 1}/{totalCards}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-warning" />
          <h1 className="text-lg font-bold text-foreground">{unit.title}</h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
                  <p className="text-lg font-medium leading-relaxed text-foreground">
                    {unit.cards[currentIndex]}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-8">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="h-14 flex-1 rounded-2xl text-base font-bold"
          >
            <ChevronLeft data-icon="inline-start" />
            Önceki
          </Button>
          {isLast ? (
            <Link to={`/sinav/${unit.id}`} className="flex-1">
              <Button className="h-14 w-full rounded-2xl text-base font-bold">
                Sınava Başla
                <ChevronRight data-icon="inline-end" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleNext}
              className="h-14 flex-1 rounded-2xl text-base font-bold"
            >
              Sonraki
              <ChevronRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
