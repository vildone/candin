import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export function RegisterScreen() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.")
      return
    }
    setBusy(true)
    try {
      await register({ email, password, name })
      navigate("/")
    } catch (err: unknown) {
      let message = "Kayıt başarısız oldu."
      if (err && typeof err === "object") {
        const rec = err as Record<string, unknown>
        // PocketBase ClientResponseError: .data = response body = { data: { email: ... }, message: ... }
        const body = (typeof rec.data === "object" && rec.data !== null ? rec.data : {}) as Record<string, unknown>
        const inner = (typeof body.data === "object" && body.data !== null ? body.data : {}) as Record<string, unknown>
        const emailErr = inner.email as { code?: string; message?: string } | undefined
        if (emailErr?.code === "validation_not_unique") {
          message = "Bu e-posta adresi zaten kayıtlı."
        } else if (typeof rec.message === "string" && rec.message) {
          message = rec.message as string
        }
      }
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-4">
          <img 
            src="/mirac-192.png" 
            alt="Miraç" 
            className="size-24 object-contain drop-shadow-lg"
          />
          <h1 
            className="text-3xl font-bold text-foreground tracking-wide"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            Miraç
          </h1>
          <p className="text-sm text-muted-foreground">Öğrenme yolculuğun başlasın</p>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Ad</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adın"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@candin.app"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">En az 8 karakter.</p>
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={busy} className="h-12 rounded-2xl text-base font-bold">
                {busy ? "Kayıt oluşturuluyor..." : "Hesap Oluştur"}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Zaten hesabın var mı?{" "}
              <Link to="/giris" className="font-semibold text-primary">
                Giriş Yap
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
