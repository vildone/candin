import { useEffect, useState, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchDualar } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { Dua, DuaWord } from "@/types"

export function DuaDetailScreen() {
  const { duaId } = useParams<{ duaId: string }>()
  const [dualar, setDualar] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { isLearned, markLearned, unmarkLearned } = useProgress()

  useEffect(() => {
    let alive = true
    fetchDualar()
      .then((rows) => alive && setDualar(rows))
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const dua = dualar.find((d) => d.id === duaId)
  const learned = dua ? isLearned("dua", dua.id) : false

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleAudio = () => {
    if (!dua?.audioSrc) return

    if (playing && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
      return
    }

    const audio = new Audio(dua.audioSrc)
    audioRef.current = audio
    audio.onended = () => setPlaying(false)
    audio.onerror = () => setPlaying(false)
    audio.play().catch(() => {})
    setPlaying(true)
  }

  const toggleLearned = () => {
    if (!dua) return
    if (learned) {
      unmarkLearned("dua", dua.id)
    } else {
      markLearned("dua", dua.id)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (!dua) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Dua bulunamadı</h1>
        <Link to="/dualar">
          <Button variant="outline" className="mt-4 rounded-2xl">
            <ArrowLeft data-icon="inline-start" />
            Dualara Dön
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      {/* Top bar */}
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="flex items-center gap-3">
          <Link to="/dualar">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-foreground">
              {dua.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-6 pb-24">
        {/* Arabic text card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent shadow-lg shadow-primary/10">
            <CardContent className="flex flex-col items-center gap-5 p-6">
              <p
                className="text-center text-3xl leading-loose text-foreground"
                dir="rtl"
                style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
              >
                {dua.arabic}
              </p>

              {/* Transliteration */}
              <p className="text-center text-sm italic leading-relaxed text-muted-foreground">
                {dua.transliteration}
              </p>

              {/* Divider */}
              <div className="h-px w-16 bg-primary/20" />

              {/* Turkish meaning */}
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground">
                  {dua.turkish}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audio & Learn buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
          className="mt-4 flex gap-3"
        >
          {dua.audioSrc && (
            <Button
              variant="outline"
              onClick={toggleAudio}
              className="h-12 flex-1 rounded-2xl border-2 text-sm font-bold"
            >
              {playing ? (
                <>
                  <VolumeX className="size-4" />
                  Durdur
                </>
              ) : (
                <>
                  <Volume2 className="size-4" />
                  Dinle
                </>
              )}
            </Button>
          )}
          <Button
            onClick={toggleLearned}
            className={`h-12 flex-1 rounded-2xl text-sm font-bold ${
              learned
                ? "bg-primary text-primary-foreground"
                : "border-2 border-primary bg-transparent text-primary hover:bg-primary/10"
            }`}
            variant={learned ? "default" : "outline"}
          >
            {learned ? (
              <>
                <CheckCircle2 className="size-4" />
                Öğrenildi
              </>
            ) : (
              <>
                <Circle className="size-4" />
                Öğrenildi olarak işaretle
              </>
            )}
          </Button>
        </motion.div>

        {/* Word-by-word section */}
        {dua.words && dua.words.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className="mt-8"
          >
            <h2 className="mb-3 text-base font-bold text-foreground">
              Kelime Kelime
            </h2>
            <div className="flex flex-wrap gap-2">
              {dua.words.map((word: DuaWord, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <Card className="rounded-2xl border-2 border-border bg-card">
                    <CardContent className="flex flex-col items-center gap-1 p-3">
                      <span
                        className="text-lg font-semibold text-foreground"
                        dir="rtl"
                        style={{
                          fontFamily:
                            "'Amiri', 'Traditional Arabic', serif",
                        }}
                      >
                        {word.arabic}
                      </span>
                      {word.transliteration && (
                        <span className="text-[10px] italic text-muted-foreground">
                          {word.transliteration}
                        </span>
                      )}
                      <span className="text-xs font-medium text-primary">
                        {word.turkish}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Explanation section */}
        {dua.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="mt-8"
          >
            <h2 className="mb-3 text-base font-bold text-foreground">
              Açıklama
            </h2>
            <Card className="rounded-2xl border-2 border-border bg-card">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {dua.explanation}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
