import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const peygamberler = [
  {
    id: "hz-muhammed",
    title: "Hz. Muhammed (s.a.v.)",
    subtitle: "Son Peygamber",
    emoji: "🌹",
    pdf: "/siyer.pdf",
    sayfa: 438,
    aciklama: "Peygamber Efendimizin doğumundan vefatına kadar hayatını öğreniyoruz.",
  },
  // Diğer peygamberler PDF'leri geldikçe eklenecek
]

export function PeygamberlerScreen() {
  return (
    <div className="min-h-svh">
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <h1 className="text-xl font-bold text-foreground">Peygamberler</h1>
        <p className="text-sm text-muted-foreground">
          Peygamberlerimizin hayatlarını okuyalım
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 pb-24">
        <div className="grid grid-cols-1 gap-3">
          {peygamberler.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/peygamberler/${p.id}`}
                className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-4 py-4 text-left transition-all hover:border-primary/30 active:scale-[0.98]"
              >
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.aciklama}
                  </p>
                </div>
                <div className="flex flex-col items-center shrink-0 rounded-xl bg-primary/10 px-3 py-2">
                  <span className="text-sm font-bold text-primary">{p.sayfa}</span>
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
