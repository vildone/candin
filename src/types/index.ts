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

// Kur'an sekmesi: Elif-Ba dinamik bilgi kartı
export interface KuranLetter {
  id: string
  letter: string          // Arapça harf
  name: string            // Türkçe ad (Elif, Ba, ...)
  visualHook: string      // Görsel ipucu / hatırlatıcı cümle
  audioSrc: string        // Ses dosyası yolu
  quiz?: Quiz
}

// Din sekmesi: kartlar + sondaki quiz olan ünite
export interface DiniUnit {
  id: string
  title: string
  level: number
  cards: string[]
  quiz: Quiz[]
}

// Namaz sekmesi: dikey adımlar
export interface NamazStep {
  id: number
  title: string
  description: string
  detail: string
  emoji: string
}

export interface NamazFlow {
  id: string
  title: string
  steps: NamazStep[]
}

// Sureler sekmesi: boşluk doldurma oyunu
export interface BlankQuestion {
  id: string
  surah: string
  parts: string[]         // "____" yer tutucu içerir
  blankIndex: number
  options: string[]
  correctIndex: number
  xpReward: number
}

// Peygamberler sekmesi: hikaye dizileri
export interface ProphetStory {
  id: string
  title: string
  emoji: string
  paragraphs: string[]
}

// Profil rozetleri (XP/streak şartlı eski tip)
export interface BadgeDef {
  id: string
  title: string
  description?: string
  iconName: string
  requirementXp?: number
  requirementStreak?: number
}

// kullanici.json — student_profile.badges
export interface StudentBadge {
  id: string
  name: string
  description: string
  icon: string            // emoji
}

// kullanici.json — student_profile
export interface StudentProfile {
  name: string
  avatar: string
  level: number
  totalXp: number
  dailyStreak: number
  badges: StudentBadge[]
}

// kullanici.json — admin_dashboard.overview
export interface AdminOverview {
  accuracyRate: string
  totalTimeSpent: string
  completedUnits: number
}

export type ActivityStatus = "success" | "error"

export interface RecentActivity {
  date: string            // yyyy-mm-dd
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
