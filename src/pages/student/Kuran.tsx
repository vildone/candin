import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchKuranLetters } from "@/lib/pbContent"
import type { KuranLetter } from "@/types"

interface FlashcardProps {
  letter: KuranLetter
  onPlayAudio?: (src: string) => void
}

function Flashcard({ letter, onPlayAudio }: FlashcardProps) {
  return (
    <Card className="rounded-3xl border-2 border-primary/20 shadow-xl shadow-primary/10">
      <CardContent className="flex flex-col items-center gap-6 p-8">
        <motion.span
          className="text-8xl font-bold text-foreground"
          style={{ fontFamily: "serif" }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {letter.letter}
        </motion.span>

        <div className="rounded-2xl bg-primary/10 px-6 py-2">
          <span className="text-lg font-bold text-primary">{letter.name}</span>
        </div>

        <p className="text-center text-base font-medium text-muted-foreground">
          {letter.visualHook}
        </p>

        <Button
          variant="outline"
          className="h-14 w-full rounded-2xl border-2 border-primary/30 text-base font-bold text-primary"
          onClick={() => onPlayAudio?.(letter.audioSrc)}
          disabled={!letter.audioSrc}
        >
          <Volume2 data-icon="inline-start" className="size-6" />
          Ses Dinle
        </Button>
      </CardContent>
    </Card>
  )
}

export function KuranScreen() {
  const [letters, setLetters] = useState<KuranLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let alive = true
    fetchKuranLetters()
      .then((rows) => {
        if (alive) setLetters(rows)
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (letters.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Elif-Ba Öğreniyorum</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Henüz içerik eklenmedi. Yönetici panelinden harfler ekleyebilirsiniz.
        </p>
      </div>
    )
  }

  const letter = letters[currentIndex]

  const handleNext = () => {
    if (currentIndex < letters.length - 1) setCurrentIndex(currentIndex + 1)
  }
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }
  const handlePlayAudio = (src: string) => {
    if (!src) return
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.src = src
    audioRef.current.play().catch(() => {})
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Elif-Ba Öğreniyorum</h1>
        <p className="text-sm text-muted-foreground">
          Harf {currentIndex + 1} / {letters.length}
        </p>
      </div>

      <div className="mx-auto mt-4 flex max-w-md gap-1.5 px-4">
        {letters.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${
              i <= currentIndex ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="mx-auto w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Flashcard letter={letter} onPlayAudio={handlePlayAudio} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-24">
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
          <Button
            onClick={handleNext}
            disabled={currentIndex === letters.length - 1}
            className="h-14 flex-1 rounded-2xl text-base font-bold"
          >
            Sonraki
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
