import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchBlankQuestions } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { BlankQuestion } from "@/types"

type FeedbackState = "idle" | "correct" | "wrong"

interface FillBlankProps {
  question: BlankQuestion
  feedback: FeedbackState
  selectedOption: number | null
  onSelect: (index: number) => void
}

function FillBlankQuestion({ question, feedback, selectedOption, onSelect }: FillBlankProps) {
  return (
    <>
      <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
        {question.surah}
      </p>

      <Card className="rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/10">
        <CardContent className="flex flex-wrap items-center justify-center gap-2 p-8">
          {question.parts.map((part, i) => (
            <span key={i}>
              {part === "____" ? (
                <motion.span
                  className={`inline-block rounded-xl border-2 border-dashed px-4 py-2 text-lg font-bold ${
                    feedback === "correct" && selectedOption !== null
                      ? "border-primary bg-primary/10 text-primary"
                      : feedback === "wrong" && selectedOption !== null
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-muted-foreground/40 text-muted-foreground"
                  }`}
                  animate={
                    feedback === "wrong"
                      ? { x: [0, -4, 4, -4, 0] }
                      : feedback === "correct"
                        ? { scale: [1, 1.1, 1] }
                        : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {selectedOption !== null ? question.options[selectedOption] : "?"}
                </motion.span>
              ) : (
                <span className="text-xl font-bold text-foreground">{part}</span>
              )}
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index
          const isCorrectOption = index === question.correctIndex
          const showCorrect = feedback !== "idle" && isCorrectOption
          const showWrong = feedback === "wrong" && isSelected

          return (
            <motion.div
              key={`${question.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                onClick={() => onSelect(index)}
                disabled={feedback !== "idle"}
                className={`h-14 w-full rounded-2xl border-2 text-base font-bold ${
                  showCorrect
                    ? "border-primary bg-primary/10 text-primary"
                    : showWrong
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border"
                }`}
              >
                {option}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

export function SurelerScreen() {
  const { addXp } = useProgress()
  const [questions, setQuestions] = useState<BlankQuestion[]>([])
  const [loading, setLoading] = useState(true)

  const [currentQ, setCurrentQ] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>("idle")
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    let alive = true
    fetchBlankQuestions()
      .then((rows) => alive && setQuestions(rows))
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

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Sure Tamamla</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Henüz soru eklenmedi.
        </p>
      </div>
    )
  }

  const question = questions[currentQ]

  const handleSelect = (index: number) => {
    if (feedback !== "idle") return
    setSelectedOption(index)

    if (index === question.correctIndex) {
      setFeedback("correct")
      setScore(score + 1)
      addXp(question.xpReward ?? 10).catch(() => {})
    } else {
      setFeedback("wrong")
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1)
        setFeedback("idle")
        setSelectedOption(null)
      }
    }, 1200)
  }

  const handleReset = () => {
    setCurrentQ(0)
    setFeedback("idle")
    setSelectedOption(null)
    setScore(0)
  }

  const isFinished = currentQ === questions.length - 1 && feedback !== "idle"

  return (
    <div className="min-h-svh">
      <div className="mx-auto max-w-md px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Sure Tamamla</h1>
        <p className="text-sm text-muted-foreground">Boşluğu doğru kelimeyle doldur</p>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < currentQ
                    ? "bg-primary"
                    : i === currentQ
                      ? "bg-warning"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="size-4 text-warning" />
            <span className="text-sm font-bold text-foreground">{score}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-8">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <FillBlankQuestion
            question={question}
            feedback={feedback}
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        </motion.div>

        {isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="rounded-2xl border-2 border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <Sparkles className="size-8 text-warning" />
                <p className="text-lg font-bold text-foreground">
                  Tebrikler! {score}/{questions.length} doğru!
                </p>
                <Button
                  onClick={handleReset}
                  className="h-12 rounded-2xl px-8 text-base font-bold"
                >
                  <RotateCcw data-icon="inline-start" />
                  Tekrar Oyna
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
