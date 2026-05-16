import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/auth"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/giris" replace state={{ from: location }} />
  }

  return <>{children}</>
}
