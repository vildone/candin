import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchProphetStories } from "@/lib/pbContent"
import type { ProphetStory } from "@/types"

export function PeygamberlerScreen() {
  const [stories, setStories] = useState<ProphetStory[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeStory, setActiveStory] = useState(0)
  const [activeParagraph, setActiveParagraph] = useState(0)

  useEffect(() => {
    let alive = true
    fetchProphetStories()
      .then((rows) => alive && setStories(rows))
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

  if (stories.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Peygamber Hikayeleri</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Henüz hikaye eklenmedi.
        </p>
      </div>
    )
  }

  const story = stories[activeStory]
  const paragraph = story.paragraphs[activeParagraph]

  const handleNextParagraph = () => {
    if (activeParagraph < story.paragraphs.length - 1) {
      setActiveParagraph(activeParagraph + 1)
    }
  }
  const handlePrevParagraph = () => {
    if (activeParagraph > 0) setActiveParagraph(activeParagraph - 1)
  }
  const handleStorySelect = (index: number) => {
    setActiveStory(index)
    setActiveParagraph(0)
  }

  return (
    <div className="min-h-svh">
      <div className="mx-auto max-w-md px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Peygamber Hikayeleri</h1>
        <p className="text-sm text-muted-foreground">Peygamberlerin hayatlarından hikayeler</p>
      </div>

      <div className="mx-auto max-w-md px-4 pt-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {stories.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleStorySelect(i)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 px-4 py-3 transition-all ${
                i === activeStory
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                  : "border-border bg-card"
              }`}
              style={{ scrollSnapAlign: "start" }}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span
                className={`text-sm font-bold ${
                  i === activeStory ? "text-primary" : "text-foreground"
                }`}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6">
        <motion.div
          key={`${activeStory}-${activeParagraph}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/10">
            <CardContent className="flex flex-col items-center gap-6 p-8">
              <motion.span
                className="text-6xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                {story.emoji}
              </motion.span>

              <h2 className="text-lg font-bold text-foreground">{story.title}</h2>

              <div className="flex w-full gap-1.5">
                {story.paragraphs.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i <= activeParagraph ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <p className="min-h-[80px] text-center text-base leading-relaxed text-foreground">
                {paragraph}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-6 flex gap-3">
          {activeParagraph > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevParagraph}
              className="h-14 flex-1 rounded-2xl text-base font-bold"
            >
              <ChevronLeft data-icon="inline-start" />
              Geri
            </Button>
          )}
          {activeParagraph < story.paragraphs.length - 1 ? (
            <Button
              onClick={handleNextParagraph}
              className="h-14 flex-1 rounded-2xl text-base font-bold"
            >
              Devam Et
              <ChevronRight data-icon="inline-end" />
            </Button>
          ) : (
            <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-primary/10 p-4">
              <span className="text-sm font-bold text-primary">Hikaye Tamamlandı!</span>
              {activeStory < stories.length - 1 && (
                <Button
                  onClick={() => handleStorySelect(activeStory + 1)}
                  className="h-10 rounded-xl text-sm font-bold"
                >
                  Sonraki Hikaye
                  <ChevronRight data-icon="inline-end" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
