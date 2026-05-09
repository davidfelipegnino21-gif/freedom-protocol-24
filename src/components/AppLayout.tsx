import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, ClipboardList, Target, Wallet, User } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { Onboarding } from "./Onboarding";

const NAV = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/hoy", label: "Hoy", icon: ClipboardList },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/finanzas", label: "Finanzas", icon: Wallet },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppLayout() {
  const loc = useLocation();
  const s = useAppState();
  const hydrated = useHydrated();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>

      {/* Quiz como popup para usuarios nuevos */}
      {hydrated && !s.onboarded && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: "var(--bg-base)" }}
        >
          <Onboarding />
        </div>
      )}

      <main className="flex-1 w-full mx-auto pb-24 max-w-md">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: "rgba(7,7,7,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <div className="grid grid-cols-5 max-w-md mx-auto h-16">
          {NAV.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex flex-col items-center justify-center gap-1 relative"
                style={{ color: active ? "var(--red)" : "var(--text-4)" }}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="font-display text-[10px] font-medium tracking-wide">{n.label}</span>
                {active && (
                  <span
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{ background: "var(--red)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
