import { NavLink, Outlet } from "react-router-dom"
import { BookOpen, Moon, User, Heart, Globe, Settings } from "lucide-react"

const tabs = [
  { to: "/", icon: BookOpen, label: "Din" },
  { to: "/kuran", icon: Moon, label: "Kur'an" },
  { to: "/namaz", icon: User, label: "Namaz" },
  { to: "/sureler", icon: Heart, label: "Sureler" },
  { to: "/peygamberler", icon: Globe, label: "Peygamberler" },
  { to: "/profil", icon: Settings, label: "Profil" },
]

export function StudentLayout() {
  return (
    <div className="min-h-svh bg-background pb-20">
      <Outlet />

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
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
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
