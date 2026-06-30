import { Link, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star,
  User,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { pb } from "@/lib/pb"

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  if (!user) return null

  const name = user.name?.trim() || user.email
  const initial = name.charAt(0).toUpperCase()
  const xp = user.xp ?? 0
  const level = Math.max(1, Math.floor(xp / 250) + 1)
  const avatarUrl = user.avatar
    ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}`
    : undefined

  const handleLogout = () => {
    logout()
    navigate("/giris")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 overflow-hidden">
            <img src="/mirac-32.png" alt="Miraç" className="size-7 object-contain" />
          </div>
          <span className="text-base font-bold text-foreground hidden sm:inline">
            Miraç
          </span>
        </Link>

        {/* Sağ: XP + Kullanıcı */}
        <div className="flex items-center gap-2">
          {/* XP Badge */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1">
            <Star className="size-3.5 text-warning" fill="currentColor" />
            <span className="text-xs font-bold text-foreground">{xp}</span>
          </div>

          {/* Kullanıcı Menüsü */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 transition-all hover:bg-muted/50 active:scale-95"
            >
              <Avatar className="size-8 ring-2 ring-primary/20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[80px] truncate">
                {name}
              </span>
              <ChevronDown className={`hidden sm:block size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border-2 border-border bg-card shadow-xl shadow-black/5 overflow-hidden z-50"
                >
                  {/* Kullanıcı bilgisi */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Avatar className="size-10 ring-2 ring-primary/20">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                      <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Seviye {level} · {xp} XP
                      </p>
                    </div>
                  </div>

                  {/* Menü öğeleri */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { navigate("/profil"); setOpen(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <User className="size-4 text-muted-foreground" />
                      Profilim
                    </button>
                    <button
                      onClick={() => { navigate("/yonetici"); setOpen(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      Ebeveyn Paneli
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
