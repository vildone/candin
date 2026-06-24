import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/lib/auth"
import { RequireAuth } from "@/components/RequireAuth"
import { StudentLayout } from "@/components/StudentLayout"
import { StudentDashboard } from "@/pages/student/Dashboard"
import { LessonScreen } from "@/pages/student/Lesson"
import { QuizScreen } from "@/pages/student/Quiz"
import { KuranScreen } from "@/pages/student/Kuran"
import { NamazScreen } from "@/pages/student/Namaz"
import { DualarScreen } from "@/pages/student/Dualar"
import { DuaDetailScreen } from "@/pages/student/DuaDetail"
import { PeygamberlerScreen } from "@/pages/student/Peygamberler"
import { PeygamberDetailScreen } from "@/pages/student/PeygamberDetail"
import { KitaplarScreen } from "@/pages/student/Kitaplar"
import { KitapDetailScreen } from "@/pages/student/KitapDetail"
import { ProfilScreen } from "@/pages/student/Profil"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { ContentManagement } from "@/pages/admin/ContentManagement"
import { LoginScreen } from "@/pages/auth/Login"
import { RegisterScreen } from "@/pages/auth/Register"

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Açık (auth gerektirmeyen) rotalar */}
          <Route path="/giris" element={<LoginScreen />} />
          <Route path="/kayit" element={<RegisterScreen />} />

          {/* Öğrenci uygulaması (bottom nav ile) */}
          <Route
            element={
              <RequireAuth>
                <StudentLayout />
              </RequireAuth>
            }
          >
            {/* Dersler (Ana sayfa - Duolingo yapısı) */}
            <Route path="/" element={<StudentDashboard />} />

            {/* Dualar */}
            <Route path="/dualar" element={<DualarScreen />} />
            <Route path="/dualar/:duaId" element={<DuaDetailScreen />} />

            {/* Peygamberler — detay sayfası StudentLayout DIŞINDA (tam ekran) */}
            <Route path="/peygamberler" element={<PeygamberlerScreen />} />

            {/* Kitaplar */}
            <Route path="/kitaplar" element={<KitaplarScreen />} />

            {/* Namaz */}
            <Route path="/namaz" element={<NamazScreen />} />

            {/* Kur'an */}
            <Route path="/kuran" element={<KuranScreen />} />

            {/* Profil */}
            <Route path="/profil" element={<ProfilScreen />} />
          </Route>

          {/* Tam ekran öğrenci sayfaları (bottom nav yok) */}
          <Route
            path="/ders/:unitId"
            element={
              <RequireAuth>
                <LessonScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/sinav/:unitId"
            element={
              <RequireAuth>
                <QuizScreen />
              </RequireAuth>
            }
          />

          {/* Peygamber detay — tam ekran (PDF okuma) */}
          <Route
            path="/peygamberler/:peygamberId"
            element={
              <RequireAuth>
                <PeygamberDetailScreen />
              </RequireAuth>
            }
          />

          {/* Kitap detay — tam ekran (PDF okuma) */}
          <Route
            path="/kitaplar/:kitapId"
            element={
              <RequireAuth>
                <KitapDetailScreen />
              </RequireAuth>
            }
          />

          {/* Yönetici Paneli */}
          <Route
            path="/yonetici"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/yonetici/icerik"
            element={
              <RequireAuth>
                <ContentManagement />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
