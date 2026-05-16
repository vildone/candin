import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Flame, Star, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { pb } from "@/lib/pb"

// Rozet kataloğu — id'den görsel verilere eşleme.
const BADGE_CATALOG: Record<string, { name: string; icon: string }> = {
  ilk_ders: { name: "İlk Ders", icon: "🌟" },
  iman_ustasi: { name: "İman Ustası", icon: "🕌" },
  elifba_kahramani: { name: "Elifba Kahramanı", icon: "📖" },
  namaz_dostu: { name: "Namaz Dostu", icon: "🤲" },
  yedi_gun_serisi: { name: "7 Günlük Seri", icon: "🔥" },
  sure_bilgini: { name: "Sure Bilgini", icon: "📜" },
}

export function ProfilScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const name = user.name?.trim() || user.email
  const initial = (name || "?").charAt(0).toUpperCase()
  const xp = user.xp ?? 0
  const streak = user.streak ?? 0
  const level = Math.max(1, Math.floor(xp / 100) + 1)
  const badgeIds = user.badges ?? []
  const avatarUrl = user.avatar
    ? `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}`
    : undefined

  const handleLogout = () => {
    logout()
    navigate("/giris")
  }

  return (
    <div className="min-h-svh pb-24">
      {/* Avatar + ad + seviye */}
      <div className="mx-auto max-w-md px-4 pt-10">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
          >
            <Avatar className="size-24 ring-4 ring-primary/30 shadow-lg shadow-primary/20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
            <motion.div
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Star className="size-4 text-warning" fill="currentColor" />
              <span className="text-sm font-bold text-primary">Seviye {level}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Streak + XP yan yana */}
      <div className="mx-auto max-w-md px-4 pt-8">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="rounded-3xl border-2 border-orange-500/30 bg-orange-500/5">
              <CardContent className="flex flex-col items-center gap-2 p-5">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Flame className="size-10 text-orange-500" fill="currentColor" />
                </motion.div>
                <span className="text-3xl font-extrabold text-foreground">{streak}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Günlük Seri
                </span>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="rounded-3xl border-2 border-warning/30 bg-warning/5">
              <CardContent className="flex flex-col items-center gap-2 p-5">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                >
                  <Star className="size-10 text-warning" fill="currentColor" />
                </motion.div>
                <span className="text-3xl font-extrabold text-foreground">{xp}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Toplam XP
                </span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Rozetler */}
      <div className="mx-auto max-w-md px-4 pt-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">
          🏆 Kazanılan Rozetler
        </h2>

        {badgeIds.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Henüz rozet yok — öğrenmeye devam!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {badgeIds.map((badgeId, index) => {
              const meta = BADGE_CATALOG[badgeId] ?? { name: badgeId, icon: "🏅" }
              return (
                <motion.div
                  key={badgeId}
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.25 + index * 0.08,
                    type: "spring",
                    stiffness: 220,
                    damping: 12,
                  }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="rounded-2xl border-2 border-primary/15 bg-card">
                    <CardContent className="flex flex-col items-center gap-2 p-4">
                      <motion.span
                        className="text-5xl"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2 + index * 0.3,
                          ease: "easeInOut",
                        }}
                      >
                        {meta.icon}
                      </motion.span>
                      <span className="text-center text-xs font-bold text-foreground leading-tight">
                        {meta.name}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Yönetici Paneli + Çıkış */}
      <div className="mx-auto max-w-md px-4 pt-10 pb-4 flex flex-col gap-2">
        <Link to="/yonetici">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs font-normal text-muted-foreground/60 hover:text-muted-foreground"
          >
            Yönetici Paneli'ne Geç
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full text-xs font-normal text-muted-foreground/60 hover:text-destructive"
        >
          <LogOut className="size-3.5 mr-1" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}
