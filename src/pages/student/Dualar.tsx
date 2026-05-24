import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Search, CheckCircle2, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchDualar } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { Dua } from "@/types"

const CATEGORIES = [
  { key: "all", label: "Tümü", emoji: "🤲" },
  { key: "sabah", label: "Sabah", emoji: "🌅" },
  { key: "akşam", label: "Akşam", emoji: "🌆" },
  { key: "yemek", label: "Yemek", emoji: "🍽️" },
  { key: "genel", label: "Genel", emoji: "📿" },
  { key: "namaz", label: "Namaz", emoji: "🕌" },
] as const

const CATEGORY_EMOJIS: Record<string, string> = {
  sabah: "🌅",
  akşam: "🌆",
  yemek: "🍽️",
  genel: "📿",
  namaz: "🕌",
}

const CATEGORY_COLORS: Record<string, string> = {
  sabah: "bg-amber-100 text-amber-700 border-amber-200",
  akşam: "bg-purple-100 text-purple-700 border-purple-200",
  yemek: "bg-green-100 text-green-700 border-green-200",
  genel: "bg-blue-100 text-blue-700 border-blue-200",
  namaz: "bg-teal-100 text-teal-700 border-teal-200",
}

export function DualarScreen() {
  const [dualar, setDualar] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const { isLearned } = useProgress()

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

  const filtered = dualar.filter((d) => {
    const matchesSearch =
      search.trim() === "" ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.turkish.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === "all" || d.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (dualar.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Dualar</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Henüz dua eklenmedi.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      {/* Header */}
      <div className="mx-auto max-w-md px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Dualar</h1>
        <p className="text-sm text-muted-foreground">
          Günlük duaları öğren ve ezberle
        </p>
      </div>

      {/* Search bar */}
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Dua ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl border-2 border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-2xl border-2 px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Prayer grid */}
      <div className="mx-auto max-w-md px-4 pt-4 pb-24">
        {filtered.length === 0 ? (
          <div className="pt-8 text-center text-sm text-muted-foreground">
            Aramanızla eşleşen dua bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((dua, index) => {
              const learned = isLearned("dua", dua.id)
              const emoji = CATEGORY_EMOJIS[dua.category] ?? "🤲"
              const catColor =
                CATEGORY_COLORS[dua.category] ??
                "bg-gray-100 text-gray-700 border-gray-200"

              return (
                <motion.div
                  key={dua.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <Link to={`/dualar/${dua.id}`}>
                    <Card className="rounded-2xl border-2 border-border bg-card transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/10">
                      <CardContent className="flex items-center gap-3 p-3.5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                          {emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-foreground">
                              {dua.title}
                            </h3>
                            {learned && (
                              <CheckCircle2 className="size-4 shrink-0 text-primary" />
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {dua.turkish}
                          </p>
                          <span
                            className={`mt-1.5 inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold ${catColor}`}
                          >
                            {dua.category}
                          </span>
                        </div>

                        <BookOpen className="size-5 shrink-0 text-muted-foreground/50" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
