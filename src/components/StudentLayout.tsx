import { NavLink, Outlet } from "react-router-dom"
import { BookOpen, Moon, Heart, Globe, MessageSquare, Library } from "lucide-react"
import { Header } from "@/components/Header"

const tabs = [
  { to: "/", icon: BookOpen, label: "Dersler", end: true },
  { to: "/dualar", icon: Heart, label: "Dualar", end: false },
  { to: "/peygamberler", icon: Globe, label: "Peygamberler", end: false },
  { to: "/kitaplar", icon: Library, label: "Kitaplar", end: false },
  { to: "/namaz", icon: MessageSquare, label: "Namaz", end: false },
  { to: "/kuran", icon: Moon, label: "Kur'an", end: false },
]

export function StudentLayout() {
  return (
    <div className="min-h-svh bg-background pb-20">
      <Header />
      <Outlet />

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all ${
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex size-8 items-center justify-center rounded-full transition-all ${
                      isActive ? "bg-primary/15" : ""
                    }`}
                  >
                    <tab.icon className="size-5" />
                  </div>
                  <span className="text-xs font-semibold">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
