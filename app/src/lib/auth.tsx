import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { pb, type CandinUser, getCurrentUser } from "@/lib/pb"

interface AuthContextValue {
  user: CandinUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; name: string }) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CandinUser | null>(getCurrentUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(getCurrentUser())
    })

    if (pb.authStore.isValid) {
      pb.collection("users")
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    await pb.collection("users").authWithPassword(email, password)
  }

  const register = async (data: { email: string; password: string; name: string }) => {
    await pb.collection("users").create({
      email: data.email,
      password: data.password,
      passwordConfirm: data.password,
      name: data.name,
      xp: 0,
      streak: 0,
      completed_lessons: [],
      unlocked_units: ["s1_islam_muslim"],
      badges: [],
    })
    await pb.collection("users").authWithPassword(data.email, data.password)
  }

  const logout = () => {
    pb.authStore.clear()
  }

  const refresh = async () => {
    if (!pb.authStore.isValid) return
    await pb.collection("users").authRefresh()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
