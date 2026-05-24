import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchElifbaDersler } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { ElifbaDers, ElifbaSes } from "@/types"

// ─── Harf Kartı (büyük harf + ses butonu) ───
function HarfCard({ ses, gorsel, onPlay, isPlaying }: {
  ses: ElifbaSes
  gorsel?: { url: string; alt: string }
  onPlay: () => void
  isPlaying: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onPlay}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all hover:border-primary/40 active:bg-primary/5 ${
        isPlaying ? "border-primary bg-primary/10" : "border-primary/20 bg-card"
      } p-2 sm:p-4`}
    >
      {gorsel ? (
        <img
          src={gorsel.url}
          alt={gorsel.alt}
          className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
          loading="lazy"
        />
      ) : (
        <span className="text-2xl sm:text-4xl font-bold text-foreground" style={{ fontFamily: "serif" }}>
          {ses.label}
        </span>
      )}
      <div className="flex items-center gap-1">
        {isPlaying ? (
          <VolumeX className="size-3.5 sm:size-4 text-primary" />
        ) : (
          <Volume2 className="size-3.5 sm:size-4 text-muted-foreground" />
        )}
      </div>
    </motion.button>
  )
}

// ─── Ders Detay Sayfası ───
function DersDetail({ ders, onBack, isLearned, onToggleLearned }: {
  ders: ElifbaDers
  onBack: () => void
  isLearned: boolean
  onToggleLearned: () => void
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSesId, setPlayingSesId] = useState<string | null>(null)

  const handlePlay = (ses: ElifbaSes) => {
    if (playingSesId === ses.id) {
      audioRef.current?.pause()
      setPlayingSesId(null)
      return
    }
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.src = ses.url
    audioRef.current.onended = () => setPlayingSesId(null)
    audioRef.current.play().catch(() => {})
    setPlayingSesId(ses.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="pb-8"
    >
      {/* Geri butonu */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Ders Listesi
      </button>

      {/* Başlık */}
      <h2 className="text-xl font-bold text-foreground mb-2">{ders.title}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {ders.sesler.length} ses · {ders.gorseller.length} harf görseli
      </p>

      {/* Harfler grid */}
      {ders.sesler.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Volume2 className="size-4 text-primary" />
            Harfler (Tıkla ve Dinle)
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {ders.sesler.map((ses, i) => {
              const gorsel = ders.gorseller[i]
              return (
                <HarfCard
                  key={ses.id}
                  ses={ses}
                  gorsel={gorsel ? { url: gorsel.url, alt: gorsel.alt } : undefined}
                  onPlay={() => handlePlay(ses)}
                  isPlaying={playingSesId === ses.id}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Açıklamalar */}
      {ders.descriptions.length > 0 && (
        <Card className="rounded-2xl border-2 border-border mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Info className="size-4 text-primary" />
              Açıklama
            </h3>
            <div className="space-y-3">
              {ders.descriptions.map((desc, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-sm leading-relaxed text-foreground"
                >
                  {desc}
                </motion.p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yöntem */}
      {ders.method && (
        <Card className="rounded-2xl border-2 border-warning/20 bg-warning/5 mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-warning-foreground mb-2 flex items-center gap-2">
              <BookOpen className="size-4" />
              Öğrenme Yöntemi
            </h3>
            <p className="text-sm leading-relaxed text-foreground">{ders.method}</p>
          </CardContent>
        </Card>
      )}

      {/* Öğrenildi butonu */}
      <Button
        variant={isLearned ? "outline" : "default"}
        onClick={onToggleLearned}
        className="mt-4 h-12 w-full rounded-2xl text-base font-bold"
      >
        {isLearned ? (
          <>
            <CheckCircle2 className="size-5 mr-2" />
            Bu Dersi Öğrendim
          </>
        ) : (
          <>
            <Circle className="size-5 mr-2" />
            Öğrenildi Olarak İşaretle
          </>
        )}
      </Button>
    </motion.div>
  )
}

// ─── Ana Kur'an Ekranı ───
export function KuranScreen() {
  const [dersler] = useState<ElifbaDers[]>(() => fetchElifbaDersler())
  const [selectedDers, setSelectedDers] = useState<ElifbaDers | null>(null)
  const { isLearned, markLearned, unmarkLearned, getLearnedCount } = useProgress()

  const learnedCount = getLearnedCount("kuran_letter")
  const totalDers = dersler.length

  // Ders detay sayfası
  if (selectedDers) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-24">
        <DersDetail
          ders={selectedDers}
          onBack={() => setSelectedDers(null)}
          isLearned={isLearned("kuran_letter", selectedDers.id)}
          onToggleLearned={() => {
            if (isLearned("kuran_letter", selectedDers.id)) {
              unmarkLearned("kuran_letter", selectedDers.id)
            } else {
              markLearned("kuran_letter", selectedDers.id)
            }
          }}
        />
      </div>
    )
  }

  // Ders listesi
  return (
    <div className="min-h-svh">
        <div className="mx-auto max-w-2xl px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Kur'an Elifbası</h1>
        <p className="text-sm text-muted-foreground">
          {learnedCount}/{totalDers} ders tamamlandı
        </p>

        {/* İlerleme çubuğu */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{
                width: `${(learnedCount / Math.max(totalDers, 1)) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {Math.round((learnedCount / Math.max(totalDers, 1)) * 100)}%
          </span>
        </div>
      </div>

      {/* Ders kartları */}
      <div className="mx-auto max-w-2xl px-4 py-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dersler.map((ders, i) => {
            const learned = isLearned("kuran_letter", ders.id)
            return (
              <motion.button
                key={ders.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedDers(ders)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 sm:px-4 sm:py-4 text-left transition-all active:scale-[0.98] ${
                  learned
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                {/* Ders numarası */}
                <div
                  className={`flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full text-base sm:text-lg font-bold ${
                    learned
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {learned ? (
                    <CheckCircle2 className="size-5 sm:size-6" />
                  ) : (
                    ders.ders_no
                  )}
                </div>

                {/* Ders bilgisi */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {ders.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {ders.sesler.length} ses · {ders.gorseller.length} görsel
                    {ders.descriptions.length > 0 && ` · ${ders.descriptions.length} açıklama`}
                  </p>
                </div>

                <ChevronRight className="size-4 sm:size-5 shrink-0 text-muted-foreground" />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
