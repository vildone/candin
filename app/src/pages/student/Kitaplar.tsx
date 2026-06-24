import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const kitaplar = [
  {
    id: "kutlu-yolculuk",
    title: "Kutlu Yolculuk - Medine'ye Hicret",
    subtitle: "Diyanet Çocuk",
    emoji: "📚",
    pdf: "/kutlu-yolculuk.pdf",
    sayfa: 52,
    aciklama: "Peygamber Efendimizin Medine'ye hicretini çocuklar için anlatan renkli bir kitap.",
  },
  // Yeni kitaplar eklendikçe buraya eklenecek
]

export function KitaplarScreen() {
  return (
    <div className="min-h-svh">
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Kitaplar</h1>
        <p className="text-sm text-muted-foreground">
          Dini çocuk kitaplarını okuyalım
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 pb-24">
        <div className="grid grid-cols-1 gap-3">
          {kitaplar.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/kitaplar/${k.id}`}
                className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-4 py-4 text-left transition-all hover:border-primary/30 active:scale-[0.98]"
              >
                <span className="text-3xl">{k.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {k.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {k.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {k.aciklama}
                  </p>
                </div>
                <div className="flex flex-col items-center shrink-0 rounded-xl bg-primary/10 px-3 py-2">
                  <span className="text-sm font-bold text-primary">{k.sayfa}</span>
                  <span className="text-xs text-muted-foreground">sayfa</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
