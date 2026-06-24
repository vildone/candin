import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Search, Clock, CheckCircle2, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchHikayeler } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { Hikaye } from "@/types"

export function HikayelerScreen() {
  const [hikayeler, setHikayeler] = useState<Hikaye[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { isLearned } = useProgress()

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

  const filtered = hikayeler.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.summary.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (hikayeler.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Hikayeler</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Henüz hikaye eklenmedi.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Hikayeler</h1>
        <p className="text-sm text-muted-foreground">
          Güzel hikayelerden ders çıkar
        </p>
      </div>

      {/* Arama */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hikaye ara…"
          className="h-11 w-full rounded-2xl border-2 border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {filtered.map((hikaye, i) => {
          const learned = isLearned("hikaye", hikaye.id)
          return (
            <motion.div
              key={hikaye.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 30 }}
            >
              <Link to={`/hikayeler/${hikaye.id}`}>
                <Card className="rounded-2xl border-2 border-border bg-card transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 text-3xl">{hikaye.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground leading-snug">
                          {hikaye.title}
                        </h3>
                        {learned && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {hikaye.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          <Clock className="h-3 w-3" />
                          {hikaye.estimatedMinutes} dk
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          Hikaye
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}

        {filtered.length === 0 && search && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              &ldquo;{search}&rdquo; ile eşleşen hikaye bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
