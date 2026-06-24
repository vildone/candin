// Tüm uygulama için ortak tip tanımları.
// İçerik JSON dosyalarımız bu tiplere uyacak.

export type LessonStatus = "completed" | "active" | "locked"

export interface Unit {
  id: string
  title: string
  description?: string
  lessonIds: string[]
}

export interface Lesson {
  id: string
  unitId: string
  title: string
  xpReward: number
}

// Çoktan seçmeli quiz (her ders/unite sonunda)
export interface Quiz {
  question: string
  options: string[]
  correctAnswer: string
  xpReward: number
}

// ─── Kur'an sekmesi: Elif-Ba ───

export interface KuranLetter {
  id: string
  letter: string          // Arapça harf
  name: string            // Türkçe ad (Elif, Ba, ...)
  visualHook: string      // Görsel ipucu / hatırlatıcı cümle
  audioSrc: string        // Ses dosyası yolu
  quiz?: Quiz
}

// ─── Dersler sekmesi: Duolingo yapısı ───

export interface DiniUnit {
  id: string
  title: string
  level: number
  cards: string[]
  quiz: Quiz[]
}

// ─── Dualar sekmesi ───

export interface DuaWord {
  arabic: string
  turkish: string
  transliteration?: string
}

export interface Dua {
  id: string
  title: string
  arabic: string
  turkish: string
  transliteration: string
  category: string        // "sabah", "akşam", "yemek", "genel", "namaz", vb.
  words: DuaWord[]
  explanation?: string
  audioSrc?: string
  order: number
}

// ─── Hikayeler sekmesi ───

export interface Hikaye {
  id: string
  title: string
  emoji: string
  summary: string         // Kısa özet (liste kartında)
  content: string         // Tam metin (markdown)
  keyPoints: string[]     // Önemli dersler
  estimatedMinutes: number
  imageSrc?: string
  order: number
}

// ─── Namaz sekmesi: Genişletilmiş ───

export interface NamazStep {
  id: number
  title: string
  description: string
  detail: string
  emoji: string
  imageSrc?: string
  // Namazda okunan dualar/tespihler
  readings?: NamazReading[]
}

export interface NamazReading {
  arabic: string
  turkish: string
  transliteration: string
  note?: string           // "3 kere tekrar et" gibi
}

export interface NamazFlow {
  id: string
  title: string
  steps: NamazStep[]
}

// ─── Sureler sekmesi: Boşluk doldurma oyunu ───

export interface BlankQuestion {
  id: string
  surah: string
  parts: string[]         // "____" yer tutucu içerir
  blankIndex: number
  options: string[]
  correctIndex: number
  xpReward: number
}

// ─── Peygamberler sekmesi: Hikaye dizileri ───

export interface ProphetStory {
  id: string
  title: string
  emoji: string
  paragraphs: string[]
}

// ─── Profil rozetleri ───

export interface BadgeDef {
  id: string
  title: string
  description?: string
  iconName: string
  requirementXp?: number
  requirementStreak?: number
}

export interface StudentBadge {
  id: string
  name: string
  description: string
  icon: string
}

export interface StudentProfile {
  name: string
  avatar: string
  level: number
  totalXp: number
  dailyStreak: number
  badges: StudentBadge[]
}

export interface AdminOverview {
  accuracyRate: string
  totalTimeSpent: string
  completedUnits: number
}

export type ActivityStatus = "success" | "error"

export interface RecentActivity {
  date: string
  module: string
  action: string
  earnedXp: number
  status: ActivityStatus
}

export interface WeakTopic {
  topic: string
  suggestion: string
}

export interface AdminDashboardData {
  overview: AdminOverview
  recentActivity: RecentActivity[]
  weakTopics: WeakTopic[]
}

// ─── Öğrenildi takibi ───
export type LearnedItemType = "dua" | "hikaye" | "namaz_step" | "kuran_letter" | "kitap"

export interface LearnedItem {
  type: LearnedItemType
  id: string
  learnedAt: string       // ISO timestamp
}

// ─── Elifba Dersleri (Kur'an sekmesi) ───

export interface ElifbaSes {
  id: string
  url: string
  label: string
}

export interface ElifbaGorsel {
  id: string
  url: string
  alt: string
}

export interface ElifbaDers {
  id: string
  ders_no: number
  title: string
  descriptions: string[]
  method: string
  sesler: ElifbaSes[]
  gorseller: ElifbaGorsel[]
}

