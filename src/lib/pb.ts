import PocketBase, { type AuthRecord } from "pocketbase"

// PocketBase backend URL'i. .env üzerinden override edilebilir.
const PB_URL = import.meta.env.VITE_PB_URL ?? "http://127.0.0.1:8090"

export const pb = new PocketBase(PB_URL)
pb.autoCancellation(false)

export interface CandinUser {
  id: string
  email: string
  username: string
  name?: string
  avatar?: string
  level?: number
  xp?: number
  streak?: number
  last_active_date?: string
  completed_lessons?: string[]
  unlocked_units?: string[]
  badges?: string[]
}

export function getCurrentUser(): CandinUser | null {
  const record = pb.authStore.model as (AuthRecord & Partial<CandinUser>) | null
  if (!record) return null
  return record as unknown as CandinUser
}

export function isLoggedIn(): boolean {
  return pb.authStore.isValid
}
