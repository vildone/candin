import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/lib/auth"
import { RequireAuth } from "@/components/RequireAuth"
import { StudentLayout } from "@/components/StudentLayout"
import { StudentDashboard } from "@/pages/student/Dashboard"
import { LessonScreen } from "@/pages/student/Lesson"
import { QuizScreen } from "@/pages/student/Quiz"
import { KuranScreen } from "@/pages/student/Kuran"
import { NamazScreen } from "@/pages/student/Namaz"
import { SurelerScreen } from "@/pages/student/Sureler"
import { PeygamberlerScreen } from "@/pages/student/Peygamberler"
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
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/kuran" element={<KuranScreen />} />
            <Route path="/namaz" element={<NamazScreen />} />
            <Route path="/sureler" element={<SurelerScreen />} />
            <Route path="/peygamberler" element={<PeygamberlerScreen />} />
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
