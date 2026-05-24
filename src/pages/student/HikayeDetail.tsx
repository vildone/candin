import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, CheckCircle2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchHikayeler } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { Hikaye } from "@/types"

export function HikayeDetailScreen() {
  const { hikayeId } = useParams<{ hikayeId: string }>()
  const [hikayeler, setHikayeler] = useState<Hikaye[]>([])
  const [loading, setLoading] = useState(true)
  const { isLearned, markLearned, unmarkLearned } = useProgress()

  useEffect(() => {
    let alive = true
    fetchHikayeler()
      .then((rows) => alive && setHikayeler(rows))
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const hikaye = hikayeler.find((h) => h.id === hikayeId)
  const learned = hikaye ? isLearned("hikaye", hikaye.id) : false

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (!hikaye) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Hikaye bulunamadı</h1>
        <Link to="/hikayeler">
          <Button variant="outline" className="mt-4 rounded-2xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri dön
          </Button>
        </Link>
      </div>
    )
  }

  const paragraphs = hikaye.content.split("\n\n").filter((p) => p.trim())

  const handleToggleLearned = () => {
    if (learned) {
      unmarkLearned("hikaye", hikaye.id)
    } else {
      markLearned("hikaye", hikaye.id)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-24">
      {/* Geri butonu */}
      <Link to="/hikayeler">
        <Button variant="ghost" size="sm" className="mb-3 -ml-2 rounded-xl text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Hikayeler
        </Button>
      </Link>

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="mb-6"
      >
        <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent shadow-lg shadow-primary/5">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <motion.span
              className="text-5xl"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            >
              {hikaye.emoji}
            </motion.span>
            <h1 className="text-lg font-bold text-foreground text-center">
              {hikaye.title}
            </h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Tahmini okuma süresi: {hikaye.estimatedMinutes} dakika</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* İçerik */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 30 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4">
          {paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="text-sm leading-7 text-foreground"
            >
              {para}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Ana Fikirler */}
      {hikaye.keyPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="mb-6"
        >
          <Card className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">
                  Öğrenilecek Dersler
                </h2>
              </div>
              <ul className="flex flex-col gap-2">
                {hikaye.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span className="text-sm leading-relaxed text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Öğrenildi butonu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
      >
        <Button
          onClick={handleToggleLearned}
          className={`h-12 w-full rounded-2xl text-sm font-bold ${
            learned
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : ""
          }`}
          variant={learned ? "outline" : "default"}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {learned ? "Öğrenildi ✓" : "Öğrenildi olarak işaretle"}
        </Button>
      </motion.div>
    </div>
  )
}
