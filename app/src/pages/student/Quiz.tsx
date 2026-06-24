import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, CircleCheck as CheckCircle, Circle as XCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fetchDiniUnits } from "@/lib/pbContent"
import { useProgress } from "@/hooks/useProgress"
import type { DiniUnit } from "@/types"

interface PreparedQuestion {
  question: string
  options: string[]
  correctIndex: number
}

type AnswerState = "idle" | "correct" | "wrong"

export function QuizScreen() {
  const { unitId } = useParams<{ unitId: string }>()
  const { completeLesson, unlockUnit } = useProgress()

  const [units, setUnits] = useState<DiniUnit[]>([])
  const [unit, setUnit] = useState<DiniUnit | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>("idle")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)

  useEffect(() => {
    let alive = true
    fetchDiniUnits()
      .then((all) => {
        if (!alive) return
        setUnits(all)
        const match = all.find((u) => u.id === unitId) ?? all[0] ?? null
        setUnit(match)
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [unitId])

  const questions: PreparedQuestion[] = unit
    ? unit.quiz.map((q) => ({
        question: q.question,
        options: q.options,
        correctIndex: Math.max(0, q.options.indexOf(q.correctAnswer)),
      }))
    : []

  const xpReward = unit?.quiz.reduce((sum, q) => sum + q.xpReward, 0) ?? 30

  useEffect(() => {
    if (!finished || !unit) return
    const passed = score === questions.length && questions.length > 0
    if (!passed) return
    const idx = units.findIndex((u) => u.id === unit.id)
    const next = idx >= 0 ? units[idx + 1] : undefined
    completeLesson(unit.id, xpReward)
    if (next) {
      unlockUnit(next.id)
      if (next.level > unit.level) setLevelCompleted(true)
    } else {
      setLevelCompleted(true)
    }
  }, [finished, unit, score, questions.length, units, xpReward, completeLesson, unlockUnit])

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    )
  }

  if (!unit || questions.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Sınav bulunamadı</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Bu ünite için henüz sınav yok.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="outline" className="rounded-2xl">
            <ArrowLeft data-icon="inline-start" />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  const handleSelect = (index: number) => {
    if (answerState !== "idle") return
    setSelectedIndex(index)

    if (index === question.correctIndex) {
      setAnswerState("correct")
      setScore((s) => s + 1)
    } else {
      setAnswerState("wrong")
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setAnswerState("idle")
        setSelectedIndex(null)
      } else {
        setFinished(true)
      }
    }, 1500)
  }

  if (finished) {
    return (
      <QuizResult
        score={score}
        total={questions.length}
        xpReward={xpReward}
        levelCompleted={levelCompleted}
        currentLevel={unit?.level ?? 1}
        unitId={unitId ?? ""}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Progress value={progress} className="h-3 rounded-full" />
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/10">
            <CardContent className="p-6">
              <p className="text-center text-lg font-bold leading-relaxed text-foreground">
                {question.question}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-8 flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index
            const isCorrect = index === question.correctIndex
            const showCorrect = answerState !== "idle" && isCorrect
            const showWrong = answerState === "wrong" && isSelected

            return (
              <motion.div
                key={index}
                animate={
                  showCorrect
                    ? { scale: [1, 1.05, 1] }
                    : showWrong
                      ? { x: [0, -8, 8, -8, 8, 0] }
                      : {}
                }
                transition={{ duration: 0.4 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleSelect(index)}
                  disabled={answerState !== "idle"}
                  className={`
                    h-16 w-full justify-start rounded-2xl border-2 px-5 text-left text-base font-semibold
                    ${showCorrect ? "border-primary bg-primary/10 text-primary" : ""}
                    ${showWrong ? "border-destructive bg-destructive/10 text-destructive" : ""}
                    ${!showCorrect && !showWrong ? "border-border" : ""}
                  `}
                >
                  <span className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle className="size-5 text-primary" />}
                  {showWrong && <XCircle className="size-5 text-destructive" />}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {answerState !== "idle" && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            fixed inset-x-0 bottom-0 p-4
            ${answerState === "correct" ? "bg-primary" : "bg-destructive"}
          `}
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="mx-auto flex max-w-md items-center gap-3">
            {answerState === "correct" ? (
              <>
                <CheckCircle className="size-6 text-primary-foreground" />
                <span className="text-lg font-bold text-primary-foreground">
                  Doğru! Harika!
                </span>
              </>
            ) : (
              <>
                <XCircle className="size-6 text-destructive-foreground" />
                <span className="text-lg font-bold text-destructive-foreground">
                  Yanlış! Tekrar dene.
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function QuizResult({
  score,
  total,
  xpReward,
  levelCompleted,
  currentLevel,
  unitId,
}: {
  score: number
  total: number
  xpReward: number
  levelCompleted: boolean
  currentLevel: number
  unitId: string
}) {
  const percentage = Math.round((score / total) * 100)
  const passed = score === total

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="mb-6 flex size-24 items-center justify-center rounded-full bg-warning/20"
      >
        <Trophy className="size-12 text-warning" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-foreground"
      >
        Sınav Tamamlandı!
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center"
      >
        <p className="text-4xl font-bold text-primary">%{percentage}</p>
        <p className="mt-2 text-muted-foreground">
          {total} sorudan {score} doğru
        </p>
      </motion.div>

      {passed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-warning/10 px-4 py-2"
        >
          <Star className="size-5 text-warning" />
          <span className="font-bold text-foreground">+{xpReward} Puan kazandın!</span>
        </motion.div>
      )}

      {passed && levelCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="mt-4 rounded-2xl border-2 border-primary bg-primary/10 px-6 py-3 text-center"
        >
          <p className="text-lg font-bold text-primary">
            🎉 Seviye {currentLevel} Tamamlandı!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentLevel < 9 ? `Seviye ${currentLevel + 1} açıldı!` : "Tüm seviyeleri tamamladın! Tebrikler!"}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: levelCompleted ? 1.4 : 1 }}
        className="mt-8 flex w-full max-w-xs flex-col gap-3"
      >
        {!passed && (
          <Link to={`/sinav/${unitId}`} className="w-full">
            <Button variant="outline" className="h-14 w-full rounded-2xl text-base font-bold">
              Tekrar Dene
            </Button>
          </Link>
        )}
        <Link to="/" className="w-full">
          <Button className="h-14 w-full rounded-2xl text-base font-bold">
            Ana Sayfaya Dön
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
