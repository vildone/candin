import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CircleCheck as CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchNamazFlow } from "@/lib/pbContent"
import type { NamazFlow, NamazStep } from "@/types"

interface StepperProps {
  steps: NamazStep[]
}

function VerticalStepper({ steps }: StepperProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [expandedStep, setExpandedStep] = useState<number | null>(
    steps.length > 0 ? steps[0].id : null,
  )

  const toggleComplete = (id: number) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }
  const toggleExpand = (id: number) => {
    setExpandedStep(expandedStep === id ? null : id)
  }

  return (
    <>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${(completedSteps.length / Math.max(steps.length, 1)) * 100}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {completedSteps.length}/{steps.length}
        </span>
      </div>

      <div className="relative mt-6">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isExpanded = expandedStep === step.id

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-14"
              >
                <button
                  onClick={() => toggleComplete(step.id)}
                  className="absolute left-3 top-4 z-10"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle2 className="size-7 text-primary" fill="currentColor" />
                    </motion.div>
                  ) : (
                    <Circle className="size-7 text-border" />
                  )}
                </button>

                <Card
                  className={`rounded-2xl border-2 transition-all ${
                    isCompleted ? "border-primary/30 bg-primary/5" : "border-border"
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

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-sm leading-relaxed text-foreground">
                            {step.detail}
                          </p>
                        </div>
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => toggleComplete(step.id)}
                          className="mt-3 h-10 w-full rounded-xl text-sm font-bold"
                        >
                          {isCompleted ? "Tamamlanmadı Olarak İşaretle" : "Tamamlandı Olarak İşaretle"}
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  )
}

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
        <h1 className="text-xl font-bold text-foreground">Namaz Simülatörü</h1>
        <p className="text-sm text-muted-foreground">
          Adım adım namaz kılmayı öğrenelim
        </p>
      </div>

      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        {loading ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">Yükleniyor…</p>
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
