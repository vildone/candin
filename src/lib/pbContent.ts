import { pb } from "@/lib/pb"
import type {
  KuranLetter,
  DiniUnit,
  Unit,
  NamazFlow,
  NamazStep,
  BlankQuestion,
  ProphetStory,
  Quiz,
} from "@/types"

interface ContentRecord<T = unknown> {
  id: string
  module: string
  item_id: string
  order_index: number
  data: T
}

interface RawQuiz {
  question: string
  options: string[]
  correct_answer: string
  xp_reward: number
}

function mapQuiz(q: RawQuiz): Quiz {
  return {
    question: q.question,
    options: q.options,
    correctAnswer: q.correct_answer,
    xpReward: q.xp_reward,
  }
}

async function fetchModule<T>(module: string): Promise<ContentRecord<T>[]> {
  return pb.collection("content_items").getFullList<ContentRecord<T>>({
    filter: `module="${module}"`,
    sort: "order_index",
  })
}

interface RawDiniUnit {
  id: string
  unit_title: string
  level?: number
  cards: string[]
  quiz: RawQuiz
}

export async function fetchDiniUnits(): Promise<DiniUnit[]> {
  const rows = await fetchModule<RawDiniUnit>("dini_bilgiler")
  return rows.map((r) => ({
    id: r.data.id,
    title: r.data.unit_title,
    level: r.data.level ?? 1,
    cards: r.data.cards,
    quiz: mapQuiz(r.data.quiz),
  }))
}

export async function fetchUnits(): Promise<Unit[]> {
  const units = await fetchDiniUnits()
  return units.map((u) => ({
    id: u.id,
    title: u.title,
    lessonIds: [`${u.id}_quiz`],
  }))
}

interface RawKuranLesson {
  id: string
  letter_arabic: string
  letter_turkish: string
  visual_hook_text: string
  audio_src: string
  quiz?: RawQuiz
}

export async function fetchKuranLetters(): Promise<KuranLetter[]> {
  const rows = await fetchModule<RawKuranLesson>("elifba")
  return rows.map((r) => ({
    id: r.data.id,
    letter: r.data.letter_arabic,
    name: r.data.letter_turkish,
    visualHook: r.data.visual_hook_text,
    audioSrc: r.data.audio_src,
    quiz: r.data.quiz ? mapQuiz(r.data.quiz) : undefined,
  }))
}

interface RawNamazStep {
  step_number: number
  title: string
  description: string
  detail?: string
  emoji?: string
  image_src?: string
}

interface RawNamazUnit {
  id: string
  unit_title: string
  steps: RawNamazStep[]
}

export async function fetchNamazFlow(): Promise<NamazFlow | null> {
  const rows = await fetchModule<RawNamazUnit>("namaz")
  if (rows.length === 0) return null
  const first = rows[0].data
  const steps: NamazStep[] = first.steps.map((s) => ({
    id: s.step_number,
    title: s.title,
    description: s.description,
    detail: s.detail ?? "",
    emoji: s.emoji ?? "🕌",
  }))
  return { id: first.id, title: first.unit_title, steps }
}

interface RawSurahQuestion {
  id: string
  text: string
  options: string[]
  correct_answer: string
  translation_hint?: string
  xp_reward: number
}

interface RawSurahUnit {
  id: string
  unit_title: string
  description?: string
  questions: RawSurahQuestion[]
}

function buildBlankQuestion(surah: string, q: RawSurahQuestion): BlankQuestion {
  const placeholder = "____"
  const idx = q.text.indexOf(placeholder)
  const parts =
    idx >= 0
      ? [q.text.slice(0, idx).trim(), q.text.slice(idx + placeholder.length).trim()]
      : [q.text]
  const blankIndex = idx >= 0 ? 1 : 0
  const correctIndex = Math.max(0, q.options.indexOf(q.correct_answer))
  return {
    id: q.id,
    surah,
    parts,
    blankIndex,
    options: q.options,
    correctIndex,
    xpReward: q.xp_reward,
  }
}

export async function fetchBlankQuestions(): Promise<BlankQuestion[]> {
  const rows = await fetchModule<RawSurahUnit>("sureler")
  return rows.flatMap((r) =>
    r.data.questions.map((q) => buildBlankQuestion(r.data.unit_title, q)),
  )
}

interface RawProphetCard {
  step: number
  image_src?: string
  text: string
}

interface RawProphetUnit {
  id: string
  unit_title: string
  emoji?: string
  story_cards: RawProphetCard[]
}

export async function fetchProphetStories(): Promise<ProphetStory[]> {
  const rows = await fetchModule<RawProphetUnit>("peygamberler")
  return rows.map((r) => ({
    id: r.data.id,
    title: r.data.unit_title,
    emoji: r.data.emoji ?? "📖",
    paragraphs: r.data.story_cards.map((c) => c.text),
  }))
}
