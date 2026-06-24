import { Link } from "react-router-dom"
import {
  TrendingUp,
  Clock,
  GraduationCap,
  FolderOpen,
  AlertTriangle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useProgress } from "@/hooks/useProgress"
import type { RecentActivity, WeakTopic } from "@/types"

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })
}

export function AdminDashboard() {
  const { user } = useAuth()
  const { xp, completedLessons } = useProgress()

  const displayName = user?.name ?? "Öğrenci"
  const level = Math.floor(xp / 250) + 1

  const recentActivity: RecentActivity[] = []
  const weakTopics: WeakTopic[] = []

  const overview = {
    accuracyRate: "—",
    totalTimeSpent: "—",
    completedUnits: completedLessons.length,
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ebeveyn Paneli</h1>
            <p className="text-sm text-muted-foreground">
              {displayName} • Seviye {level} • {xp} XP
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/yonetici/icerik">
              <Button variant="outline" size="sm">
                <FolderOpen data-icon="inline-start" />
                İçerik Yönetimi
              </Button>
            </Link>
            <Link to="/profil">
              <Button variant="ghost" size="sm">
                Öğrenci Görünümü
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Genel Bakış
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Başarı Oranı
                </CardDescription>
                <CardTitle className="text-3xl">{overview.accuracyRate}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Son sınavların ortalama doğruluk oranı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Harcanan Zaman
                </CardDescription>
                <CardTitle className="text-3xl">{overview.totalTimeSpent}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Toplam uygulama kullanım süresi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" />
                  Tamamlanan Üniteler
                </CardDescription>
                <CardTitle className="text-3xl">{overview.completedUnits}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Başarıyla bitirilen ünite sayısı</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
              <CardDescription>
                Öğrencinin son etkileşimleri ve elde ettiği puanlar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Tarih</TableHead>
                    <TableHead className="w-28">Modül</TableHead>
                    <TableHead>Aktivite</TableHead>
                    <TableHead className="w-20 text-right">XP</TableHead>
                    <TableHead className="w-24 text-right">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        Henüz aktivite kaydı yok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentActivity.map((a, i) => {
                      const isError = a.status === "error"
                      return (
                        <TableRow
                          key={i}
                          className={
                            isError ? "bg-destructive/5 hover:bg-destructive/10" : undefined
                          }
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(a.date)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{a.module}</TableCell>
                          <TableCell
                            className={`text-sm ${isError ? "text-destructive" : "text-foreground"}`}
                          >
                            {a.action}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {a.earnedXp > 0 ? `+${a.earnedXp}` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={isError ? "destructive" : "default"}
                              className="text-xs font-semibold uppercase"
                            >
                              {isError ? "Hata" : "Başarılı"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="size-5 text-warning" />
                Zorlanılan Konular
              </CardTitle>
              <CardDescription>Ebeveyn olarak dikkat etmeniz önerilen alanlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weakTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Şu an için zorlanılan konu yok. 🎉
                </p>
              ) : (
                weakTopics.map((w, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-warning/30 bg-background/60 p-3"
                  >
                    <p className="text-sm font-semibold text-foreground">{w.topic}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{w.suggestion}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
