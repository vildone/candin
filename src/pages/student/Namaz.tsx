import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CircleCheck as CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchNamazFlow } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { NamazFlow, NamazStep, NamazReading } from "@/types"

// ─── Reading card ───

function ReadingCard({ reading }: { reading: NamazReading }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <p
        className="text-center text-2xl leading-loose text-foreground"
        dir="rtl"
        lang="ar"
        style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
      >
        {reading.arabic}
      </p>
      <p className="mt-2 text-center text-sm italic text-muted-foreground">
        {reading.transliteration}
      </p>
      <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
        <p className="text-sm text-foreground">{reading.turkish}</p>
      </div>
      {reading.note && (
        <p className="mt-2 text-center text-xs font-semibold text-primary">
          💡 {reading.note}
        </p>
      )}
    </div>
  )
}

// ─── Vertical Stepper ───

interface StepperProps {
  steps: NamazStep[]
}

function VerticalStepper({ steps }: StepperProps) {
  const { isLearned, markLearned, unmarkLearned } = useProgress()
  const [expandedStep, setExpandedStep] = useState<number | null>(
    steps.length > 9 ? steps[9].id : steps.length > 0 ? steps[0].id : null,
  )

  const completedCount = steps.filter((s) =>
    isLearned("namaz_step", String(s.id)),
  ).length

  const toggleExpand = (id: number) => {
    setExpandedStep(expandedStep === id ? null : id)
  }

  const toggleComplete = (step: NamazStep) => {
    const key = String(step.id)
    if (isLearned("namaz_step", key)) {
      unmarkLearned("namaz_step", key)
    } else {
      markLearned("namaz_step", key)
    }
  }

  return (
    <>
      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{
              width: `${(completedCount / Math.max(steps.length, 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Step list */}
      <div className="relative mt-6">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />

        <div className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const isCompleted = isLearned("namaz_step", String(step.id))
            const isExpanded = expandedStep === step.id

            const sectionHeader =
              step.id === 1
                ? "💧 Abdest Almayı Öğreniyoruz"
                : step.id === 10
                  ? "🕌 Namaz Kılmayı Öğreniyoruz"
                  : null

            return (
              <div key={step.id}>
                {/* Bölüm başlığı */}
                {sectionHeader && (
                  <div className="mb-3 mt-2 flex items-center gap-2 pl-14">
                    <div className="h-px flex-1 bg-primary/20" />
                    <span className="text-xs font-bold text-primary">
                      {sectionHeader}
                    </span>
                    <div className="h-px flex-1 bg-primary/20" />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative pl-14"
                >
                  {/* Completion circle */}
                  <button
                    onClick={() => toggleComplete(step)}
                    className="absolute left-3 top-4 z-10"
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <CheckCircle2
                          className="size-7 text-primary"
                          fill="currentColor"
                        />
                      </motion.div>
                    ) : (
                      <Circle className="size-7 text-border" />
                    )}
                  </button>

                  {/* Step card */}
                  <Card
                    className={`rounded-2xl border-2 transition-all ${
                      isCompleted
                        ? "border-primary/30 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <CardContent className="p-4">
                      <button
                        onClick={() => toggleExpand(step.id)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{step.emoji}</span>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {step.id}. {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      {/* Expanded content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="expanded"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-4">
                              {step.detail && (
                                <div className="rounded-xl bg-muted/50 p-3">
                                  <p className="text-sm leading-relaxed text-foreground">
                                    {step.detail}
                                  </p>
                                </div>
                              )}

                              {step.readings && step.readings.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="size-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">
                                      Namazda Okunanlar
                                    </p>
                                  </div>
                                  <div className="space-y-3">
                                    {step.readings.map((reading, ri) => (
                                      <ReadingCard
                                        key={ri}
                                        reading={reading}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Button
                                variant={isCompleted ? "outline" : "default"}
                                onClick={() => toggleComplete(step)}
                                className="h-10 w-full rounded-xl text-sm font-bold"
                              >
                                {isCompleted
                                  ? "Tamamlanmadı Olarak İşaretle"
                                  : "Tamamlandı Olarak İşaretle"}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── Screen ───

export function NamazScreen() {
  const [flow, setFlow] = useState<NamazFlow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchNamazFlow()
      .then((f) => alive && setFlow(f))
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="min-h-svh">
      <div className="mx-auto max-w-md px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Namaz Rehberi</h1>
        <p className="text-sm text-muted-foreground">
          Adım adım abdest almayı ve namaz kılmayı öğrenelim
        </p>
      </div>

      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        {loading ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Yükleniyor…
          </p>
        ) : flow && flow.steps.length > 0 ? (
          <VerticalStepper steps={flow.steps} />
        ) : (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Henüz namaz adımları eklenmedi.
          </p>
        )}
      </div>
    </div>
  )
}
