import { useCallback, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { pb } from "@/lib/pb"
import type { LearnedItemType } from "@/types"

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function diffInDays(a: string, b: string): number {
  const ad = new Date(a + "T00:00:00").getTime()
  const bd = new Date(b + "T00:00:00").getTime()
  return Math.round((bd - ad) / 86400000)
}

export interface ProgressState {
  xp: number
  streak: number
  completedLessons: string[]
  unlockedUnits: string[]
  badges: string[]
  lastActiveDate: string | null
  learnedItems: LearnedItem[]
}

export interface LearnedItem {
  type: LearnedItemType
  id: string
  learnedAt: string
}

export function useProgress() {
  const { user, refresh } = useAuth()
  const [learnedItems, setLearnedItems] = useState<LearnedItem[]>([])

  // localStorage'dan öğrenildi bilgilerini yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem("candin_learned_items")
      if (saved) {
        setLearnedItems(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const saveLearned = useCallback((items: LearnedItem[]) => {
    setLearnedItems(items)
    localStorage.setItem("candin_learned_items", JSON.stringify(items))
  }, [])

  const state: ProgressState = {
    xp: user?.xp ?? 0,
    streak: user?.streak ?? 0,
    completedLessons: user?.completed_lessons ?? [],
    unlockedUnits: user?.unlocked_units ?? [],
    badges: user?.badges ?? [],
    lastActiveDate: user?.last_active_date ?? null,
    learnedItems,
  }

  const updateUser = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!user) return
      await pb.collection("users").update(user.id, patch)
      await refresh()
    },
    [user, refresh],
  )

  const addXp = useCallback(
    async (amount: number) => {
      if (!user || amount <= 0) return
      await updateUser({ xp: (user.xp ?? 0) + amount })
    },
    [user, updateUser],
  )

  const completeLesson = useCallback(
    async (lessonId: string, xpReward = 0) => {
      if (!user) return
      const done = user.completed_lessons ?? []
      if (done.includes(lessonId)) return
      await updateUser({
        completed_lessons: [...done, lessonId],
        xp: (user.xp ?? 0) + xpReward,
      })
    },
    [user, updateUser],
  )

  const unlockUnit = useCallback(
    async (unitId: string) => {
      if (!user) return
      const open = user.unlocked_units ?? []
      if (open.includes(unitId)) return
      await updateUser({ unlocked_units: [...open, unitId] })
    },
    [user, updateUser],
  )

  const awardBadge = useCallback(
    async (badgeId: string) => {
      if (!user) return
      const owned = user.badges ?? []
      if (owned.includes(badgeId)) return
      await updateUser({ badges: [...owned, badgeId] })
    },
    [user, updateUser],
  )

  const registerActivity = useCallback(async () => {
    if (!user) return
    const today = todayIso()
    const last = user.last_active_date ?? null
    const streak = user.streak ?? 0

    if (last === today) return
    if (!last) {
      await updateUser({ streak: 1, last_active_date: today })
      return
    }
    const delta = diffInDays(last, today)
    if (delta === 1) {
      await updateUser({ streak: streak + 1, last_active_date: today })
    } else if (delta > 1) {
      await updateUser({ streak: 1, last_active_date: today })
    }
  }, [user, updateUser])

  // ─── Öğrenildi takibi (localStorage) ───

  const markLearned = useCallback(
    (type: LearnedItemType, id: string) => {
      const exists = learnedItems.some((item) => item.type === type && item.id === id)
      if (exists) return
      const newItem: LearnedItem = {
        type,
        id,
        learnedAt: new Date().toISOString(),
      }
      saveLearned([...learnedItems, newItem])
    },
    [learnedItems, saveLearned],
  )

  const unmarkLearned = useCallback(
    (type: LearnedItemType, id: string) => {
      const filtered = learnedItems.filter(
        (item) => !(item.type === type && item.id === id),
      )
      saveLearned(filtered)
    },
    [learnedItems, saveLearned],
  )

  const isLearned = useCallback(
    (type: LearnedItemType, id: string): boolean => {
      return learnedItems.some((item) => item.type === type && item.id === id)
    },
    [learnedItems],
  )

  const getLearnedCount = useCallback(
    (type: LearnedItemType): number => {
      return learnedItems.filter((item) => item.type === type).length
    },
    [learnedItems],
  )

  return {
    ...state,
    addXp,
    completeLesson,
    unlockUnit,
    awardBadge,
    registerActivity,
    markLearned,
    unmarkLearned,
    isLearned,
    getLearnedCount,
  }
}
