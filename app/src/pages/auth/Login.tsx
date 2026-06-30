import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email, password)
      navigate("/")
    } catch {
      setError("E-posta veya şifre hatalı.")
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
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15">
            <Sparkles className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Miraç</h1>
          <p className="text-sm text-muted-foreground">Hoş geldin, tekrar görüştük!</p>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={busy} className="h-12 rounded-2xl text-base font-bold">
                {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link to="/kayit" className="font-semibold text-primary">
                Kayıt Ol
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
