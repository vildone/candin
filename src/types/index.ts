     1|// Tüm uygulama için ortak tip tanımları.
     2|// İçerik JSON dosyalarımız bu tiplere uyacak.
     3|
     4|export type LessonStatus = "completed" | "active" | "locked"
     5|
     6|export interface Unit {
     7|  id: string
     8|  title: string
     9|  description?: string
    10|  lessonIds: string[]
    11|}
    12|
    13|export interface Lesson {
    14|  id: string
    15|  unitId: string
    16|  title: string
    17|  xpReward: number
    18|}
    19|
    20|// Çoktan seçmeli quiz (her ders/unite sonunda)
    21|export interface Quiz {
    22|  question: string
    23|  options: string[]
    24|  correctAnswer: string
    25|  xpReward: number
    26|}
    27|
    28|// ─── Kur'an sekmesi: Elif-Ba ───
    29|
    30|export interface KuranLetter {
    31|  id: string
    32|  letter: string          // Arapça harf
    33|  name: string            // Türkçe ad (Elif, Ba, ...)
    34|  visualHook: string      // Görsel ipucu / hatırlatıcı cümle
    35|  audioSrc: string        // Ses dosyası yolu
    36|  quiz?: Quiz
    37|}
    38|
    39|// ─── Dersler sekmesi: Duolingo yapısı ───
    40|
    41|export interface DiniUnit {
    42|  id: string
    43|  title: string
    44|  level: number
    45|  cards: string[]
    46|  quiz: Quiz[]
    47|}
    48|
    49|// ─── Dualar sekmesi ───
    50|
    51|export interface DuaWord {
    52|  arabic: string
    53|  turkish: string
    54|  transliteration?: string
    55|}
    56|
    57|export interface Dua {
    58|  id: string
    59|  title: string
    60|  arabic: string
    61|  turkish: string
    62|  transliteration: string
    63|  category: string        // "sabah", "akşam", "yemek", "genel", "namaz", vb.
    64|  words: DuaWord[]
    65|  explanation?: string
    66|  audioSrc?: string
    67|  order: number
    68|}
    69|
    70|// ─── Hikayeler sekmesi ───
    71|
    72|export interface Hikaye {
    73|  id: string
    74|  title: string
    75|  emoji: string
    76|  summary: string         // Kısa özet (liste kartında)
    77|  content: string         // Tam metin (markdown)
    78|  keyPoints: string[]     // Önemli dersler
    79|  estimatedMinutes: number
    80|  imageSrc?: string
    81|  order: number
    82|}
    83|
    84|// ─── Namaz sekmesi: Genişletilmiş ───
    85|
    86|export interface NamazStep {
    87|  id: number
    88|  title: string
    89|  description: string
    90|  detail: string
    91|  emoji: string
    92|  imageSrc?: string
    93|  // Namazda okunan dualar/tespihler
    94|  readings?: NamazReading[]
    95|}
    96|
    97|export interface NamazReading {
    98|  arabic: string
    99|  turkish: string
   100|  transliteration: string
   101|  note?: string           // "3 kere tekrar et" gibi
   102|}
   103|
   104|export interface NamazFlow {
   105|  id: string
   106|  title: string
   107|  steps: NamazStep[]
   108|}
   109|
   110|// ─── Sureler sekmesi: Boşluk doldurma oyunu ───
   111|
   112|export interface BlankQuestion {
   113|  id: string
   114|  surah: string
   115|  parts: string[]         // "____" yer tutucu içerir
   116|  blankIndex: number
   117|  options: string[]
   118|  correctIndex: number
   119|  xpReward: number
   120|}
   121|
   122|// ─── Peygamberler sekmesi: Hikaye dizileri ───
   123|
   124|export interface ProphetStory {
   125|  id: string
   126|  title: string
   127|  emoji: string
   128|  paragraphs: string[]
   129|}
   130|
   131|// ─── Profil rozetleri ───
   132|
   133|export interface BadgeDef {
   134|  id: string
   135|  title: string
   136|  description?: string
   137|  iconName: string
   138|  requirementXp?: number
   139|  requirementStreak?: number
   140|}
   141|
   142|export interface StudentBadge {
   143|  id: string
   144|  name: string
   145|  description: string
   146|  icon: string
   147|}
   148|
   149|export interface StudentProfile {
   150|  name: string
   151|  avatar: string
   152|  level: number
   153|  totalXp: number
   154|  dailyStreak: number
   155|  badges: StudentBadge[]
   156|}
   157|
   158|export interface AdminOverview {
   159|  accuracyRate: string
   160|  totalTimeSpent: string
   161|  completedUnits: number
   162|}
   163|
   164|export type ActivityStatus = "success" | "error"
   165|
   166|export interface RecentActivity {
   167|  date: string
   168|  module: string
   169|  action: string
   170|  earnedXp: number
   171|  status: ActivityStatus
   172|}
   173|
   174|export interface WeakTopic {
   175|  topic: string
   176|  suggestion: string
   177|}
   178|
   179|export interface AdminDashboardData {
   180|  overview: AdminOverview
   181|  recentActivity: RecentActivity[]
   182|  weakTopics: WeakTopic[]
   183|}
   184|
   185|// ─── Öğrenildi takibi ───
   186|export type LearnedItemType = "dua" | "hikaye" | "namaz_step" | "kuran_letter"
   187|
   188|export interface LearnedItem {
   189|  type: LearnedItemType
   190|  id: string
   191|  learnedAt: string       // ISO timestamp
   192|}

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

   193|