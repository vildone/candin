import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, Lock, CircleCheck as CheckCircle, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useProgress } from "@/hooks/useProgress"
import { useAuth } from "@/lib/auth"
import { fetchUnits } from "@/lib/pbContent"
import type { Unit, LessonStatus } from "@/types"

// Gerçek içerik henüz JSON'a yazılmadı — fetcher boş dönerse iskeletin görünmesi için minimum seed.
const SEED_UNITS: Unit[] = [
  { id: "unit-1", title: "İmanın Şartları", lessonIds: [] },
  { id: "unit-2", title: "Melekler", lessonIds: [] },
  { id: "unit-3", title: "İslam'ın Şartları", lessonIds: [] },
  { id: "unit-4", title: "Kitaplar", lessonIds: [] },
  { id: "unit-5", title: "Peygamberler", lessonIds: [] },
  { id: "unit-6", title: "Ahiret", lessonIds: [] },
  { id: "unit-7", title: "Kader", lessonIds: [] },
]

function deriveStatus(
  unit: Unit,
  unlockedUnits: string[],
  completedLessons: string[],
): LessonStatus {
  const isUnlocked = unlockedUnits.includes(unit.id)
  if (!isUnlocked) return "locked"
  const allDone =
    unit.lessonIds.length > 0 &&
    unit.lessonIds.every((id) => completedLessons.includes(id))
  return allDone ? "completed" : "active"
}

export function StudentDashboard() {
  const { user } = useAuth()
  const { xp, unlockedUnits, completedLessons, registerActivity } = useProgress()
  const [units, setUnits] = useState<Unit[]>(SEED_UNITS)

  useEffect(() => {
    let alive = true
    fetchUnits()
      .then((rows) => {
        if (alive && rows.length > 0) setUnits(rows)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    registerActivity().catch(() => {})
  }, [registerActivity])

  const displayName = user?.name ?? "Kullanıcı"
  const initial = displayName.slice(0, 1).toUpperCase() || "K"
  const level = Math.floor(xp / 250) + 1
  const xpInLevel = xp % 250
  const levelProgress = (xpInLevel / 250) * 100

  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">Seviye {level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="size-5 text-warning" fill="currentColor" />
            <span className="text-sm font-bold text-foreground">{xp} Puan</span>
          </div>
        </div>
        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Seviye {level}</span>
            <Progress value={levelProgress} className="h-3 flex-1 rounded-full" />
            <span className="text-xs font-medium text-muted-foreground">Seviye {level + 1}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-8">
        <h2 className="mb-8 text-center text-xl font-bold text-foreground">Öğrenme Yolu</h2>

        <div className="relative flex flex-col items-center gap-6">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-border" />

          {units.map((unit, index) => {
            const status = deriveStatus(unit, unlockedUnits, completedLessons)
            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                className={`relative z-10 ${index % 2 === 0 ? "self-start ml-8" : "self-end mr-8"}`}
              >
                <UnitNode unit={unit} status={status} index={index} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function UnitNode({ unit, status, index }: { unit: Unit; status: LessonStatus; index: number }) {
  const isCompleted = status === "completed"
  const isActive = status === "active"
  const isLocked = status === "locked"

  return (
    <Link
      to={isLocked ? "#" : `/ders/${unit.id}`}
      className={`
        flex items-center gap-3 rounded-2xl border-2 px-5 py-4 shadow-md transition-all
        ${isCompleted ? "border-primary bg-primary/10 shadow-primary/20" : ""}
        ${isActive ? "border-warning bg-warning/10 shadow-warning/20 scale-105" : ""}
        ${isLocked ? "border-border bg-muted opacity-60 pointer-events-none" : ""}
      `}
    >
      <div
        className={`
          flex size-12 items-center justify-center rounded-full
          ${isCompleted ? "bg-primary text-primary-foreground" : ""}
          ${isActive ? "bg-warning text-warning-foreground" : ""}
          ${isLocked ? "bg-muted-foreground/20 text-muted-foreground" : ""}
        `}
      >
        {isCompleted && <CheckCircle className="size-6" />}
        {isActive && <BookOpen className="size-6" />}
        {isLocked && <Lock className="size-6" />}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Ünite {index + 1}</p>
        <p className={`text-sm font-bold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
          {unit.title}
        </p>
      </div>
    </Link>
  )
}
