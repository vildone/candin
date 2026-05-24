// Candin — src/data/*.json içeriğini PocketBase content_items'a yükler.
// Kullanım: PB_EMAIL=... PB_PASSWORD=... node scripts/seed-pb.mjs
// Default PB URL: http://localhost:8090

import PocketBase from "pocketbase"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "src", "data")

const PB_URL = process.env.PB_URL ?? "http://localhost:8090"
const PB_EMAIL = process.env.PB_EMAIL ?? "ethemkoklu@gmail.com"
const PB_PASSWORD = process.env.PB_PASSWORD ?? "Ek**123719"

const MODULES = [
  { module: "dini_bilgiler", file: "dini_bilgiler.json", arrayKey: "units" },
  { module: "elifba",        file: "elifba.json",        arrayKey: "lessons" },
  { module: "namaz",         file: "namaz.json",         arrayKey: "units" },
  { module: "sureler",       file: "sureler.json",       arrayKey: "units" },
  { module: "peygamberler",  file: "peygamberler.json",  arrayKey: "units" },
  { module: "dualar",        file: "dualar.json",        arrayKey: "units" },
]

async function loadJson(file) {
  const raw = await readFile(join(DATA_DIR, file), "utf8")
  return JSON.parse(raw)
}

async function main() {
  const pb = new PocketBase(PB_URL)
  await pb.collection("_superusers").authWithPassword(PB_EMAIL, PB_PASSWORD)
  console.log(`✓ Authenticated as ${PB_EMAIL}`)

  const existing = await pb.collection("content_items").getFullList({ batch: 500 })
  for (const r of existing) {
    await pb.collection("content_items").delete(r.id)
  }
  if (existing.length) console.log(`✓ Cleared ${existing.length} existing items`)

  let total = 0
  for (const { module, file, arrayKey } of MODULES) {
    const doc = await loadJson(file)
    const items = doc[arrayKey] ?? []
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`! ${module}: ${arrayKey} not found or empty in ${file}`)
      continue
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const item_id = String(item.id ?? `${module}_${i}`)
      await pb.collection("content_items").create({
        module,
        item_id,
        order_index: i,
        data: item,
      })
      total++
    }
    console.log(`✓ ${module}: ${items.length} item`)
  }

  console.log(`\nDone. ${total} content_items rows written.`)
}

main().catch((err) => {
  console.error("Seed failed:", err?.response?.data ?? err)
  process.exit(1)
})
