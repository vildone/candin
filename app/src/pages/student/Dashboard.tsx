import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Lock, CircleCheck as CheckCircle, BookOpen, ChevronDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useProgress } from "@/hooks/useProgress"
import { fetchDiniUnits } from "@/lib/pbContent"
import type { DiniUnit } from "@/types"

const LEVEL_NAMES: Record<number, string> = {
  1: "Tanışma & Sevgi",
  2: "Şehadet & Tevhid",
  3: "Namaz & Temizlik",
  4: "Oruç & Zekât",
  5: "Peygamberimiz",
  6: "Kur'an & Kutsal Mekânlar",
  7: "İman Esasları",
  8: "Dua & Sureler",
  9: "Güzel Ahlak",
}

const LEVEL_EMOJIS: Record<number, string> = {
  1: "🌟", 2: "☝️", 3: "🕌", 4: "🌙", 5: "🌹",
  6: "📖", 7: "❤️", 8: "🤲", 9: "🤍",
}

type UnitStatus = "completed" | "active" | "locked"

function deriveUnitStatus(
  unitId: string,
  unlockedUnits: string[],
  completedLessons: string[],
): UnitStatus {
  if (completedLessons.includes(unitId)) return "completed"
  if (unlockedUnits.includes(unitId)) return "active"
  return "locked"
}

type LevelStatus = "completed" | "active" | "locked"

function deriveLevelStatus(
  units: DiniUnit[],
  unlockedUnits: string[],
  completedLessons: string[],
): LevelStatus {
  const statuses = units.map((u) => deriveUnitStatus(u.id, unlockedUnits, completedLessons))
  if (statuses.every((s) => s === "completed")) return "completed"
  if (statuses.some((s) => s === "active" || s === "completed")) return "active"
  return "locked"
}

function groupByLevel(units: DiniUnit[]): Map<number, DiniUnit[]> {
  const map = new Map<number, DiniUnit[]>()
  for (const u of units) {
    const arr = map.get(u.level) ?? []
    arr.push(u)
    map.set(u.level, arr)
  }
  return map
}

export function StudentDashboard() {
  const { xp, unlockedUnits, completedLessons, registerActivity } = useProgress()
  const [units, setUnits] = useState<DiniUnit[]>([])
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetchDiniUnits()
      .then((rows) => {
        if (alive && rows.length > 0) setUnits(rows)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    registerActivity().catch(() => {})
  }, [registerActivity])

  useEffect(() => {
    if (units.length === 0 || expandedLevel !== null) return
    const levels = groupByLevel(units)
    for (const [lvl, lvlUnits] of levels) {
      const status = deriveLevelStatus(lvlUnits, unlockedUnits, completedLessons)
      if (status === "active") {
        setExpandedLevel(lvl)
        return
      }
    }
    setExpandedLevel(1)
  }, [units, unlockedUnits, completedLessons, expandedLevel])

  const playerLevel = Math.floor(xp / 250) + 1
  const xpInLevel = xp % 250
  const levelProgress = (xpInLevel / 250) * 100

  const grouped = groupByLevel(units)
  const sortedLevels = Array.from(grouped.entries()).sort(([a], [b]) => a - b)

  return (
    <div>
      {/* Seviye ilerleme çubuğu */}
      <div className="mx-auto max-w-md px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Seviye {playerLevel}</span>
          <Progress value={levelProgress} className="h-3 flex-1 rounded-full" />
          <span className="text-xs font-medium text-muted-foreground">Seviye {playerLevel + 1}</span>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-6 pb-8">
        <h2 className="mb-6 text-center text-xl font-bold text-foreground">Öğrenme Yolu</h2>

        <div className="flex flex-col gap-4">
          {sortedLevels.map(([lvl, lvlUnits], levelIdx) => {
            const lvlStatus = deriveLevelStatus(lvlUnits, unlockedUnits, completedLessons)
            const isExpanded = expandedLevel === lvl
            const completedCount = lvlUnits.filter((u) => completedLessons.includes(u.id)).length
            const lvlProgress = (completedCount / lvlUnits.length) * 100

            return (
              <motion.div
                key={lvl}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: levelIdx * 0.08, type: "spring", stiffness: 200 }}
              >
                <button
                  onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
                  disabled={lvlStatus === "locked"}
                  className={`
                    flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all
                    ${lvlStatus === "completed" ? "border-primary bg-primary/5" : ""}
                    ${lvlStatus === "active" ? "border-warning bg-warning/5" : ""}
                    ${lvlStatus === "locked" ? "border-border bg-muted opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <span className="text-2xl">{LEVEL_EMOJIS[lvl] ?? "📚"}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Seviye {lvl}</p>
                    <p className={`text-sm font-bold ${lvlStatus === "locked" ? "text-muted-foreground" : "text-foreground"}`}>
                      {LEVEL_NAMES[lvl] ?? `Seviye ${lvl}`}
                    </p>
                    {lvlStatus !== "locked" && (
                      <Progress value={lvlProgress} className="mt-2 h-2 rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lvlStatus === "completed" && <CheckCircle className="size-5 text-primary" />}
                    {lvlStatus === "active" && (
                      <span className="text-xs font-medium text-warning">{completedCount}/{lvlUnits.length}</span>
                    )}
                    {lvlStatus === "locked" && <Lock className="size-5 text-muted-foreground" />}
                    {lvlStatus !== "locked" && (
                      <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </button>

                {isExpanded && lvlStatus !== "locked" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 flex flex-col gap-2 pl-4"
                  >
                    {lvlUnits.map((unit, unitIdx) => {
                      const uStatus = deriveUnitStatus(unit.id, unlockedUnits, completedLessons)
                      return (
                        <motion.div
                          key={unit.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: unitIdx * 0.05 }}
                        >
                          <UnitRow unit={unit} status={uStatus} />
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function UnitRow({ unit, status }: { unit: DiniUnit; status: UnitStatus }) {
  const isCompleted = status === "completed"
  const isActive = status === "active"
  const isLocked = status === "locked"

  const shortTitle = unit.title.replace(/^Seviye \d+ · /, "")

  return (
    <Link
      to={isLocked ? "#" : `/ders/${unit.id}`}
      className={`
        flex items-center gap-3 rounded-xl border px-4 py-3 transition-all
        ${isCompleted ? "border-primary/40 bg-primary/5" : ""}
        ${isActive ? "border-warning/40 bg-warning/5 shadow-sm" : ""}
        ${isLocked ? "border-border bg-muted/50 opacity-50 pointer-events-none" : ""}
      `}
    >
      <div
        className={`
          flex size-9 shrink-0 items-center justify-center rounded-full
          ${isCompleted ? "bg-primary text-primary-foreground" : ""}
          ${isActive ? "bg-warning text-warning-foreground" : ""}
          ${isLocked ? "bg-muted-foreground/20 text-muted-foreground" : ""}
        `}
      >
        {isCompleted && <CheckCircle className="size-4" />}
        {isActive && <BookOpen className="size-4" />}
        {isLocked && <Lock className="size-4" />}
      </div>
      <p className={`text-sm font-medium ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
        {shortTitle}
      </p>
    </Link>
  )
}
