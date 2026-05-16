import { Link } from "react-router-dom"
import { ArrowLeft, Plus, FileText, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const contentItems = [
  { id: 1, title: "İmanın Şartları", lessons: 4, quizzes: 2, status: "Aktif" },
  { id: 2, title: "Melekler", lessons: 3, quizzes: 1, status: "Taslak" },
  { id: 3, title: "Kitaplar", lessons: 0, quizzes: 0, status: "Planlı" },
  { id: 4, title: "Peygamberler", lessons: 0, quizzes: 0, status: "Planlı" },
]

export function ContentManagement() {
  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/yonetici">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">İçerik Yönetimi</h1>
              <p className="text-sm text-muted-foreground">
                Ders ve sınav içeriklerini yönetin
              </p>
            </div>
          </div>
          <Button>
            <Plus data-icon="inline-start" />
            Yeni Ünite Ekle
          </Button>
        </div>
      </header>

      {/* Content List */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-4">
          {contentItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "Aktif"
                        ? "bg-primary/10 text-primary"
                        : item.status === "Taslak"
                          ? "bg-warning/10 text-warning-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <CardDescription>Ünite {item.id}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="size-4" />
                  <span>{item.lessons} Ders</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="size-4" />
                  <span>{item.quizzes} Sınav</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state hint */}
        <Card className="mt-8 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              JSON ders içerikleri buraya yüklenecek
            </p>
            <p className="text-sm text-muted-foreground">
              Ders ve sınav içeriklerini JSON formatında ekleyebilirsiniz
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
